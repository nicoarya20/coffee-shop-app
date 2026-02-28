import type { VercelRequest, VercelResponse } from '@vercel/node';
import { login } from '../../server/handlers';

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

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    console.log('🔐 Login attempt:', { email });

    const result = await login(email, password);
    
    console.log('✅ Login successful:', { 
      email: result.data.email, 
      role: result.data.role 
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Login error:', error.message);
    res.status(401).json({ 
      success: false, 
      message: error.message || 'Authentication failed' 
    });
  }
}
