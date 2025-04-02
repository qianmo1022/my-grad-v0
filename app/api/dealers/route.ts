import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 获取所有经销商列表
export async function GET(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 从数据库获取所有经销商信息
    const dealers = await prisma.dealer.findMany({
      select: {
        id: true,
        name: true,
        businessName: true,
        address: true,
        city: true,
        province: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // 格式化经销商数据
    const formattedDealers = dealers.map(dealer => ({
      id: dealer.id,
      name: dealer.name,
      businessName: dealer.businessName || dealer.name,
      location: [
        dealer.address,
        dealer.city,
        dealer.province
      ].filter(Boolean).join(', ')
    }));
    
    return NextResponse.json(formattedDealers);
  } catch (error) {
    console.error('获取经销商列表失败:', error);
    return NextResponse.json({ error: '获取经销商列表失败' }, { status: 500 });
  }
}