import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserProfile, updateUserProfile, changePassword } from '../../server/handlers.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS method (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { userId } = req.query;
        
        console.log('📊 Get user profile:', { userId });

        const result = await getUserProfile(userId as string);
        
        console.log('✅ Profile returned:', {
          userId: result.data.id,
          role: result.data.role,
          email: result.data.email
        });

        return res.status(200).json(result);
      }

      case 'PUT': {
        const { userId, ...data } = req.body;

        console.log('📝 Update profile request:', {
          userId,
          hasData: !!data,
        });

        if (!userId) {
          return res.status(400).json({
            success: false,
            message: 'userId is required'
          });
        }

        const result = await updateUserProfile(userId, data);
        return res.status(200).json(result);
      }

      default: {
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error: any) {
    console.error('❌ User profile API error:', error.message);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
}
