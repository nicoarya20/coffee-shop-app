import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrders, getOrderById, createOrder, updateOrderStatus } from '../../server/handlers.js';

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
        const { id, userId, status } = req.query;
        
        // Get single order by ID
        if (id) {
          const result = await getOrderById(id as string);
          return res.status(200).json(result);
        }

        // Get all orders with filters
        const result = await getOrders(
          userId as string,
          status as string
        );
        return res.status(200).json(result);
      }

      case 'POST': {
        const { items, customerName, notes, userId } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Order items are required' 
          });
        }

        if (!customerName) {
          return res.status(400).json({ 
            success: false, 
            message: 'Customer name is required' 
          });
        }

        const result = await createOrder({
          items,
          customerName,
          notes,
          userId
        });
        return res.status(201).json(result);
      }

      default: {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error: any) {
    console.error('❌ Orders API error:', error.message);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
}
