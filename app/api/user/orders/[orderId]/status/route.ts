import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 更新用户订单状态
export async function PUT(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 获取订单ID和请求体
    const { orderId } = params;
    const { status } = await request.json();

    // 验证状态值
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '无效的订单状态' }, { status: 400 });
    }

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

    // 获取订单信息并验证所有权
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    // 验证订单所有权
    if (order.userId !== user.id) {
      return NextResponse.json({ error: '无权操作此订单' }, { status: 403 });
    }

    // 验证订单状态是否可以被取消
    // 只有待处理或处理中的订单可以被取消
    if (status === 'cancelled' && !['pending', 'processing'].includes(order.status)) {
      return NextResponse.json({ 
        error: '只有待处理或处理中的订单可以被取消' 
      }, { status: 400 });
    }

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: '订单状态已更新',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return NextResponse.json({ error: '更新订单状态失败' }, { status: 500 });
  }
}