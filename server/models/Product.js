// Modelo migrado a Prisma. Ver server/prisma/schema.prisma
module.exports = {};

  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
      maxlength: [200, 'El nombre no puede superar 200 caracteres'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      maxlength: [2000, 'La descripción no puede superar 2000 caracteres'],
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    comparePrice: {
      type: Number,
      min: [0, 'El precio comparativo no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es obligatoria'],
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, 'La marca no puede superar 100 caracteres'],
    },
    partNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    compatibleVehicles: [
      {
        make: String,
        model: String,
        yearFrom: Number,
        yearTo: Number,
      },
    ],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Generar slug automáticamente
productSchema.pre('validate', function (next) {
  if (this.isModified('name') || this.isNew) {
    const baseSlug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    this.slug = `${baseSlug}-${Date.now()}`;
  }
  next();
});

// Índices para búsqueda
productSchema.index({ name: 'text', description: 'text', brand: 'text', partNumber: 'text' });
productSchema.index({ category: 1, isActive: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
