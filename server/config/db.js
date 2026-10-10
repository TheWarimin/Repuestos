const prisma = require('../utils/prisma');

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL conectado via Prisma');
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
