const express = require('express');
const prisma = require('../utils/prisma');

const router = express.Router();

// GET /api/images/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(404).end();

    const image = await prisma.storedImage.findUnique({ where: { id } });
    if (!image) return res.status(404).end();

    res.set('Content-Type', image.mimeType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(Buffer.from(image.data));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
