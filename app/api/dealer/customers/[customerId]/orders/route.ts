import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// 获取客户的订单历史
export async function GET(
  request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    // 获取会话，验证商家身份
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }
    
    const dealerId = session.user.id
    const { customerId } = params
    
    // 查询参数
    const url = new URL(request.url)
    const statusFilter = url.searchParams.get('status') || 'all'
    
    // 检查客户是否存在且属于当前商家
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        dealerId
      }
    })
    
    if (!customer) {
      return NextResponse.json(
        { error: '客户不存在' },
        { status: 404 }
      )
    }
    
    // 构建查询条件
    let whereCondition: any = { 
      customerId,
      dealerId
    }
    
    // 如果指定了状态，只获取该状态的订单
    if (statusFilter !== 'all') {
      whereCondition.status = statusFilter
    }
    
    // 获取客户订单
    const orders = await prisma.order.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        car: {
          select: {
            name: true,
            thumbnail: true
          }
        }
      }
    })
    
    // 格式化订单数据
    const formattedOrders = orders.map(order => ({
      id: order.id,
      car: order.car.name,
      carImage: order.car.thumbnail,
      date: order.createdAt.toISOString().split('T')[0],
      amount: order.amount,
      formattedAmount: `¥${order.amount.toLocaleString()}`,
      status: order.status,
    }))
    
    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('获取客户订单历史失败:', error)
    return NextResponse.json(
      { error: '获取客户订单历史失败' },
      { status: 500 }
    )
  }
}