import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 处理订单提交请求
export async function POST(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取请求体
    const body = await request.json();
    const { configId, deliveryInfo, paymentMethod } = body;
    
    if (!configId) {
      return NextResponse.json({ error: '缺少配置ID' }, { status: 400 });
    }
    
    // 获取保存的配置
    const savedConfig = await prisma.savedConfiguration.findUnique({
      where: { id: configId },
      include: {
        car: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!savedConfig) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 });
    }
    
    // 检查配置是否属于当前用户
    if (savedConfig.userId !== session.user.id) {
      return NextResponse.json({ error: '无权访问此配置' }, { status: 403 });
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
        carId: savedConfig.carId,
        dealerId: defaultDealer.id,
        configuration: savedConfig.options as Record<string, string>,
        amount: savedConfig.totalPrice,
        status: 'pending', // 订单状态：待处理
        // 可以添加更多字段，如交付信息、支付方式等
      },
      include: {
        car: {
          select: {
            name: true,
          },
        },
      },
    });
    
    // 创建通知
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'ORDER',
        title: '订单已提交',
        message: `您的${order.car.name}订单已成功提交，订单号：${order.id}`,
        link: `/dashboard/user/orders`,
      },
    });
    
    return NextResponse.json({
      success: true,
      orderId: order.id,
      carName: order.car.name,
      status: order.status,
      totalAmount: order.amount,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}