import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { carId: string } }
) {
  try {
    const { carId } = await params;
    
    // 查找车型信息，包括关联的经销商信息
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        dealer: {
          select: {
            id: true,
            name: true,
            businessName: true,
            logo: true,
            address: true,
            city: true,
            province: true,
            phone: true,
            businessHours: true
          }
        }
      }
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    if (!car.dealer) {
      return NextResponse.json({ error: '该车型没有关联经销商' }, { status: 404 });
    }
    
    // 返回经销商信息
    return NextResponse.json(car.dealer);
  } catch (error) {
    console.error('获取车型经销商信息失败:', error);
    return NextResponse.json({ error: '获取车型经销商信息失败' }, { status: 500 });
  }
}