// Modelo migrado a Prisma. Ver server/prisma/schema.prisma
module.exports = {};


const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de categoría es obligatorio'],
      trim: true,
      unique: true,
      maxlength: [80, 'El nombre no puede superar 80 caracteres'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [500, 'La descripción no puede superar 500 caracteres'],
    },
    image: {
      url: String,
      publicId: String,
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Generar slug automáticamente
categorySchema.pre('validate', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
