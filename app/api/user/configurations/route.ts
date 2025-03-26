import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 获取用户保存的配置
export async function GET(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取查询参数
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    
    // 从数据库获取保存的配置
    const savedConfigurations = await prisma.savedConfiguration.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        car: {
          select: {
            id: true,
            name: true,
            thumbnail: true,
            basePrice: true,
          },
        },
      },
    });
    
    // 转换数据为前端所需格式
    const formattedConfigs = savedConfigurations.map(config => {
      // 计算总价
      const options = config.options as Record<string, string>;
      let totalPrice = config.car.basePrice;
      
      // 格式化响应
      return {
        id: config.id,
        carName: `${config.car.name} - 个性定制`,
        thumbnail: config.car.thumbnail,
        date: config.createdAt.toISOString().split('T')[0],
        price: `¥${totalPrice.toLocaleString()}`,
        carId: config.car.id,
        options: options,
      };
    });
    
    return NextResponse.json(formattedConfigs);
  } catch (error) {
    console.error('获取用户配置失败:', error);
    return NextResponse.json({ error: '获取用户配置失败' }, { status: 500 });
  }
}

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
    const { carId, options } = body;
    
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
    
    // 计算总价
    let totalPrice = savedConfig.car.basePrice;
    
    return NextResponse.json({
      id: savedConfig.id,
      carName: `${savedConfig.car.name} - 个性定制`,
      thumbnail: savedConfig.car.thumbnail,
      date: savedConfig.createdAt.toISOString().split('T')[0],
      price: `¥${totalPrice.toLocaleString()}`,
      options: options,
    });
  } catch (error) {
    console.error('保存配置失败:', error);
    return NextResponse.json({ error: '保存配置失败' }, { status: 500 });
  }
}

// 删除配置
export async function DELETE(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取查询参数
    const url = new URL(request.url);
    const configId = url.searchParams.get('id');
    
    if (!configId) {
      return NextResponse.json({ error: '缺少配置ID' }, { status: 400 });
    }
    
    // 检查配置是否存在且属于当前用户
    const config = await prisma.savedConfiguration.findFirst({
      where: {
        id: configId,
        userId: session.user.id,
      },
    });
    
    if (!config) {
      return NextResponse.json({ error: '配置不存在或无权删除' }, { status: 404 });
    }
    
    // 删除配置
    await prisma.savedConfiguration.delete({
      where: { id: configId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除配置失败:', error);
    return NextResponse.json({ error: '删除配置失败' }, { status: 500 });
  }
} 