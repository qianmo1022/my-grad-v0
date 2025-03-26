import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 获取商家订单数据
export async function GET(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.type !== 'dealer') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const dealerId = session.user.id;
    
    // 解析请求参数
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    
    // 从数据库获取商家详细信息
    const dealer = await prisma.dealer.findFirst({
      where: { 
        OR: [
          { id: dealerId },
          { email: session.user.email as string }
        ]
      }
    });
    
    if (!dealer) {
      return NextResponse.json({ error: '商家不存在' }, { status: 404 });
    }
    
    // 构建查询条件
    const where: any = { dealerId: dealer.id };
    
    // 如果指定了状态，只获取该状态的订单
    if (status && ['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      where.status = status;
    }
    
    // 获取商家订单
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        car: {
          select: {
            name: true,
          }
        }
      }
    });
    
    // 格式化订单数据
    const formattedOrders = orders.map(order => ({
      id: order.id,
      car: order.car.name,
      date: order.createdAt.toISOString().split('T')[0],
      amount: `¥${order.amount.toLocaleString()}`,
      status: order.status,
    }));
    
    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('获取商家订单失败:', error);
    return NextResponse.json({ error: '获取商家订单失败' }, { status: 500 });
  }
} 