const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { mapUser } = require('../utils/mappers');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
const registerValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener mayúsculas, minúsculas y números'),
  body('phone').optional().trim(),
];

const register = [
  ...registerValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone },
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  }),
];

// POST /api/auth/login
const loginValidation = [
  body('email').isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

const login = [
  ...loginValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token: generateToken(user.id),
    });
  }),
];

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { addresses: true },
  });
  if (!user) {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
  res.json(mapUser(user));
});

module.exports = { register, login, getMe };
