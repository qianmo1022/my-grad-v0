import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 更新订单状态
export async function PUT(request: Request, { params }: { params: { orderId: string } }) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const dealerId = session.user.id;
    const { orderId } = params;
    
    if (!orderId) {
      return NextResponse.json({ error: '缺少订单ID' }, { status: 400 });
    }
    
    // 获取请求体
    const body = await request.json();
    const { status } = body;
    
    if (!status || !['processing', 'completed'].includes(status)) {
      return NextResponse.json({ error: '无效的订单状态' }, { status: 400 });
    }
    
    // 查找订单
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        car: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    
    // 验证订单是否属于该商家
    if (order.dealerId !== dealerId) {
      return NextResponse.json({ error: '无权操作此订单' }, { status: 403 });
    }
    
    // 验证订单状态转换是否有效
    if (status === 'processing' && order.status !== 'pending') {
      return NextResponse.json({ error: '只能接受待处理的订单' }, { status: 400 });
    }
    
    if (status === 'completed' && order.status !== 'processing') {
      return NextResponse.json({ error: '只能完成处理中的订单' }, { status: 400 });
    }
    
    // 如果订单状态更新为processing，将客户信息写入Customer表
    if (status === 'processing' && order.user) {
      // 检查该用户是否已存在于Customer表中
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          email: order.user.email as string,
          dealerId: dealerId
        }
      });
      
      // 如果客户不存在，则创建新客户记录
      if (!existingCustomer) {
        // 构建客户名称
        const customerName = order.user.firstName && order.user.lastName
          ? `${order.user.firstName} ${order.user.lastName}`
          : order.user.email?.split('@')[0] || '未知客户';
        
        // 创建新客户
        const newCustomer = await prisma.customer.create({
          data: {
            name: customerName,
            email: order.user.email as string,
            status: 'active',
            totalSpent: order.amount,
            lastOrderDate: new Date(),
            dealerId: dealerId
          }
        });
        
        // 更新订单，关联到新创建的客户
        await prisma.order.update({
          where: { id: orderId },
          data: {
            customer: {
              connect: { id: newCustomer.id }
            }
          }
        });
      } else {
        // 如果客户已存在，更新客户信息
        await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: {
            totalSpent: { increment: order.amount },
            lastOrderDate: new Date()
          }
        });
        
        // 更新订单，关联到已存在的客户
        await prisma.order.update({
          where: { id: orderId },
          data: {
            customer: {
              connect: { id: existingCustomer.id }
            }
          }
        });
      }
    }
    
    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    
    // 创建用户通知
    let notificationTitle = '';
    let notificationMessage = '';
    
    if (status === 'processing') {
      notificationTitle = '订单已接受';
      notificationMessage = `您的${order.car.name}订单已被商家接受，正在处理中。`;
    } else if (status === 'completed') {
      notificationTitle = '订单已完成';
      notificationMessage = `您的${order.car.name}订单已完成。`;
    }
    
    if (notificationTitle && order.user?.id) {
      await prisma.notification.create({
        data: {
          userId: order.user.id,
          type: 'ORDER',
          title: notificationTitle,
          message: notificationMessage,
          link: `/dashboard/user/orders`,
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      message: status === 'processing' ? '订单已接受' : '订单已完成',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
      },
    });
  } catch (error: any) {
    console.error('更新订单状态失败:', { message: error?.message || '未知错误' });
    return NextResponse.json({ error: '更新订单状态失败' }, { status: 500 });
  }
}