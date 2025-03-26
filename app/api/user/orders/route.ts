import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 获取用户最近订单
export async function GET(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 解析请求参数
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);
    
    // 从数据库获取用户详细信息
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: session.user.id },
          { email: session.user.email as string }
        ]
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    // 获取用户最近订单
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
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
    console.error('获取用户订单失败:', error);
    return NextResponse.json({ error: '获取用户订单失败' }, { status: 500 });
  }
} 