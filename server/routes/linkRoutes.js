const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

function generateCode() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create Link
router.post('/api/links', async (req, res) => {
  const { url, shortCode } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    new URL(url);
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Invalid code format, Must include hpps:// or https://' });
  }

  let code = shortCode;

  if (code) {
    // Validate custom code
    if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
      return res
        .status(400)
        .json({ error: 'Code must be 6-8 alphanumeric characters.' });
    }
    // Check duplicate
    const existing = await prisma.link.findUnique({
      where: { shortCode: code },
    });
    if (existing) return res.status(409).json({ error: 'Code already in use' });
  } else {
    code = generateCode();
    const existing = await prisma.link.findUnique({
      where: { shortCode: code },
    });
    if (existing) code = generateCode();
  }

  try {
    const newLink = await prisma.link.create({
      data: { originalUrl: url, shortCode: code },
    });
    res.status(201).json(newLink);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List All Links
router.get('/api/links', async (req, res) => {
  const links = await prisma.link.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(links);
});

// Get Link Stats
router.get('/api/links/:code', async (req, res) => {
  const { code } = req.params;
  const link = await prisma.link.findUnique({ where: { shortCode: code } });
  if (!link) return res.status(404).json({ error: 'Link not found' });
  res.json(link);
});

// Delete
router.delete('/api/links/:code', async (req, res) => {
  const { code } = req.params;
  try {
    await prisma.link.delete({ where: { shortCode: code } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Link not found' });
  }
});

// Redirect Endpoint
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const link = await prisma.link.update({
      where: { shortCode: code },
      data: { clicks: { increment: 1 }, lastClickedAt: new Date() },
    });
    res.redirect(302, link.originalUrl);
  } catch (error) {
    res.status(404).json({ error: 'Short link not found' });
  }
});

module.exports = router;
