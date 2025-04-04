import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 获取特定车型详情
export async function GET(request: Request, { params }: { params: { carId: string } }) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.type !== 'dealer') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const { carId } = params;
    
    // 获取车型详情
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    return NextResponse.json(car);
  } catch (error: any) {
    console.error('获取车型详情失败:', { message: error?.message || '未知错误' });
    return NextResponse.json({ error: '获取车型详情失败' }, { status: 500 });
  }
}

// 更新车型信息
export async function PUT(request: Request, { params }: { params: { carId: string } }) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.type !== 'dealer') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const { carId } = await params;
    const body = await request.json();
    
    // 验证车型是否存在
    const existingCar = await prisma.car.findUnique({
      where: { id: carId },
    });
    
    if (!existingCar) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 更新车型信息
    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: {
        name: body.name,
        basePrice: body.basePrice,
        thumbnail: body.thumbnail,
        status: body.status, // 更新车型状态
        description: body.description !== undefined ? body.description : existingCar.description,
        defaultColor: body.defaultColor !== undefined ? body.defaultColor : existingCar.defaultColor,
      },
    });
    
    return NextResponse.json(updatedCar);
  } catch (error: any) {
    console.error('更新车型失败:', { message: error?.message || '未知错误' });
    return NextResponse.json({ error: '更新车型失败' }, { status: 500 });
  }
}

// 删除车型
export async function DELETE(request: Request, { params }: { params: { carId: string } }) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.type !== 'dealer') {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const { carId } = params;
    
    // 验证车型是否存在
    const existingCar = await prisma.car.findUnique({
      where: { id: carId },
    });
    
    if (!existingCar) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 删除车型
    await prisma.car.delete({
      where: { id: carId },
    });
    
    return NextResponse.json({ success: true, message: '车型已成功删除' });
  } catch (error: any) {
    console.error('删除车型失败:', { message: error?.message || '未知错误' });
    return NextResponse.json({ error: '删除车型失败' }, { status: 500 });
  }
}