import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 获取当前登录用户信息的API
export async function GET() {
  try {
    // 获取当前会话信息 - 使用正确的参数
    const session = await getServerSession(authOptions);
    
    // 调试输出
    console.log('Session:', JSON.stringify(session));
    
    if (!session || !session.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const userId = session.user.id || session.user.email;
    
    if (!userId) {
      return NextResponse.json({ error: '用户ID缺失' }, { status: 401 });
    }
    
    // 从数据库获取用户详细信息
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: userId },
          { email: session.user.email as string }
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}

// 更新用户信息的API
export async function PUT(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const userId = session.user.id || session.user.email;
    
    if (!userId) {
      return NextResponse.json({ error: '用户ID缺失' }, { status: 401 });
    }
    
    // 解析请求体
    const data = await request.json();
    
    // 更新用户信息 - 使用findFirst来确保能找到用户
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: userId },
          { email: session.user.email as string }
        ]
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json({ error: '更新用户信息失败' }, { status: 500 });
  }
}