import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Upsert Admin
  const adminPassword = await bcrypt.hash('adminpassword', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@coffee.com' },
    update: {},
    create: {
      email: 'admin@coffee.com',
      name: 'Super Admin',
      password: adminPassword,
      role: Role.ADMIN,
      loyaltyPoints: 0,
    },
  });
  console.log({ admin });

  // Upsert User
  const userPassword = await bcrypt.hash('userpassword', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@coffee.com' },
    update: {},
    create: {
      email: 'user@coffee.com',
      name: 'Coffee Lover',
      password: userPassword,
      role: Role.USER,
      loyaltyPoints: 100,
    },
  });
  console.log({ user });

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
