import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');
    const status = searchParams.get('status') || 'active'; // 默认只查询已上线的车型
    
    if (!dealerId) {
      return NextResponse.json({ error: '缺少商家ID参数' }, { status: 400 });
    }
    
    // 查询条件
    const where: any = {
      // 直接使用dealerId字段查询
      dealerId: dealerId
    };
    
    // 如果指定了状态，添加状态过滤
    if (status !== 'all') {
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
        features: {
          select: {
            featureKey: true,
            name: true,
            score: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(cars);
  } catch (error) {
    // 修复错误处理，确保传递给console.error的是有效对象
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('获取车型列表失败:', { message: errorMessage });
    return NextResponse.json({ error: '获取车型列表失败' }, { status: 500 });
  }
}