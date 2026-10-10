const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const { Server } = require('socket.io');

dotenv.config();

const connectDB = require('./config/db');
const { initSocket } = require('./utils/socket');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

connectDB();

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});
initSocket(io);

// Seguridad
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas solicitudes, inténtalo más tarde.' },
});

// Rate limiting para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.' },
});

app.use('/api/', globalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Adjuntar io a cada request
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Rutas
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejador de errores global
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Error interno del servidor',
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n Servidor corriendo en http://localhost:${PORT}`);
  console.log(` Socket.io activo`);
});
