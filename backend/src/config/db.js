const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectDBs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');

    // Connect to PostgreSQL (Prisma implicitly connects, but we can test it)
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully via Prisma');
    
  } catch (error) {
    console.error('❌ Database connection failed', error);
    process.exit(1);
  }
};

module.exports = { connectDBs, prisma };
