import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, type } = body;

    if (type === 'user') {
      // 查找用户
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return NextResponse.json(
          { error: '用户不存在' },
          { status: 401 }
        );
      }

      // 验证密码
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: '密码错误' },
          { status: 401 }
        );
      }

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    } else if (type === 'dealer') {
      // 查找商家
      const dealer = await prisma.dealer.findUnique({
        where: { email },
      });

      if (!dealer) {
        return NextResponse.json(
          { error: '商家不存在' },
          { status: 401 }
        );
      }

      // 验证密码
      const passwordMatch = await bcrypt.compare(password, dealer.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: '密码错误' },
          { status: 401 }
        );
      }

      // 返回商家信息（不包含密码）
      const { password: _, ...dealerWithoutPassword } = dealer;
      return NextResponse.json(dealerWithoutPassword);
    } else {
      return NextResponse.json(
        { error: '无效的用户类型' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后再试' },
      { status: 500 }
    );
  }
}