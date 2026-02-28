import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const { userId } = req.query;

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

    const history = await prisma.pointsHistory.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    console.log('✅ Points history returned:', {
      userId,
      count: history.length,
      totalPoints: history.reduce((sum, h) => sum + h.points, 0)
    });

    return res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    console.error('❌ Get points history error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}
