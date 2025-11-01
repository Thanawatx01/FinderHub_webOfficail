const jwt = require('jsonwebtoken');
const { redisClient } = require('../redisClient');

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const cacheKey = `token:${payload.jti}`;
    const sessionRaw = await redisClient.get(cacheKey);

    if (!sessionRaw) {
      return res.status(401).json({ message: 'Session expired' });
    }

    const session = JSON.parse(sessionRaw);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      ...session,
    };
    req.token = {
      token,
      jti: payload.jti,
    };
    next();
  } catch (err) {
    console.error('Auth middleware error', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

