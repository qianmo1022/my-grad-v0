import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'

// 自定义客户响应类型
interface CustomerResponse {
  id: string
  name: string
  email: string
  phone: string
  orders: number
  totalSpent: string
  lastOrder: string
  status: string
}

// 数据库中的客户记录类型
interface CustomerRecord {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  totalSpent: number
  lastOrderDate: Date | null
  orders: Array<{
    id: string;
    amount: number;
    createdAt: Date;
  }>
}

// 获取客户列表
export async function GET(request: Request) {
  try {
    // 获取会话，验证商家身份
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }
    
    // 查询参数
    const url = new URL(request.url)
    const searchTerm = url.searchParams.get('search') || ''
    const statusFilter = url.searchParams.get('status') || 'all'

    // 构建查询条件
    const dealerId = session.user.id
    let whereCondition: any = { dealerId }

    if (searchTerm) {
      whereCondition.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm } },
      ]
    }

    if (statusFilter !== 'all') {
      whereCondition.status = statusFilter
    }

    // 查询客户数据
    const customers = await (prisma as any).customer.findMany({
      where: whereCondition,
      include: {
        orders: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastOrderDate: 'desc' },
    }) as CustomerRecord[]

    // 格式化数据
    const formattedCustomers: CustomerResponse[] = customers.map((customer: CustomerRecord) => {
      const totalOrders = customer.orders.length
      const lastOrder = customer.lastOrderDate 
        ? new Date(customer.lastOrderDate).toISOString().split('T')[0]
        : '-'

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        orders: totalOrders,
        totalSpent: `¥${customer.totalSpent.toLocaleString()}`,
        lastOrder,
        status: customer.status
      }
    })

    return NextResponse.json({ customers: formattedCustomers })
  } catch (error) {
    console.error('获取客户列表失败:', error)
    return NextResponse.json(
      { error: '获取客户列表失败' },
      { status: 500 }
    )
  }
}

// 添加客户
export async function POST(request: Request) {
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
    const body = await request.json()
    
    // 验证必要字段
    const { name, email, phone, status } = body
    if (!name || !email) {
      return NextResponse.json(
        { error: '客户姓名和邮箱为必填项' },
        { status: 400 }
      )
    }
    
    // 检查邮箱是否已存在
    const existingCustomer = await (prisma as any).customer.findUnique({
      where: { email },
    })
    
    if (existingCustomer) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }
    
    // 创建客户
    const customer = await (prisma as any).customer.create({
      data: {
        name,
        email,
        phone,
        status: status || 'active',
        dealerId,
      },
    })
    
    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        orders: 0,
        totalSpent: '¥0',
        lastOrder: '-',
        status: customer.status
      }
    }, { status: 201 })
  } catch (error) {
    console.error('创建客户失败:', error)
    return NextResponse.json(
      { error: '创建客户失败' },
      { status: 500 }
    )
  }
} 