import { PrismaClient, OrderStatus, Role, Category as PrismaCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Simulated delay for API responses (optional - remove for production)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// App types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'coffee' | 'tea' | 'snacks';
  featured?: boolean;
  sizes?: Array<{ name: string; price: number }>;
}

// Map Prisma category to app category
function mapCategory(category: PrismaCategory): 'coffee' | 'tea' | 'snacks' {
  switch (category) {
    case PrismaCategory.COFFEE: return 'coffee';
    case PrismaCategory.TEA: return 'tea';
    case PrismaCategory.SNACKS: return 'snacks';
    default: return 'snacks';
  }
}

// Map Prisma product to app product format
function mapProduct(product: any): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.basePrice,
    image: product.image,
    category: mapCategory(product.category),
    featured: product.featured,
    sizes: product.sizes?.map((s: any) => ({
      name: s.name,
      price: s.price,
    })),
  };
}

// Map Prisma order to app order format
function mapOrder(order: any) {
  return {
    id: order.id,
    items: order.items?.map((item: any) => ({
      product: mapProduct(item.product),
      quantity: item.quantity,
      size: item.size,
      total: item.total,
    })),
    total: order.total,
    status: order.status.toLowerCase() as 'pending' | 'preparing' | 'ready' | 'completed',
    customerName: order.customerName,
    notes: order.notes,
    timestamp: order.createdAt,
  };
}

export async function getProducts(
  category?: string,
  featured?: boolean,
  search?: string,
  limit?: number,
  offset?: number
): Promise<{ data: Product[]; success: boolean }> {
  await delay(300);

  const where: any = {};

  if (category) {
    where.category = category.toUpperCase();
  }

  if (featured) {
    where.featured = true;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { sizes: true },
    skip: offset,
    take: limit,
  });

  return { data: products.map(mapProduct), success: true };
}

export async function getProductById(id: string): Promise<{ data: Product; success: boolean }> {
  await delay(300);
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { sizes: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return { data: mapProduct(product), success: true };
}

export async function getFeaturedProducts(): Promise<{ data: Product[]; success: boolean }> {
  return getProducts(undefined, true);
}

export async function getProductsByCategory(category: 'coffee' | 'tea' | 'snacks'): Promise<{ data: Product[]; success: boolean }> {
  return getProducts(category);
}

export async function searchProducts(query: string): Promise<{ data: Product[]; success: boolean }> {
  return getProducts(undefined, undefined, query);
}

export async function getOrders(): Promise<{ data: any[]; success: boolean }> {
  await delay(300);
  
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: {
            include: { sizes: true },
          },
        },
      },
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return { data: orders.map(mapOrder), success: true };
}

export async function getOrderById(id: string): Promise<{ data: any; success: boolean }> {
  await delay(300);
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: { sizes: true },
          },
        },
      },
      user: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return { data: mapOrder(order), success: true };
}

export async function createOrder(input: { items: any[]; customerName: string; notes?: string }): Promise<{ data: any; success: boolean }> {
  await delay(500);

  const total = input.items.reduce((sum, item) => sum + item.total, 0);

  const newOrder = await prisma.order.create({
    data: {
      total,
      status: 'PENDING',
      customerName: input.customerName,
      notes: input.notes,
      items: {
        create: input.items.map((item: any) => ({
          quantity: item.quantity,
          size: item.size,
          total: item.total,
          productId: item.product.id,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: {
            include: { sizes: true },
          },
        },
      },
    },
  });

  return { data: mapOrder(newOrder), success: true };
}

export async function updateOrderStatus(id: string, status: 'pending' | 'preparing' | 'ready' | 'completed'): Promise<{ data: any; success: boolean }> {
  await delay(300);

  const statusMap = {
    'pending': 'PENDING',
    'preparing': 'PREPARING',
    'ready': 'READY',
    'completed': 'COMPLETED',
  };

  const order = await prisma.order.update({
    where: { id },
    data: { status: statusMap[status] as OrderStatus },
    include: {
      items: {
        include: {
          product: {
            include: { sizes: true },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return { data: mapOrder(order), success: true };
}

export async function login(email: string, password: string): Promise<{ data: any; success: boolean }> {
  await delay(500);
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return {
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
    },
    success: true,
  };
}

export async function register(data: { email: string; password: string; name?: string; phone?: string; role?: Role }): Promise<{ data: any; success: boolean }> {
  await delay(500);

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: data.role || Role.USER,
    },
  });

  return {
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
    },
    success: true,
  };
}

export async function getUserProfile(): Promise<{ data: any; success: boolean }> {
  await delay(300);
  
  // Get first user or return default
  const user = await prisma.user.findFirst();
  
  if (!user) {
    return {
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+62 812 3456 7890',
        loyaltyPoints: 150,
        role: 'USER',
      },
      success: true,
    };
  }

  return {
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      loyaltyPoints: user.loyaltyPoints,
      role: user.role,
    },
    success: true,
  };
}

export async function updateUserProfile(data: { name?: string; email?: string; phone?: string }): Promise<{ data: any; success: boolean }> {
  await delay(300);
  
  const user = await prisma.user.update({
    where: { email: data.email! },
    data,
  });

  return {
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      loyaltyPoints: user.loyaltyPoints,
      role: user.role,
    },
    success: true,
  };
}

export async function createProduct(data: {
  name: string;
  description?: string;
  basePrice: number;
  image: string;
  category: string;
  featured?: boolean;
  sizes?: Array<{ name: string; price: number }>;
}): Promise<{ data: any; success: boolean }> {
  await delay(300);

  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description || '',
      basePrice: data.basePrice,
      image: data.image,
      category: data.category as any,
      featured: data.featured || false,
      sizes: data.sizes ? {
        create: data.sizes.map(s => ({
          name: s.name,
          price: s.price,
        })),
      } : undefined,
    },
    include: { sizes: true },
  });

  return { data: mapProduct(product), success: true };
}

export async function updateProduct(id: string, data: any): Promise<{ data: any; success: boolean }> {
  await delay(300);

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      image: data.image,
      category: data.category,
      featured: data.featured,
      sizes: data.sizes ? {
        deleteMany: {},
        create: data.sizes.map((s: any) => ({
          name: s.name,
          price: s.price,
        })),
      } : undefined,
    },
    include: { sizes: true },
  });

  return { data: mapProduct(product), success: true };
}

export async function deleteProduct(id: string): Promise<{ success: boolean }> {
  await delay(300);

  await prisma.product.delete({
    where: { id },
  });

  return { success: true };
}
