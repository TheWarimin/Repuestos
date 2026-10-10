// Modelo migrado a Prisma. Ver server/prisma/schema.prisma
module.exports = {};
 = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const shippingAddressSchema = new mongoose.Schema({
  recipientName: String,
  street: { type: String, required: true },
  city: { type: String, required: true },
  region: { type: String, required: true },
  commune: String,
  postalCode: String,
  phone: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'El pedido debe tener al menos un item'],
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'mercadopago' },
    paymentId: { type: String },
    mpPreferenceId: { type: String },
    notes: { type: String, maxlength: 500 },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// Índices
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentId: 1 });

module.exports = mongoose.model('Order', orderSchema);
