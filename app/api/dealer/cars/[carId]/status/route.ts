import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 更新车型状态
export async function PUT(
  request: Request,
  { params }: { params: { carId: string } }
) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const { carId } = params;
    
    // 检查车型是否存在
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        features: true,
        configOptions: true
      }
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 解析请求体
    const body = await request.json();
    const { status } = body;
    
    // 验证状态
    if (!status || !['draft', 'active', 'archived'].includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 });
    }
    
    // 如果要设置为active，检查配置是否完整
    if (status === 'active') {
      // 检查车型特性
      if (car.features.length === 0) {
        return NextResponse.json({ 
          error: '车型缺少特性配置，无法上线', 
          field: 'features'
        }, { status: 400 });
      }
      
      // 检查配置选项
      if (car.configOptions.length === 0) {
        return NextResponse.json({ 
          error: '车型缺少配置选项，无法上线', 
          field: 'configOptions'
        }, { status: 400 });
      }
      
      // 检查必须至少有一个颜色选项
      const hasColorOption = car.configOptions.some(option => 
        (option.optionKey.includes('color') || option.colorCode)
      );
      
      if (!hasColorOption) {
        return NextResponse.json({ 
          error: '车型缺少颜色选项，无法上线', 
          field: 'colorOptions'
        }, { status: 400 });
      }
    }
    
    // 更新车型状态
    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: { status }
    });
    
    return NextResponse.json({
      success: true,
      car: updatedCar
    });
  } catch (error) {
    console.error('更新车型状态失败:', error);
    return NextResponse.json({ error: '更新车型状态失败' }, { status: 500 });
  }
} 