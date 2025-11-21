const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Helper: Generate Random Code (6 chars) ---
function generateCode() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// --- 1. Health Check (Required by spec) ---
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, version: '1.0' });
});

// --- 2. Create Link ---
app.post('/api/links', async (req, res) => {
  const { url, shortCode } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Use provided code or generate a new one
  let code = shortCode;

  if (code) {
    // Validate custom code format [A-Za-z0-9]{6,8}
    const codeRegex = /^[A-Za-z0-9]{6,8}$/;
    if (!codeRegex.test(code)) {
      return res
        .status(400)
        .json({ error: 'Code must be 6-8 alphanumeric characters.' });
    }

    // Check if exists
    const existing = await prisma.link.findUnique({
      where: { shortCode: code },
    });
    if (existing) {
      return res.status(409).json({ error: 'Code already in use' }); // 409 Conflict as requested
    }
  } else {
    // Generate unique code
    code = generateCode();
    // Simple collision check (in production, you'd retry)
    const existing = await prisma.link.findUnique({
      where: { shortCode: code },
    });
    if (existing) code = generateCode();
  }

  try {
    const newLink = await prisma.link.create({
      data: {
        originalUrl: url,
        shortCode: code,
      },
    });
    res.status(201).json(newLink);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- 3. List All Links (Dashboard) ---
app.get('/api/links', async (req, res) => {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(links);
});

// --- 4. Get Link Stats ---
app.get('/api/links/:code', async (req, res) => {
  const { code } = req.params;
  const link = await prisma.link.findUnique({ where: { shortCode: code } });

  if (!link) return res.status(404).json({ error: 'Link not found' });
  res.json(link);
});

// --- 5. Delete Link ---
app.delete('/api/links/:code', async (req, res) => {
  const { code } = req.params;
  try {
    await prisma.link.delete({ where: { shortCode: code } });
    res.status(204).send(); // 204 No Content is standard for delete
  } catch (error) {
    res.status(404).json({ error: 'Link not found' });
  }
});

// --- 6. Redirect Endpoint (Must be at the bottom to avoid conflicts) ---
app.get('/:code', async (req, res) => {
  const { code } = req.params;

  try {
    // Update stats and get URL atomically
    const link = await prisma.link.update({
      where: { shortCode: code },
      data: {
        clicks: { increment: 1 },
        lastClickedAt: new Date(),
      },
    });

    // HTTP 302 Redirect
    res.redirect(302, link.originalUrl);
  } catch (error) {
    // If update fails (link doesn't exist), return 404
    res.status(404).sendFile('404.html', { root: __dirname }); // Optional: serve a 404 page
    // OR just json:
    // res.status(404).json({ error: "Short link not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
