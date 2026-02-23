import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getUserProfile,
  updateUserProfile,
  login,
  register,
  uploadProductImage
} from './handlers.js';

const router = express.Router();

// Configure multer for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

// Auth routes
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const result = await login(email, password);
    res.json(result);
  } catch (error: any) {
    console.error('Login error details:', error);
    res.status(401).json({ success: false, message: error.message || 'Authentication failed' });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const result = await register({ email, password, name, phone, role });
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Registration error details:', error);
    res.status(500).json({ success: false, message: error.message || 'Unknown error' });
  }
});

// Products routes
router.get('/products', async (req, res) => {
  try {
    const { category, featured, search, limit, offset } = req.query;
    const result = await getProducts(
      category as string,
      featured === 'true',
      search as string,
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/products/featured', async (req, res) => {
  try {
    const result = await getFeaturedProducts();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/products/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    const result = await searchProducts(q as string);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const result = await getProductById(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, description, basePrice, image, category, featured, sizes } = req.body;

    if (!name || !basePrice || !category) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }

    // Handle file upload to Cloudinary
    let imageUrl = image; // Fallback to URL if provided
    let cloudinaryPublicId: string | undefined;

    if (req.file) {
      const uploadResult = await uploadProductImage(req.file);
      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: uploadResult.error || 'Failed to upload image',
        });
      }
      imageUrl = uploadResult.imageUrl!;
      cloudinaryPublicId = uploadResult.publicId;
    } else if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image URL or image file is required',
      });
    }

    const result = await createProduct({
      name,
      description,
      basePrice: parseInt(basePrice),
      image: imageUrl,
      imageUrl,
      cloudinaryPublicId,
      category,
      featured: featured === 'true',
      sizes: sizes ? JSON.parse(sizes) : undefined,
    });
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, basePrice, image, category, featured, sizes } = req.body;

    // Handle file upload to Cloudinary if new file is uploaded
    let imageUrl = image;
    let cloudinaryPublicId: string | undefined;

    if (req.file) {
      const uploadResult = await uploadProductImage(req.file);
      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: uploadResult.error || 'Failed to upload image',
        });
      }
      imageUrl = uploadResult.imageUrl!;
      cloudinaryPublicId = uploadResult.publicId;
    }

    // Convert featured to boolean (handle both string and boolean)
    let featuredValue: boolean | undefined;
    if (featured !== undefined) {
      featuredValue = featured === true || featured === 'true';
    }

    const updateData: any = {
      name,
      description,
      basePrice: basePrice ? parseInt(basePrice) : undefined,
      category,
      featured: featuredValue,
      sizes: sizes ? JSON.parse(sizes) : undefined,
    };

    // Only update image fields if new image is provided
    if (imageUrl) {
      updateData.image = imageUrl;
      updateData.imageUrl = imageUrl;
    }
    if (cloudinaryPublicId) {
      updateData.cloudinaryPublicId = cloudinaryPublicId;
    }

    const result = await updateProduct(req.params.id, updateData);
    console.log('✅ Product updated:', result.data);
    res.json(result);
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(404).json({ success: false, message: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const result = await deleteProduct(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// Orders routes
router.get('/orders', async (req, res) => {
  try {
    const result = await getOrders();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const result = await getOrderById(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const { items, customerName, notes, userId } = req.body;

    console.log('📝 Create order request:', {
      customerName,
      userId,
      itemCount: items?.length,
      hasUserId: !!userId
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    if (!customerName) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    const result = await createOrder({ 
      items, 
      customerName, 
      notes,
      userId  // ✅ FORWARD userId!
    });
    
    console.log('✅ Order created:', {
      orderId: result.data.id,
      userId: result.data.userId,
      hasUserId: !!result.data.userId
    });
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error('❌ Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

    console.log('📝 Updating order status:', { orderId: req.params.id, status });

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required' });
    }

    const result = await updateOrderStatus(req.params.id, status);
    console.log('✅ Order status updated:', result.data);
    res.json(result);
  } catch (error: any) {
    console.error('❌ Update order status error:', error);
    res.status(404).json({ success: false, message: error.message });
  }
});

// User routes
router.get('/user/profile', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    console.log('📝 Get user profile:', { 
      userId, 
      hasUserId: !!userId 
    });
    
    const result = await getUserProfile(userId);
    console.log('✅ Profile returned:', {
      userId: result.data.id,
      role: result.data.role,
      email: result.data.email
    });
    
    res.json(result);
  } catch (error: any) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/user/points-history', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    console.log('📊 Get points history:', { 
      userId, 
      hasUserId: !!userId 
    });
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }
    
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const history = await prisma.pointsHistory.findMany({
      where: { userId },  // ✅ FILTER BY USER ID!
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    console.log('✅ Points history returned:', {
      userId,
      count: history.length,
      totalPoints: history.reduce((sum, h) => sum + h.points, 0)
    });

    res.json({ success: true, data: history });
  } catch (error: any) {
    console.error('❌ Get points history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/user/profile', async (req, res) => {
  try {
    const result = await updateUserProfile(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
