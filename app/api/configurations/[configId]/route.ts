import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 获取单个保存的配置
export async function GET(
  request: Request,
  context: { params: { configId: string } }
) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const { configId } = await context.params;
    
    if (!configId) {
      return NextResponse.json({ error: '缺少配置ID' }, { status: 400 });
    }
    
    // 从数据库获取保存的配置
    const savedConfig = await prisma.savedConfiguration.findUnique({
      where: {
        id: configId,
      },
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
    
    if (!savedConfig) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 });
    }
    
    // 检查配置是否属于当前用户
    if (savedConfig.userId !== session.user.id) {
      return NextResponse.json({ error: '无权访问此配置' }, { status: 403 });
    }
    
    // 计算总价
    const options = savedConfig.options as Record<string, string>;
    
    // 获取所有选项的详细信息，包括价格
    const configCategories = await prisma.carConfigCategory.findMany({
      include: {
        options: {
          where: {
            carId: savedConfig.carId
          }
        }
      }
    });
    
    // 返回配置信息
    return NextResponse.json({
      id: savedConfig.id,
      carId: savedConfig.car.id,
      carName: `${savedConfig.car.name} - 个性定制`,
      thumbnail: savedConfig.car.thumbnail,
      date: savedConfig.createdAt.toISOString().split('T')[0],
      price: savedConfig.totalPrice,
      options: options,
    });
  } catch (error) {
    console.error('获取配置详情失败:', error);
    return NextResponse.json({ error: '获取配置详情失败' }, { status: 500 });
  }
}