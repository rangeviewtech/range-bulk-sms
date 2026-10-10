import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function testDatabase() {
  console.log('🔍 Testing Prisma Postgres connection (Prisma v7)...\n');

  try {
    // Test 1: Check raw query connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connected to database successfully!');

    // Test 2: Verify model queries work
    const userCount = await prisma.user.count();
    console.log(`📋 Database model test: Found ${userCount} existing user(s).`);

    console.log('\n🎉 All checks passed! Prisma v7 setup and database connection are verified.\n');
  } catch (error) {
    console.error('❌ Database connection test error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
