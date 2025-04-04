import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 车辆状态类型 (如果模型中没有这个字段，我们将通过其他方式确定状态)
type CarStatus = 'active' | 'draft' | 'archived';

// 获取商家车型数据
export async function GET(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.type !== 'dealer') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 解析请求参数
    const url = new URL(request.url);
    const requestedStatus = url.searchParams.get('status') as CarStatus | null;
    
    // 获取所有车型
    const cars = await prisma.car.findMany({
      orderBy: { name: 'asc' },
    });
    
    // 根据请求的状态过滤车型
    let filteredCars = cars;
    if (requestedStatus) {
      filteredCars = cars.filter(car => car.status === requestedStatus);
    }
    
    // 统计每个车型的销售数量
    const carSales = await Promise.all(
      filteredCars.map(async (car) => {
        // 计算销售数量
        const sales = await prisma.order.count({
          where: {
            carId: car.id,
            status: 'completed'
          }
        });
        
        // 使用数据库中的状态字段
        
        return {
          id: car.id,
          name: car.name,
          thumbnail: car.thumbnail || "/placeholder.svg?height=100&width=160",
          basePrice: `¥${car.basePrice.toLocaleString()}`,
          status: car.status,
          sales
        };
      })
    );
    
    // 直接返回结果，不需要过滤null值
    return NextResponse.json(carSales);
  } catch (error: any) {
    console.error('获取车型数据失败:', { message: error?.message || '未知错误' });
    return NextResponse.json({ error: '获取车型数据失败' }, { status: 500 });
  }
}

// 添加新车型
export async function POST(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.type !== 'dealer') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // 验证必要字段
    if (!body.name || body.basePrice === undefined) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }
    
    // 创建新车型
    const newCar = await prisma.car.create({
      data: {
        id: body.id || '', // 如果前端未提供则使用空字符串
        name: body.name,
        basePrice: body.basePrice,
        thumbnail: body.thumbnail || "/placeholder.svg",
        description: body.description || '', // 如果前端未提供则使用空字符串
        defaultColor: body.defaultColor || '', // 如果前端未提供则使用空字符串
        status: body.status || 'draft', // 设置车型状态，默认为草稿状态
      },
    });
    
    return NextResponse.json(newCar, { status: 201 });
  } catch (error: any) {
    console.error('创建车型失败:', { message: error?.message || '未知错误' });
    return NextResponse.json({ error: '创建车型失败' }, { status: 500 });
  }
}