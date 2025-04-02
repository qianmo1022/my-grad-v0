import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 处理下单预定请求
export async function POST(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取请求体
    const body = await request.json();
    const { carId, options, totalPrice } = body;
    
    if (!carId || !options) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    
    // 检查汽车是否存在
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 获取默认经销商（在实际应用中，这应该从请求中获取或基于其他逻辑选择）
    const defaultDealer = await prisma.dealer.findFirst();
    
    if (!defaultDealer) {
      return NextResponse.json({ error: '无可用经销商' }, { status: 404 });
    }
    
    // 创建订单
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        carId: carId,
        dealerId: defaultDealer.id, // 添加经销商ID
        configuration: options,
        amount: totalPrice || car.basePrice, // 使用amount而不是totalAmount
        status: 'pending', // 订单状态：待处理
      },
      include: {
        car: {
          select: {
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      id: order.id,
      carName: order.car.name,
      status: order.status,
      totalAmount: order.amount, // 使用amount字段返回给前端，保持API一致性
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}