require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/authRoutes');
const { connectRedis, redisClient } = require('./src/redisClient');
const { ensureTables, pool } = require('./src/db');
const lostItemRoutes = require('./src/lostItemRoutes');

const app = express();

const corsOptions = {
  origin: '*', // หรือ config ตามต้องการ
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// ใช้ path แบบ parameter แทน wildcard
app.use(cors({
    origin: '*', // หรือ config ตามต้องการ
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true,
  }));
  
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/lost-items', lostItemRoutes);

const port = Number(process.env.PORT || 4000);

// --- ใส่ฟังก์ชัน wait ---
async function waitForDatabase(retries = 10, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      conn.release();
      console.log('MySQL ready');
      return;
    } catch (err) {
      console.log(`Waiting for MySQL... (${i + 1})`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('MySQL not ready after retries');
}

async function waitForRedis(retries = 10, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      if (!redisClient.isOpen) await redisClient.connect();
      console.log('Redis ready');
      return;
    } catch (err) {
      console.log(`Waiting for Redis... (${i + 1})`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('Redis not ready after retries');
}

// --- bootstrap ---
async function bootstrap() {
  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');

    console.log('Waiting for MySQL...');
    await waitForDatabase();

    console.log('Ensuring tables...');
    await ensureTables();
    console.log('Tables ensured.');

    console.log('Waiting for Redis...');
    await waitForRedis();
    console.log('Redis connected.');

    app.listen(port, () => {
      console.log(`Backend server listening on port ${port}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

module.exports = app;
