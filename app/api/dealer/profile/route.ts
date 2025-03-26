import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { Dealer } from '@prisma/client'

import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'

// 商家资料响应类型，不包含密码
type DealerProfile = Omit<Dealer, 'password'>;

// 商家资料更新请求类型
interface DealerUpdateRequest {
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  businessHours?: string;
  description?: string;
}

// 获取商家个人资料
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
    
    const dealerId = session.user.id
    
    // 查询商家数据
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
    })
    
    if (!dealer) {
      return NextResponse.json(
        { error: '商家信息不存在' },
        { status: 404 }
      )
    }
    
    // 不返回密码等敏感信息
    const { password, ...dealerInfo } = dealer
    
    return NextResponse.json({ profile: dealerInfo })
  } catch (error) {
    console.error('获取商家资料失败:', error)
    return NextResponse.json(
      { error: '获取商家资料失败' },
      { status: 500 }
    )
  }
}

// 更新商家个人资料
export async function PUT(request: Request) {
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
    const body = await request.json() as DealerUpdateRequest
    
    // 验证必要字段
    const { name, email, phone, businessName, address, city, province, postalCode, businessHours, description } = body
    
    if (!name || !email) {
      return NextResponse.json(
        { error: '姓名和邮箱为必填项' },
        { status: 400 }
      )
    }
    
    // 如果更改了邮箱，检查是否已被使用
    if (email) {
      const existingDealer = await prisma.dealer.findFirst({
        where: {
          email,
          id: { not: dealerId }
        }
      })
      
      if (existingDealer) {
        return NextResponse.json(
          { error: '该邮箱已被其他商家使用' },
          { status: 400 }
        )
      }
    }
    
    // 更新商家数据
    const updateData: any = {
      name,
      email,
      ...(phone !== undefined && { phone }),
      ...(businessName !== undefined && { businessName }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(province !== undefined && { province }),
      ...(postalCode !== undefined && { postalCode }),
      ...(businessHours !== undefined && { businessHours }),
      ...(description !== undefined && { description })
    };

    const updatedDealer = await prisma.dealer.update({
      where: { id: dealerId },
      data: updateData
    })
    
    // 不返回密码等敏感信息
    const { password, ...dealerInfo } = updatedDealer
    
    return NextResponse.json({
      success: true,
      profile: dealerInfo
    })
  } catch (error) {
    console.error('更新商家资料失败:', error)
    return NextResponse.json(
      { error: '更新商家资料失败' },
      { status: 500 }
    )
  }
}

// 修改密码
export async function PATCH(request: Request) {
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
    
    // 验证密码字段
    const { currentPassword, newPassword } = body
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '当前密码和新密码均为必填项' },
        { status: 400 }
      )
    }
    
    // 验证当前密码是否正确
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { password: true }
    })
    
    if (!dealer) {
      return NextResponse.json(
        { error: '商家信息不存在' },
        { status: 404 }
      )
    }
    
    // 实际项目中应该使用bcrypt等工具进行密码比对
    // 这里简化处理，实际开发请替换为安全的密码验证方式
    if (dealer.password !== currentPassword) {
      return NextResponse.json(
        { error: '当前密码不正确' },
        { status: 400 }
      )
    }
    
    // 更新密码
    await prisma.dealer.update({
      where: { id: dealerId },
      data: { password: newPassword } // 实际开发中应使用bcrypt等工具加密密码
    })
    
    return NextResponse.json({
      success: true,
      message: '密码已成功更改'
    })
  } catch (error) {
    console.error('修改密码失败:', error)
    return NextResponse.json(
      { error: '修改密码失败' },
      { status: 500 }
    )
  }
} 