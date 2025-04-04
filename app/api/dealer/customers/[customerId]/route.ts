import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// 获取单个客户详情
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
    const { customerId } = await params
    
    // 查询客户数据，确保客户属于当前商家
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        dealerId
      },
      include: {
        orders: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            car: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    })
    
    if (!customer) {
      return NextResponse.json(
        { error: '客户不存在' },
        { status: 404 }
      )
    }
    
    // 格式化客户数据
    const formattedCustomer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      status: customer.status,
      totalSpent: customer.totalSpent,
      lastOrderDate: customer.lastOrderDate,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      orders: customer.orders.map(order => ({
        id: order.id,
        car: order.car.name,
        date: order.createdAt.toISOString().split('T')[0],
        amount: order.amount,
        status: order.status,
      }))
    }
    
    return NextResponse.json(formattedCustomer)
  } catch (error) {
    console.error('获取客户详情失败:', error)
    return NextResponse.json(
      { error: '获取客户详情失败' },
      { status: 500 }
    )
  }
}

// 更新客户信息
export async function PATCH(
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
    const body = await request.json()
    
    // 验证必要字段
    const { name, email, phone, status } = body
    if (!name || !email) {
      return NextResponse.json(
        { error: '客户姓名和邮箱为必填项' },
        { status: 400 }
      )
    }
    
    // 检查客户是否存在且属于当前商家
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        dealerId
      }
    })
    
    if (!existingCustomer) {
      return NextResponse.json(
        { error: '客户不存在' },
        { status: 404 }
      )
    }
    
    // 如果更改了邮箱，检查新邮箱是否已被其他客户使用
    if (email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findFirst({
        where: {
          email,
          id: { not: customerId }
        }
      })
      
      if (emailExists) {
        return NextResponse.json(
          { error: '该邮箱已被其他客户使用' },
          { status: 400 }
        )
      }
    }
    
    // 更新客户信息
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        name,
        email,
        phone,
        status: status || existingCustomer.status
      }
    })
    
    return NextResponse.json({
      success: true,
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone || '',
        status: updatedCustomer.status
      }
    })
  } catch (error) {
    console.error('更新客户信息失败:', error)
    return NextResponse.json(
      { error: '更新客户信息失败' },
      { status: 500 }
    )
  }
}