import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 车辆状态类型 (如果模型中没有这个字段，我们将通过其他方式确定状态)
type CarStatus = 'active' | 'draft' | 'archived';

// 获取车型列表
export async function GET(request: Request) {
  try {
    // 获取当前会话信息，确保用户已登录
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 可选的状态过滤
    
    // 构建查询条件
    const where: any = {
      // 只查询当前商家的车型
      dealerId: session.user.id
    };
    
    // 如果指定了状态，添加状态过滤
    if (status) {
      where.status = status;
    }
    
    // 从数据库获取车型数据
    const cars = await prisma.car.findMany({
      where,
      select: {
        id: true,
        name: true,
        basePrice: true,
        description: true,
        thumbnail: true,
        defaultColor: true,
        status: true,
        _count: {
          select: {
            orders: true,
            reviews: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // 格式化返回数据
    const formattedCars = cars.map(car => ({
      id: car.id,
      name: car.name,
      basePrice: car.basePrice,
      description: car.description,
      thumbnail: car.thumbnail,
      defaultColor: car.defaultColor,
      status: car.status,
      orderCount: car._count.orders,
      reviewCount: car._count.reviews
    }));
    
    return NextResponse.json(formattedCars);
  } catch (error) {
    console.error('获取车型列表失败:', error);
    return NextResponse.json({ error: '获取车型列表失败' }, { status: 500 });
  }
}

// 添加新车型
export async function POST(request: Request) {
  try {
    // 获取当前会话信息，确保用户已登录
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 解析请求体
    const body = await request.json();
    const { name, basePrice, description, thumbnail, defaultColor, status = 'draft' } = body;
    
    // 验证必要字段
    if (!name || basePrice === undefined || !description || !thumbnail || !defaultColor) {
      return NextResponse.json({ error: '缺少必要的车型信息' }, { status: 400 });
    }
    
    // 确保新车型的状态只能是草稿
    if (status !== 'draft') {
      return NextResponse.json({ 
        error: '新车型只能保存为草稿状态，需要完成所有配置后才能上线' 
      }, { status: 400 });
    }
    
    // 检查车型名称是否已存在
    const existingCar = await prisma.car.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive' // 不区分大小写
        }
      }
    });
    
    if (existingCar) {
      return NextResponse.json({ error: '该车型名称已存在' }, { status: 409 });
    }
    
    // 生成唯一ID
    const id = `car_${Date.now()}`;
    
    // 创建新车型
    const newCar = await prisma.car.create({
      data: {
        id,
        name,
        basePrice,
        description,
        thumbnail,
        defaultColor,
        status: 'draft', // 确保新车型为草稿状态
        dealer: {
          connect: {
            id: session.user.id
          }
        } // 通过 connect 关联当前登录的商家ID
      }
    });
    
    return NextResponse.json({
      success: true,
      car: newCar
    });
  } catch (error) {
    console.error('创建车型失败:', error);
    return NextResponse.json({ error: '创建车型失败' }, { status: 500 });
  }
}