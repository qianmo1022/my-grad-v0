import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { carId: string } }
) {
  try {
    const carId = params.carId;
    
    const car = await prisma.car.findUnique({
      where: { id: carId }
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 返回标准化的车型数据
    return NextResponse.json({
      id: car.id,
      name: car.name,
      basePrice: car.basePrice,
      description: car.description,
      thumbnail: car.thumbnail,
      defaultColor: car.defaultColor
    });
  } catch (error) {
    console.error('获取车型信息失败:', error);
    return NextResponse.json({ error: '获取车型信息失败' }, { status: 500 });
  }
} 