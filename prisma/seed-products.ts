import { PrismaClient, Category } from '@prisma/client';

const prisma = new PrismaClient();

const productsData = [
  {
    name: 'Espresso',
    description: 'Rich and bold Italian espresso',
    basePrice: 25000,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80',
    category: 'COFFEE' as Category,
    featured: true,
    sizes: [
      { name: 'Single', price: 25000 },
      { name: 'Double', price: 35000 },
    ],
  },
  {
    name: 'Cappuccino',
    description: 'Creamy espresso with steamed milk foam',
    basePrice: 35000,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80',
    category: 'COFFEE' as Category,
    featured: true,
    sizes: [
      { name: 'Regular', price: 35000 },
      { name: 'Large', price: 42000 },
    ],
  },
  {
    name: 'Caffe Latte',
    description: 'Smooth espresso with silky steamed milk',
    basePrice: 38000,
    image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=800&q=80',
    category: 'COFFEE' as Category,
    featured: true,
    sizes: [
      { name: 'Regular', price: 38000 },
      { name: 'Large', price: 45000 },
    ],
  },
  {
    name: 'Americano',
    description: 'Espresso diluted with hot water',
    basePrice: 28000,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    category: 'COFFEE' as Category,
    featured: false,
    sizes: [
      { name: 'Regular', price: 28000 },
      { name: 'Large', price: 35000 },
    ],
  },
  {
    name: 'Mocha',
    description: 'Espresso with chocolate and steamed milk',
    basePrice: 42000,
    image: 'https://images.unsplash.com/photo-1607260550778-aa9d29444ce1?w=800&q=80',
    category: 'COFFEE' as Category,
    featured: false,
    sizes: [
      { name: 'Regular', price: 42000 },
      { name: 'Large', price: 50000 },
    ],
  },
  {
    name: 'Cold Brew',
    description: 'Smooth cold-steeped coffee',
    basePrice: 40000,
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80',
    category: 'COFFEE' as Category,
    featured: false,
    sizes: [],
  },
  {
    name: 'Green Tea Latte',
    description: 'Creamy matcha green tea',
    basePrice: 38000,
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&q=80',
    category: 'TEA' as Category,
    featured: true,
    sizes: [
      { name: 'Regular', price: 38000 },
      { name: 'Large', price: 45000 },
    ],
  },
  {
    name: 'Earl Grey Tea',
    description: 'Classic black tea with bergamot',
    basePrice: 25000,
    image: 'https://images.unsplash.com/photo-1597318112693-13670f1d0c27?w=800&q=80',
    category: 'TEA' as Category,
    featured: false,
    sizes: [],
  },
  {
    name: 'Jasmine Tea',
    description: 'Fragrant green tea with jasmine flowers',
    basePrice: 25000,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
    category: 'TEA' as Category,
    featured: false,
    sizes: [],
  },
  {
    name: 'Thai Tea',
    description: 'Sweet and creamy Thai-style tea',
    basePrice: 32000,
    image: 'https://images.unsplash.com/photo-1623909472779-648c496ce1d5?w=800&q=80',
    category: 'TEA' as Category,
    featured: false,
    sizes: [],
  },
  {
    name: 'Croissant',
    description: 'Buttery French pastry',
    basePrice: 28000,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
    category: 'SNACKS' as Category,
    featured: false,
    sizes: [],
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate layer cake',
    basePrice: 35000,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    category: 'SNACKS' as Category,
    featured: true,
    sizes: [],
  },
  {
    name: 'Blueberry Muffin',
    description: 'Moist muffin with fresh blueberries',
    basePrice: 25000,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&q=80',
    category: 'SNACKS' as Category,
    featured: false,
    sizes: [],
  },
  {
    name: 'Chicken Sandwich',
    description: 'Fresh chicken and vegetable sandwich',
    basePrice: 45000,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80',
    category: 'SNACKS' as Category,
    featured: false,
    sizes: [],
  },
];

async function main() {
  console.log('Start seeding products...');

  // Check if products already exist
  const existingCount = await prisma.product.count();
  if (existingCount > 0) {
    console.log(`⚠️  Database already has ${existingCount} products. Skipping seed.`);
    console.log('   If you want to re-seed, please truncate the products table first.');
    return;
  }

  for (const productData of productsData) {
    const { sizes, ...productInfo } = productData;

    const product = await prisma.product.create({
      data: productInfo,
    });

    console.log(`✓ ${product.name}`);

    // Create sizes
    if (sizes.length > 0) {
      for (const size of sizes) {
        await prisma.size.create({
          data: {
            ...size,
            productId: product.id,
          },
        });
      }
    }
  }

  const count = await prisma.product.count();
  console.log(`\n✅ Seeded ${count} products.`);
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
