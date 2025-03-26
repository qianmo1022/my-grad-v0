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
    
    // 统计每个车型的销售数量并根据订单状态确定车型状态
    const carSales = await Promise.all(
      cars.map(async (car) => {
        // 计算销售数量
        const sales = await prisma.order.count({
          where: {
            carId: car.id,
            status: 'completed'
          }
        });
        
        // 模拟车辆状态 - 实际应用中可能需要添加状态字段到Car模型
        // 这里简单地基于是否有订单来确定状态
        let status: CarStatus = 'active';
        
        if (sales === 0) {
          // 如果没有销售，假设是草稿状态
          status = 'draft';
        } else if (sales > 0 && Math.random() > 0.8) {
          // 随机将一些有销售的车辆设为归档状态（这只是示例逻辑）
          status = 'archived';
        }
        
        // 如果请求了特定状态的车型，且当前车型不符合，则跳过
        if (requestedStatus && status !== requestedStatus) {
          return null;
        }
        
        return {
          id: car.id,
          name: car.name,
          thumbnail: car.thumbnail || "/placeholder.svg?height=100&width=160",
          basePrice: `¥${car.basePrice.toLocaleString()}`,
          status: status,
          sales
        };
      })
    );
    
    // 过滤掉null值
    const filteredCars = carSales.filter(car => car !== null);
    
    return NextResponse.json(filteredCars);
  } catch (error: any) {
    console.error('获取车型数据失败:', { message: error?.message || '未知错误' });
    return NextResponse.json({ error: '获取车型数据失败' }, { status: 500 });
  }
} 