const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('./db');
const { redisClient } = require('./redisClient');
const authMiddleware = require('./middleware/auth');

const router = express.Router();

function buildTokenPayload(user, jti) {
  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    jti,
  };
}

async function storeSession(jti, userId, ttlSeconds) {
  const cacheKey = `token:${jti}`;
  await redisClient.set(cacheKey, JSON.stringify({ userId }), { EX: ttlSeconds });
}

router.post('/register', async (req, res) => {
  const { email, password, name, role = 'user' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query('SELECT id FROM user WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 10));
    const id = uuidv4();

    await connection.query(
      'INSERT INTO user (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
      [id, email, passwordHash, name || null, role]
    );

    res.status(201).json({ id, email, name, role });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Failed to register user' });
  } finally {
    connection.release();
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT id, email, password_hash AS passwordHash, name, role FROM user WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const jti = uuidv4();
    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    const expiresSeconds = typeof expiresIn === 'string' && expiresIn.endsWith('m')
      ? parseInt(expiresIn, 10) * 60
      : typeof expiresIn === 'string' && expiresIn.endsWith('h')
        ? parseInt(expiresIn, 10) * 60 * 60
        : Number(expiresIn) || 900;

    const token = jwt.sign(buildTokenPayload(user, jti), process.env.JWT_SECRET, { expiresIn });
    await storeSession(jti, user.id, expiresSeconds);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Failed to login' });
  } finally {
    connection.release();
  }
});

router.post('/logout', authMiddleware, async (req, res) => {
  if (!req.token) {
    return res.status(400).json({ message: 'No session to clear' });
  }

  try {
    await redisClient.del(`token:${req.token.jti}`);
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error', err);
    res.status(500).json({ message: 'Failed to logout' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

router.get('/users', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT id, email, name, role, created_at AS createdAt FROM user ORDER BY created_at DESC'
    );
    res.json({ users: rows });
  } catch (err) {
    console.error('Fetch users error', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  } finally {
    connection.release();
  }
});

module.exports = router;

