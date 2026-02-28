import type { VercelRequest, VercelResponse } from '@vercel/node';
import { changePassword } from '../../server/handlers';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS method (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId, currentPassword, newPassword } = req.body;

    console.log('🔐 Change password request:', {
      userId,
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword,
    });

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'userId, currentPassword, and newPassword are required'
      });
    }

    const result = await changePassword(userId, currentPassword, newPassword);
    
    console.log('✅ Password changed successfully:', {
      id: result.data.id,
      email: result.data.email,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Change password error:', error.message);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to change password' 
    });
  }
}
