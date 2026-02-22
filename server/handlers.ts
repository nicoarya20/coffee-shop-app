import { PrismaClient, OrderStatus, Role, Category as PrismaCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { uploadFile as uploadToCloudinary } from './services/cloudinary.js';

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
  console.log('📦 Mapping product:', {
    id: product.id,
    name: product.name,
    image: product.image,
    imageUrl: product.imageUrl,
    gdriveFileId: product.gdriveFileId,
  });

  // Use imageUrl if available (from Google Drive), fallback to image field
  const imageUrl = product.imageUrl || product.image;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.basePrice,
    image: imageUrl,
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
  await delay(300);
  
  const products = await prisma.product.findMany({
    where: { featured: true },
    include: { sizes: true },
  });
  
  console.log('🌟 Featured products fetched:', products.length);
  
  return { data: products.map(mapProduct), success: true };
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

export async function createOrder(input: { items: any[]; customerName: string; notes?: string; userId?: string }): Promise<{ data: any; success: boolean }> {
  await delay(500);

  const total = input.items.reduce((sum, item) => sum + item.total, 0);

  console.log('📝 Creating order:', {
    customerName: input.customerName,
    total,
    userId: input.userId,
    itemCount: input.items.length,
  });

  const newOrder = await prisma.order.create({
    data: {
      total,
      status: 'PENDING',
      customerName: input.customerName,
      notes: input.notes,
      userId: input.userId || null, // Link order to user if provided
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

  console.log('✅ Order created:', { orderId: newOrder.id, userId: newOrder.userId });

  return { data: mapOrder(newOrder), success: true };
}

export async function updateOrderStatus(id: string, status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'): Promise<{ data: any; success: boolean }> {
  await delay(300);

  const statusMap = {
    'pending': 'PENDING',
    'preparing': 'PREPARING',
    'ready': 'READY',
    'completed': 'COMPLETED',
    'cancelled': 'CANCELLED',
  };

  console.log('📝 Updating order status:', { orderId: id, status, mappedStatus: statusMap[status] });

  // Get current order to check if status is changing to completed
  const currentOrder = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, user: true },
  });

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

  // Award loyalty points when order is completed
  if (statusMap[status] === 'COMPLETED' && currentOrder?.status !== 'COMPLETED') {
    console.log('🎯 Order completed, calculating points...', {
      orderId: order.id,
      userId: order.userId,
      customerName: order.customerName,
      itemCount: order.items.length,
    });
    
    const pointsEarned = calculateLoyaltyPoints(order);
    
    console.log('📊 Points calculated:', {
      basePoints: pointsEarned,
      hasUserId: !!order.userId,
    });
    
    if (pointsEarned > 0 && order.userId) {
      // Update user points
      const updatedUser = await prisma.user.update({
        where: { id: order.userId },
        data: { loyaltyPoints: { increment: pointsEarned } },
      });

      // Create points history
      const historyEntry = await prisma.pointsHistory.create({
        data: {
          userId: order.userId!,
          points: pointsEarned,
          type: 'earned',
          description: `Order completed: ${order.customerName}`,
          orderId: order.id,
        },
      });

      console.log(`🎉 Awarded ${pointsEarned} points to user ${order.userId}`, {
        newTotal: updatedUser.loyaltyPoints,
        historyId: historyEntry.id,
      });
    } else if (!order.userId) {
      console.warn('⚠️ Order has no userId, points not awarded:', order.id);
    } else {
      console.log('ℹ️ No points awarded (pointsEarned = 0)');
    }
  }

  console.log('✅ Order status updated:', { orderId: id, newStatus: order.status });

  return { data: mapOrder(order), success: true };
}

/**
 * Calculate loyalty points for an order
 * Rules:
 * - 1 point per Rp 1,000 spent
 * - 2x points for Coffee category
 */
function calculateLoyaltyPoints(order: any): number {
  let totalPoints = 0;

  order.items.forEach((item: any) => {
    const basePoints = Math.floor(item.total / 1000);
    const isCoffee = item.product.category === 'COFFEE';
    
    if (isCoffee) {
      totalPoints += basePoints * 2; // 2x points for coffee
    } else {
      totalPoints += basePoints;
    }
  });

  return totalPoints;
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
  imageUrl?: string;
  cloudinaryPublicId?: string;
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
      imageUrl: data.imageUrl || data.image,
      cloudinaryPublicId: data.cloudinaryPublicId,
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

  const updateData: any = {
    name: data.name,
    description: data.description,
    basePrice: data.basePrice,
    category: data.category,
    featured: data.featured,
  };

  // Handle image fields
  if (data.image !== undefined) {
    updateData.image = data.image;
  }
  if (data.imageUrl !== undefined) {
    updateData.imageUrl = data.imageUrl;
  }
  if (data.cloudinaryPublicId !== undefined) {
    updateData.cloudinaryPublicId = data.cloudinaryPublicId;
  }

  // Handle sizes
  if (data.sizes) {
    updateData.sizes = {
      deleteMany: {},
      create: data.sizes.map((s: any) => ({
        name: s.name,
        price: s.price,
      })),
    };
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { sizes: true },
  });

  return { data: mapProduct(product), success: true };
}

export async function deleteProduct(id: string): Promise<{ success: boolean }> {
  await delay(300);

  // Get product to retrieve Cloudinary public ID
  const product = await prisma.product.findUnique({
    where: { id },
    select: { cloudinaryPublicId: true },
  });

  // Delete from Cloudinary if public ID exists
  if (product?.cloudinaryPublicId) {
    try {
      const { deleteFile } = await import('./services/cloudinary.js');
      const deleteResult = await deleteFile(product.cloudinaryPublicId);
      
      if (deleteResult.success) {
        console.log('🗑️ Deleted image from Cloudinary:', product.cloudinaryPublicId);
      } else {
        console.warn('⚠️ Failed to delete from Cloudinary:', deleteResult.error);
      }
    } catch (error: any) {
      console.error('❌ Cloudinary delete error:', error);
      // Continue with product deletion even if Cloudinary fails
    }
  }

  // Delete from database
  await prisma.product.delete({
    where: { id },
  });

  return { success: true };
}

/**
 * Upload product image to Cloudinary
 * @param file - Multer file object
 */
export async function uploadProductImage(file: {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}): Promise<{
  success: boolean;
  imageUrl?: string;
  publicId?: string;
  error?: string;
}> {
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  console.log('📁 File upload info:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    bufferLength: file.buffer.length,
  });

  // Validate file type - accept all image types including webp
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    console.error('❌ Invalid file type:', file.mimetype);
    return { 
      success: false, 
      error: `Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, GIF, WEBP, SVG` 
    };
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'File size must be less than 5MB' };
  }

  // Upload to Cloudinary
  return uploadToCloudinary(file.buffer, file.originalname, file.mimetype);
}
