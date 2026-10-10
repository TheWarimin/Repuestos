const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { mapCategory } = require('../utils/mappers');

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// GET /api/categories
const getCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });
  res.json(categories.map(mapCategory));
});

// GET /api/categories/:slug
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await prisma.category.findFirst({
    where: { slug: req.params.slug, isActive: true },
  });
  if (!category) {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }
  res.json(mapCategory(category));
});

// POST /api/categories (admin)
const categoryValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 80 }),
  body('description').optional().isLength({ max: 500 }),
];

const createCategory = [
  ...categoryValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, image, order } = req.body;

    const existing = await prisma.category.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' } },
    });
    if (existing) {
      return res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slugify(name.trim()),
        description,
        imageUrl: image?.url,
        imagePublicId: image?.publicId,
        order: order || 0,
      },
    });
    res.status(201).json(mapCategory(category));
  }),
];

// PUT /api/categories/:id (admin)
const updateCategory = [
  ...categoryValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404);
      throw new Error('Categoría no encontrada');
    }

    const { name, description, image, isActive, order } = req.body;
    const data = {};
    if (name !== undefined) { data.name = name; data.slug = slugify(name); }
    if (description !== undefined) data.description = description;
    if (image !== undefined) { data.imageUrl = image?.url; data.imagePublicId = image?.publicId; }
    if (isActive !== undefined) data.isActive = isActive;
    if (order !== undefined) data.order = order;

    const updated = await prisma.category.update({ where: { id }, data });
    res.json(mapCategory(updated));
  }),
];

// DELETE /api/categories/:id (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }
  await prisma.category.update({ where: { id }, data: { isActive: false } });
  res.json({ message: 'Categoría desactivada correctamente' });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
