const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const linkRoutes = require('./routes/linkRoutes');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// System Health Check
app.get('/healthz', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      ok: true,
      version: '1.0',
      uptime: process.uptime(),
      timestamp: new Date(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      version: '1.0',
      uptime: process.uptime(),
      database: 'disconnected',
    });
  }
});

app.use('/', linkRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
