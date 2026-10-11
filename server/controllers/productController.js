const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { mapProduct } = require('../utils/mappers');

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function uniqueSlug(name, excludeId) {
  let base = slugify(name);
  let slug = base;
  let counter = 1;
  while (true) {
    const found = await prisma.product.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (!found) break;
    slug = `${base}-${counter++}`;
  }
  return slug;
}

const productInclude = {
  category: true,
  images: true,
  compatibleVehicles: true,
};

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 12);
  const skip = (page - 1) * limit;

  const where = { isActive: true };
  if (req.query.category) where.categoryId = parseInt(req.query.category);
  if (req.query.brand) where.brand = { contains: req.query.brand, mode: 'insensitive' };
  if (req.query.featured === 'true') where.isFeatured = true;
  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: 'insensitive' } },
      { description: { contains: req.query.search, mode: 'insensitive' } },
      { partNumber: { contains: req.query.search, mode: 'insensitive' } },
    ];
  }
  if (req.query.minPrice || req.query.maxPrice) {
    where.price = {};
    if (req.query.minPrice) where.price.gte = Number(req.query.minPrice);
    if (req.query.maxPrice) where.price.lte = Number(req.query.maxPrice);
  }

  const sortMap = {
    newest: { createdAt: 'desc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    popular: { sold: 'desc' },
  };
  const orderBy = sortMap[req.query.sort] || { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: limit, include: productInclude }),
    prisma.product.count({ where }),
  ]);

  res.json({ products: products.map(mapProduct), page, pages: Math.ceil(total / limit), total });
});

// GET /api/products/featured
const getFeaturedProducts = asyncHandler(async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: productInclude,
  });
  res.json(products.map(mapProduct));
});

// GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: productInclude,
  });
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
  res.json(mapProduct(product));
});

// GET /api/products/:id (admin)
const getProductById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const product = Number.isNaN(id)
    ? null
    : await prisma.product.findUnique({ where: { id }, include: productInclude });
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
  res.json(mapProduct(product));
});

// GET /api/products/admin
const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const where = {};
  if (req.query.category) where.categoryId = parseInt(req.query.category);
  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: 'insensitive' } },
      { partNumber: { contains: req.query.search, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: productInclude }),
    prisma.product.count({ where }),
  ]);

  res.json({ products: products.map(mapProduct), page, pages: Math.ceil(total / limit), total });
});

// Validación común
const productValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('description').trim().notEmpty().withMessage('La descripción es obligatoria'),
  body('price').isFloat({ min: 0 }).withMessage('Precio inválido'),
  body('stock').isInt({ min: 0 }).withMessage('Stock inválido'),
  body('category').notEmpty().withMessage('La categoría es obligatoria'),
];

// POST /api/products (admin)
const createProduct = [
  ...productValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, description, price, comparePrice, stock,
      category, brand, partNumber, compatibleVehicles,
      isFeatured, images,
    } = req.body;

    const slug = await uniqueSlug(name);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        stock: Number(stock),
        categoryId: parseInt(category),
        brand,
        partNumber,
        isFeatured: Boolean(isFeatured),
        images: {
          create: (images || []).map((img) => ({ url: img.url, publicId: img.publicId })),
        },
        compatibleVehicles: {
          create: (compatibleVehicles || []).map((v) => ({
            make: v.make, model: v.model, yearFrom: v.yearFrom, yearTo: v.yearTo,
          })),
        },
      },
      include: productInclude,
    });

    res.status(201).json(mapProduct(product));
  }),
];

// PUT /api/products/:id (admin)
const updateProduct = [
  ...productValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404);
      throw new Error('Producto no encontrado');
    }

    const {
      name, description, price, comparePrice, stock,
      category, brand, partNumber, compatibleVehicles,
      isFeatured, isActive, images,
    } = req.body;

    const data = {};
    if (name !== undefined) { data.name = name; data.slug = await uniqueSlug(name, id); }
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = Number(price);
    if (comparePrice !== undefined) data.comparePrice = comparePrice ? Number(comparePrice) : null;
    if (stock !== undefined) data.stock = Number(stock);
    if (category !== undefined) data.categoryId = parseInt(category);
    if (brand !== undefined) data.brand = brand;
    if (partNumber !== undefined) data.partNumber = partNumber;
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (images !== undefined) {
      data.images = {
        deleteMany: {},
        create: images.map((img) => ({ url: img.url, publicId: img.publicId })),
      };
    }
    if (compatibleVehicles !== undefined) {
      data.compatibleVehicles = {
        deleteMany: {},
        create: compatibleVehicles.map((v) => ({
          make: v.make, model: v.model, yearFrom: v.yearFrom, yearTo: v.yearTo,
        })),
      };
    }

    const updated = await prisma.product.update({ where: { id }, data, include: productInclude });
    res.json(mapProduct(updated));
  }),
];

// DELETE /api/products/:id (admin — soft delete)
const deleteProduct = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    res.status(404);
    throw new Error('Producto no encontrado');
  }
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  res.json({ message: 'Producto desactivado correctamente' });
});

// POST /api/products/upload-image (admin)
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No se proporcionó ninguna imagen');
  }
  const image = await prisma.storedImage.create({
    data: { data: req.file.buffer, mimeType: req.file.mimetype },
  });
  res.json({ url: `/api/images/${image.id}`, publicId: String(image.id) });
});

// DELETE /api/products/delete-image (admin)
const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    res.status(400);
    throw new Error('Se requiere el publicId');
  }
  await prisma.storedImage.deleteMany({ where: { id: parseInt(publicId) || 0 } });
  res.json({ message: 'Imagen eliminada' });
});

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  deleteImage,
};

