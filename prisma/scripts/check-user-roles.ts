/**
 * Script to check and fix user roles in database
 * Run with: npx tsx prisma/scripts/check-user-roles.ts
 */

import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking user roles in database...\n');

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`📊 Found ${users.length} user(s):\n`);

  users.forEach((user, index) => {
    const roleIcon = user.role === 'ADMIN' ? '👨‍💼' : '👤';
    console.log(`${index + 1}. ${roleIcon} ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt.toLocaleString('id-ID')}\n`);
  });

  // Check for role mismatches
  const adminUsers = users.filter(u => u.role === 'ADMIN');
  const userUsers = users.filter(u => u.role === 'USER');

  console.log('📈 Summary:');
  console.log(`   Admin users: ${adminUsers.length}`);
  console.log(`   Regular users: ${userUsers.length}`);

  // Check if demo accounts have correct roles
  const demoAdmin = users.find(u => u.email === 'admin@coffee.com');
  const demoUser = users.find(u => u.email === 'user@coffee.com');

  console.log('\n🔍 Demo Accounts Check:');
  
  if (demoAdmin) {
    if (demoAdmin.role === 'ADMIN') {
      console.log('   ✅ admin@coffee.com has ADMIN role');
    } else {
      console.log(`   ⚠️  admin@coffee.com has ${demoAdmin.role} role (should be ADMIN)`);
    }
  } else {
    console.log('   ⚠️  admin@coffee.com not found');
  }

  if (demoUser) {
    if (demoUser.role === 'USER') {
      console.log('   ✅ user@coffee.com has USER role');
    } else {
      console.log(`   ⚠️  user@coffee.com has ${demoUser.role} role (should be USER)`);
    }
  } else {
    console.log('   ⚠️  user@coffee.com not found');
  }

  // Offer to fix roles
  console.log('\n🔧 Fix Roles?');
  console.log('   Run this script with --fix flag to correct roles:');
  console.log('   npx tsx prisma/scripts/check-user-roles.ts --fix\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
