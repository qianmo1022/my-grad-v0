import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取所有经销商列表
export async function GET() {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    // 获取所有商家信息，只返回必要的字段
    const dealers = await prisma.dealer.findMany({
      select: {
        id: true,
        name: true,
        businessName: true,
        logo: true,
        city: true,
        province: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(dealers);
  } catch (error) {
    console.error('获取商家列表失败:', error);
    return NextResponse.json({ error: '获取商家列表失败' }, { status: 500 });
  }
}