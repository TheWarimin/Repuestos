const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { mapUser } = require('../utils/mappers');

// GET /api/users (admin)
const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const where = {};
  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: 'insensitive' } },
      { email: { contains: req.query.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { addresses: true } }),
    prisma.user.count({ where }),
  ]);

  res.json({ users: users.map(mapUser), page, pages: Math.ceil(total / limit), total });
});

// GET /api/users/:id (admin)
const getUserById = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { addresses: true },
  });
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
  res.json(mapUser(user));
});

// PUT /api/users/profile
const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('email').optional().isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('phone').optional().trim(),
];

const updateProfile = [
  ...updateProfileValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone } = req.body;
    const id = req.user.id;

    if (email) {
      const exists = await prisma.user.findFirst({ where: { email, id: { not: id } } });
      if (exists) {
        return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
      }
    }

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (phone !== undefined) data.phone = phone;

    const updated = await prisma.user.update({ where: { id }, data, include: { addresses: true } });
    res.json(mapUser(updated));
  }),
];

// PUT /api/users/change-password
const changePassword = [
  body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener mayúsculas, minúsculas y números'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
    }

    const hashed = await bcrypt.hash(req.body.newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Contraseña actualizada correctamente.' });
  }),
];

// PUT /api/users/addresses
const updateAddresses = asyncHandler(async (req, res) => {
  const { addresses, defaultAddress } = req.body;
  const id = req.user.id;

  const data = {};
  if (defaultAddress !== undefined) data.defaultAddress = defaultAddress;
  if (addresses) {
    data.addresses = {
      deleteMany: {},
      create: addresses.map((a) => ({
        street: a.street,
        city: a.city,
        region: a.region,
        commune: a.commune,
        postalCode: a.postalCode,
        phone: a.phone,
      })),
    };
  }

  const updated = await prisma.user.update({ where: { id }, data, include: { addresses: true } });
  res.json(mapUser(updated));
});

// PUT /api/users/:id (admin)
const adminUpdateUser = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  const { role, isActive } = req.body;
  const data = {};
  if (role && ['user', 'admin'].includes(role)) data.role = role;
  if (isActive !== undefined) data.isActive = isActive;

  const updated = await prisma.user.update({ where: { id }, data, include: { addresses: true } });
  res.json(mapUser(updated));
});

module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  changePassword,
  updateAddresses,
  adminUpdateUser,
};
