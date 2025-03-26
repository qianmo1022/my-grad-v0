import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, type, name, businessId, phone } = body;

    // 检查邮箱是否已存在
    if (type === 'user') {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 400 }
        );
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
      });

      // 返回用户信息（不包含密码）
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    } else if (type === 'dealer') {
      const existingDealer = await prisma.dealer.findUnique({
        where: { email },
      });

      if (existingDealer) {
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 400 }
        );
      }

      // 检查营业执照号是否已存在
      const existingBusinessId = await prisma.dealer.findUnique({
        where: { businessId },
      });

      if (existingBusinessId) {
        return NextResponse.json(
          { error: '该营业执照号已被注册' },
          { status: 400 }
        );
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建商家
      const dealer = await prisma.dealer.create({
        data: {
          email,
          password: hashedPassword,
          name,
          businessId,
          phone,
        },
      });

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
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后再试' },
      { status: 500 }
    );
  }
}