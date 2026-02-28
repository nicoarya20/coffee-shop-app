import type { VercelRequest, VercelResponse } from '@vercel/node';
import { searchProducts } from '../../server/handlers';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS method (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    console.log('🔍 Searching products:', { query: q });

    const result = await searchProducts(q as string);
    
    console.log('✅ Search results:', {
      query: q,
      count: result.data.length
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Search products error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}
