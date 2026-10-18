const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const { mapOrder } = require('../utils/mappers');

const orderItemInclude = { include: { product: { include: { images: true, compatibleVehicles: true, category: true } } } };
const STORE_ADDRESS = {
  street: 'Av. Vicuña Mackenna 1080',
  city: 'Peñaflor',
  region: 'Metropolitana de Santiago',
  commune: 'Peñaflor',
};

const isBeforeSameDayCutoff = () => {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Santiago',
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(new Date())
  );
  return hour < 12;
};

// POST /api/orders
const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('El pedido debe tener al menos un item'),
  body('items.*.product').notEmpty().withMessage('ID de producto requerido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Cantidad mínima es 1'),
  body('deliveryMethod').optional().isIn(['standard', 'same_day', 'pickup']).withMessage('Método de entrega no válido'),
  body('shippingAddress.street').if((value, { req }) => req.body.deliveryMethod !== 'pickup').notEmpty().withMessage('La calle es obligatoria'),
  body('shippingAddress.city').if((value, { req }) => req.body.deliveryMethod !== 'pickup').notEmpty().withMessage('La ciudad es obligatoria'),
  body('shippingAddress.region').if((value, { req }) => req.body.deliveryMethod !== 'pickup').notEmpty().withMessage('La región es obligatoria'),
];

const createOrder = [
  ...orderValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shippingAddress, notes } = req.body;
    const deliveryMethod = req.body.deliveryMethod || 'standard';

    if (deliveryMethod === 'same_day' && !isBeforeSameDayCutoff()) {
      return res.status(400).json({ message: 'El despacho en el día está disponible para compras antes de las 12:00 (hora de Chile).' });
    }
    if (
      deliveryMethod === 'same_day' &&
      shippingAddress.commune?.trim().localeCompare('Peñaflor', 'es', { sensitivity: 'base' }) !== 0
    ) {
      return res.status(400).json({ message: 'El despacho en el día está disponible solo en Peñaflor.' });
    }

    const productIds = items.map((i) => parseInt(i.product));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { images: true },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Uno o más productos no están disponibles.' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === parseInt(item.product));
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`,
        });
      }
      subtotal += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
      });
    }

    const shippingCost = deliveryMethod === 'pickup' ? 0 : subtotal >= 50000 ? 0 : 3990;
    const total = subtotal + shippingCost;
    const shippingAddressData = deliveryMethod === 'pickup' ? STORE_ADDRESS : shippingAddress;

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        subtotal,
        shippingCost,
        deliveryMethod,
        total,
        notes,
        recipientName: shippingAddress.recipientName,
        street: shippingAddressData.street,
        city: shippingAddressData.city,
        region: shippingAddressData.region,
        commune: shippingAddressData.commune,
        postalCode: deliveryMethod === 'pickup' ? null : shippingAddress.postalCode,
        shippingPhone: shippingAddress.phone,
        items: { create: orderItems },
        statusHistory: { create: [{ status: 'pending', note: 'Pedido creado' }] },
      },
      include: { items: orderItemInclude, statusHistory: true },
    });

    res.status(201).json(mapOrder(order));
  }),
];

// GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { items: orderItemInclude, statusHistory: true },
    }),
    prisma.order.count({ where: { userId: req.user.id } }),
  ]);

  res.json({ orders: orders.map(mapOrder), page, pages: Math.ceil(total / limit), total });
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true, items: orderItemInclude, statusHistory: true },
  });

  if (!order) {
    res.status(404);
    throw new Error('Pedido no encontrado');
  }

  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    res.status(403);
    throw new Error('No autorizado para ver este pedido');
  }

  res.json(mapOrder(order));
});

// GET /api/orders (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: true, items: true, statusHistory: true },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ orders: orders.map(mapOrder), page, pages: Math.ceil(total / limit), total });
});

// PUT /api/orders/:id/status (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  const id = parseInt(req.params.id);
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) {
    res.status(404);
    throw new Error('Pedido no encontrado');
  }

  if (status === 'cancelled' && order.paymentStatus !== 'refunded') {
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }

  if (status === 'delivered') {
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { sold: { increment: item.quantity } },
      });
    }
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
      statusHistory: { create: [{ status, note: note || '' }] },
    },
    include: { user: true, items: orderItemInclude, statusHistory: true },
  });

  if (req.io) {
    req.io.to('admin').emit('orderUpdated', { orderId: id, status });
  }

  res.json(mapOrder(updated));
});

// GET /api/orders/stats (admin)
const getOrderStats = asyncHandler(async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOrders, totalOrders, pendingOrders, revenueData] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.aggregate({ where: { paymentStatus: 'paid' }, _sum: { total: true } }),
  ]);

  res.json({
    todayOrders,
    totalOrders,
    pendingOrders,
    totalRevenue: revenueData._sum.total || 0,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
};
