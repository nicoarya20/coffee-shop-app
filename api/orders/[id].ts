import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrderById, updateOrderStatus } from '../../server/handlers';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS method (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Order ID is required' 
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const result = await getOrderById(id as string);
        return res.status(200).json(result);
      }

      case 'PATCH': {
        const { status } = req.body;
        const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

        if (!status || !validStatuses.includes(status)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Valid status is required' 
          });
        }

        console.log('📝 Updating order status:', { orderId: id, status });

        const result = await updateOrderStatus(id as string, status);
        
        console.log('✅ Order status updated:', { 
          orderId: id, 
          newStatus: result.data.status 
        });

        return res.status(200).json(result);
      }

      default: {
        res.setHeader('Allow', ['GET', 'PATCH']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error: any) {
    console.error('❌ Order API error:', error.message);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
}
