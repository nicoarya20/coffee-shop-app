import type { VercelRequest, VercelResponse } from '@vercel/node';
import { 
  getProducts, 
  getProductById, 
  getFeaturedProducts, 
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../../server/handlers';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS method (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { id } = req.query;
        
        // Get single product by ID
        if (id) {
          const result = await getProductById(id as string);
          return res.status(200).json(result);
        }

        // Get all products with filters
        const { category, featured, search, limit, offset } = req.query;
        const result = await getProducts(
          category as string,
          featured === 'true',
          search as string,
          limit ? parseInt(limit as string) : undefined,
          offset ? parseInt(offset as string) : undefined
        );
        return res.status(200).json(result);
      }

      case 'POST': {
        const result = await createProduct(req.body);
        return res.status(201).json(result);
      }

      case 'PUT': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            message: 'Product ID is required' 
          });
        }
        const result = await updateProduct(id as string, req.body);
        return res.status(200).json(result);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            message: 'Product ID is required' 
          });
        }
        const result = await deleteProduct(id as string);
        return res.status(200).json(result);
      }

      default: {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error: any) {
    console.error('❌ Products API error:', error.message);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
}
