import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 保存新的配置
export async function POST(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取请求体
    const body = await request.json();
    const { carId, options, totalPrice } = body;
    
    if (!carId || !options) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    
    // 检查汽车是否存在
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 保存配置
    const savedConfig = await prisma.savedConfiguration.create({
      data: {
        userId: session.user.id,
        carId: carId,
        options: options,
        totalPrice: totalPrice || 0, // 保存总价，如果未提供则默认为0
      },
      include: {
        car: {
          select: {
            name: true,
            thumbnail: true,
            basePrice: true,
          },
        },
      },
    });
    
    // 返回保存的配置信息
    return NextResponse.json({
      id: savedConfig.id,
      carName: `${savedConfig.car.name} - 个性定制`,
      thumbnail: savedConfig.car.thumbnail,
      date: savedConfig.createdAt.toISOString().split('T')[0],
      price: totalPrice,
      options: options,
    });
  } catch (error) {
    console.error('保存配置失败:', error);
    return NextResponse.json({ error: '保存配置失败' }, { status: 500 });
  }
}