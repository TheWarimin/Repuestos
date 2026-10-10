const asyncHandler = require('express-async-handler');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const crypto = require('crypto');
const prisma = require('../utils/prisma');

const getMPClient = () =>
  new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 5000 },
  });

// POST /api/payment/create-preference
const createPreference = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId) },
    include: { items: true },
  });
  if (!order) {
    res.status(404);
    throw new Error('Pedido no encontrado');
  }

  if (order.userId !== req.user.id) {
    res.status(403);
    throw new Error('No autorizado');
  }

  if (order.paymentStatus === 'paid') {
    return res.status(400).json({ message: 'Este pedido ya fue pagado.' });
  }

  const client = getMPClient();
  const preferenceClient = new Preference(client);

  const mpItems = order.items.map((item) => ({
    id: String(item.productId),
    title: item.name,
    quantity: item.quantity,
    unit_price: item.price,
    currency_id: 'CLP',
    picture_url: item.image || undefined,
  }));

  if (order.shippingCost > 0) {
    mpItems.push({
      id: 'shipping',
      title: 'Costo de envío',
      quantity: 1,
      unit_price: order.shippingCost,
      currency_id: 'CLP',
    });
  }

  const preference = await preferenceClient.create({
    body: {
      items: mpItems,
      payer: { name: req.user.name, email: req.user.email },
      back_urls: {
        success: `${process.env.CLIENT_URL}/checkout/success?orderId=${order.id}`,
        failure: `${process.env.CLIENT_URL}/checkout/failure?orderId=${order.id}`,
        pending: `${process.env.CLIENT_URL}/checkout/pending?orderId=${order.id}`,
      },
      auto_return: 'approved',
      external_reference: String(order.id),
      notification_url: `${process.env.CLIENT_URL}/api/payment/webhook`,
      statement_descriptor: 'Repuestos Automotrices',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { mpPreferenceId: preference.id },
  });

  res.json({
    preferenceId: preference.id,
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point,
  });
});

// POST /api/payment/webhook
const webhook = asyncHandler(async (req, res) => {
  const { type, data } = req.body;

  const signature = req.headers['x-signature'];
  const requestId = req.headers['x-request-id'];

  if (signature && process.env.MP_WEBHOOK_SECRET) {
    const [tsPart, v1Part] = (signature || '').split(',');
    const ts = tsPart?.split('=')[1];
    const v1 = v1Part?.split('=')[1];

    const manifest = `id:${data?.id};request-id:${requestId};ts:${ts};`;
    const expectedSign = crypto
      .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
      .update(manifest)
      .digest('hex');

    if (v1 !== expectedSign) {
      return res.status(401).json({ message: 'Firma inválida' });
    }
  }

  if (type === 'payment' && data?.id) {
    try {
      const client = getMPClient();
      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: data.id });

      const orderId = parseInt(payment.external_reference);
      if (!orderId) return res.status(200).json({ received: true });

      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order) return res.status(200).json({ received: true });

      if (payment.status === 'approved') {
        const updateData = { paymentStatus: 'paid', paymentId: String(payment.id) };

        if (order.status === 'pending') {
          updateData.status = 'processing';
          updateData.statusHistory = {
            create: [{ status: 'processing', note: `Pago aprobado. ID MercadoPago: ${payment.id}` }],
          };
        }

        await prisma.order.update({ where: { id: orderId }, data: updateData });

        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        if (req.io) {
          req.io.to('admin').emit('newOrder', { orderId: order.id, total: order.total, createdAt: order.createdAt });
        }
      } else if (['rejected', 'cancelled'].includes(payment.status)) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'failed', paymentId: String(payment.id) },
        });
      }
    } catch (err) {
      console.error('Error procesando webhook MP:', err.message);
    }
  }

  res.status(200).json({ received: true });
});

module.exports = { createPreference, webhook };
