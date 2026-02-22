/**
 * Script to fix user roles in database
 * Run with: npx tsx prisma/scripts/fix-user-roles.ts
 */

import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing user roles in database...\n');

  // Fix admin account
  const admin = await prisma.user.update({
    where: { email: 'admin@coffee.com' },
    data: { role: Role.ADMIN },
  });
  console.log('✅ Fixed admin@coffee.com → ADMIN');

  // Fix user account
  const user = await prisma.user.update({
    where: { email: 'user@coffee.com' },
    data: { role: Role.USER },
  });
  console.log('✅ Fixed user@coffee.com → USER');

  console.log('\n📊 Updated Users:');
  console.log(`   ${admin.name} (${admin.email}) → ${admin.role}`);
  console.log(`   ${user.name} (${user.email}) → ${user.role}`);

  console.log('\n✨ User roles fixed successfully!');
  console.log('   You can now login with:');
  console.log('   - admin@coffee.com / adminpassword (ADMIN)');
  console.log('   - user@coffee.com / userpassword (USER)\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
