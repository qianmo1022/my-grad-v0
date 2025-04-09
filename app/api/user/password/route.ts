import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    // 验证用户是否已登录
    if (!session || !session.user || session.user.type !== 'user') {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }
    
    // 解析请求体
    const { currentPassword, newPassword } = await request.json();
    
    // 验证请求数据
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '当前密码和新密码都是必填项' },
        { status: 400 }
      );
    }
    
    // 验证新密码长度
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: '新密码长度必须至少为8个字符' },
        { status: 400 }
      );
    }
    
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 验证当前密码
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: '当前密码不正确' },
        { status: 400 }
      );
    }
    
    // 哈希新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    });
    
    return NextResponse.json(
      { message: '密码已成功更新' },
      { status: 200 }
    );
  } catch (error) {
    console.error('更新密码时出错:', error);
    return NextResponse.json(
      { error: '更新密码时发生错误' },
      { status: 500 }
    );
  }
}