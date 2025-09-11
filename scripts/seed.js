// scripts/setup-db.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function setupDatabase() {
  console.log('🔄 Setting up database...');
  
  let prisma;
  
  try {
    prisma = new PrismaClient();
    
    // Test connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if tables exist
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Found ${userCount} existing users`);
    } catch (error) {
      console.log('⚠️ User table might not exist, creating...');
      // This will be handled by db push
    }
    
    // Create test users
    console.log('👤 Creating test users...');
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'admin@test.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        permissions: JSON.stringify(['CREATE', 'READ', 'UPDATE', 'DELETE']),
        companyId: 'company1',
      },
    });
    
    const managerUser = await prisma.user.upsert({
      where: { email: 'manager@test.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'manager@test.com',
        name: 'Manager User',
        password: hashedPassword,
        role: 'MANAGER',
        permissions: JSON.stringify(['READ', 'UPDATE']),
        companyId: 'company1',
      },
    });

    const normalUser = await prisma.user.upsert({
      where: { email: 'nomaluser@test.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'nomaluser@test.com',
        name: 'nomaluser',
        password: hashedPassword,
        role: 'NORMAL',
        permissions: JSON.stringify(['NO', 'NO']),
        companyId: 'company1',
      },
    });
    
    console.log('✅ Admin user created:', adminUser.email);
    console.log('✅ Manager user created:', managerUser.email);
    
    // Verify users
    const totalUsers = await prisma.user.count();
    console.log(`📊 Total users in database: ${totalUsers}`);
    
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
      }
    });
    
    console.log('📋 All users:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.error('Error details:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    throw error;
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupDatabase()
  .catch((error) => {
    console.error('Setup script failed:', error);
    process.exit(1);
  });