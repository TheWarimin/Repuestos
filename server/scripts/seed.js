require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Motor', description: 'Piezas y repuestos para el motor del vehículo', order: 1 },
  { name: 'Frenos', description: 'Pastillas, discos, tambores y sistemas de freno', order: 2 },
  { name: 'Suspensión', description: 'Amortiguadores, resortes y componentes de suspensión', order: 3 },
  { name: 'Eléctrico', description: 'Baterías, alternadores, luces y sistema eléctrico', order: 4 },
  { name: 'Transmisión', description: 'Embrague, caja de cambios y componentes de transmisión', order: 5 },
  { name: 'Refrigeración', description: 'Radiadores, termostatos y sistema de refrigeración', order: 6 },
  { name: 'Dirección', description: 'Componentes de dirección y alineación', order: 7 },
  { name: 'Carrocería', description: 'Espejos, parachoques y piezas de carrocería', order: 8 },
];

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const seed = async () => {
  try {
    console.log('Conectando a PostgreSQL...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@repuestos.cl';
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existing) {
      const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin1234!', 12);
      await prisma.user.create({
        data: {
          name: process.env.ADMIN_NAME || 'Administrador',
          email: adminEmail,
          password: hashed,
          role: 'admin',
        },
      });
      console.log(`Usuario admin creado: ${adminEmail}`);
    } else {
      console.log(`Admin ya existe: ${adminEmail}`);
    }

    for (const cat of CATEGORIES) {
      const exists = await prisma.category.findFirst({ where: { name: cat.name } });
      if (!exists) {
        await prisma.category.create({ data: { ...cat, slug: slugify(cat.name) } });
        console.log(`Categoría creada: ${cat.name}`);
      }
    }

    console.log('\n Seed completado exitosamente');
    console.log(`\n Admin: ${adminEmail}`);
    console.log(` Contraseña: ${process.env.ADMIN_PASSWORD || 'Admin1234!'}`);
    process.exit(0);
  } catch (error) {
    console.error(' Error en seed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seed();

const CATEGORIES = [
  { name: 'Motor', description: 'Piezas y repuestos para el motor del vehículo', order: 1 },
  { name: 'Frenos', description: 'Pastillas, discos, tambores y sistemas de freno', order: 2 },
  { name: 'Suspensión', description: 'Amortiguadores, resortes y componentes de suspensión', order: 3 },
  { name: 'Eléctrico', description: 'Baterías, alternadores, luces y sistema eléctrico', order: 4 },
  { name: 'Transmisión', description: 'Embrague, caja de cambios y componentes de transmisión', order: 5 },
  { name: 'Refrigeración', description: 'Radiadores, termostatos y sistema de refrigeración', order: 6 },
  { name: 'Dirección', description: 'Componentes de dirección y alineación', order: 7 },
  { name: 'Carrocería', description: 'Espejos, parachoques y piezas de carrocería', order: 8 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Crear usuario admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@repuestos.cl';
    const existing = await User.findOne({ email: adminEmail });

    if (!existing) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Administrador',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin1234!',
        role: 'admin',
      });
      console.log(`Usuario admin creado: ${adminEmail}`);
    } else {
      console.log(`Admin ya existe: ${adminEmail}`);
    }

    // Crear categorías si no existen
    for (const cat of CATEGORIES) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`Categoría creada: ${cat.name}`);
      }
    }

    console.log('\n Seed completado exitosamente');
    console.log(`\n Admin: ${adminEmail}`);
    console.log(` Contraseña: ${process.env.ADMIN_PASSWORD || 'Admin1234!'}`);
    process.exit(0);
  } catch (error) {
    console.error(' Error en seed:', error.message);
    process.exit(1);
  }
};

seed();
