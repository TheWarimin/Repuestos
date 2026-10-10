const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

const verifyToken = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('No autorizado. Token no proporcionado.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('No autorizado. Usuario no encontrado o inactivo.');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('No autorizado. Token inválido o expirado.');
  }
});

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Acceso denegado. Se requieren permisos de administrador.');
};

module.exports = { verifyToken, isAdmin };
