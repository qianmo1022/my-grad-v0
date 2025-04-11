import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { createOrderNotification } from '@/lib/notification';

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
    const { configId, deliveryInfo, paymentMethod, dealerId } = body;
    
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
    
    // 使用前端传来的经销商ID，如果没有提供则获取默认经销商
    let selectedDealerId = dealerId;
    let dealer;
    
    if (selectedDealerId) {
      // 如果提供了经销商ID，查找该经销商
      dealer = await prisma.dealer.findUnique({
        where: { id: selectedDealerId }
      });
    }
    
    // 如果没有提供经销商ID或找不到指定经销商，则使用默认经销商
    if (!dealer) {
      dealer = await prisma.dealer.findFirst();
      
      if (!dealer) {
        return NextResponse.json({ error: '无可用经销商' }, { status: 404 });
      }
      
      selectedDealerId = dealer.id;
    }
    
    // 创建订单
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        carId: savedConfig.carId,
        dealerId: selectedDealerId, // 使用选择的经销商ID
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
    
    // 创建用户通知
    await createOrderNotification(
      session.user.id,
      '订单已提交',
      `您的${order.car.name}订单已成功提交，订单号：${order.id}`,
      order.id
    );
    
    // 同时创建给经销商的通知 - 我们需要一种不同的方式来查找经销商账户
    try {
      // 找到与该经销商关联的用户（这需要一个不同的方式，因为User和Dealer之间没有直接关联）
      // 这里我们假设经销商的Email可能与用户的Email相同
      if (dealer) {
        const dealerUser = await prisma.user.findUnique({
          where: {
            email: dealer.email // 假设经销商的Email与对应用户的Email相同
          }
        });
        
        if (dealerUser) {
          await createOrderNotification(
            dealerUser.id,
            '新订单通知',
            `您有一个新的${order.car.name}订单需要处理，订单号：${order.id}`,
            order.id
          );
        }
      }
    } catch (dealerNotifyError) {
      // 如果经销商通知失败不影响主流程
      console.error('通知经销商失败:', dealerNotifyError);
    }
    
    return NextResponse.json({
      success: true,
      id: order.id,
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