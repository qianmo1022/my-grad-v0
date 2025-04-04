import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取特定车型的特性
export async function GET(
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
      where: { id: carId }
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 获取车型特性
    const features = await prisma.carFeature.findMany({
      where: { carId },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(features);
  } catch (error) {
    console.error('获取车型特性失败:', error);
    return NextResponse.json({ error: '获取车型特性失败' }, { status: 500 });
  }
}

// 更新车型特性
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
      where: { id: carId }
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 解析请求体，获取特性列表
    const features = await request.json();
    
    if (!Array.isArray(features)) {
      return NextResponse.json({ error: '无效的特性数据' }, { status: 400 });
    }
    
    // 删除所有现有特性并创建新的特性
    await prisma.carFeature.deleteMany({
      where: { carId }
    });
    
    // 创建新特性
    const newFeatures = await Promise.all(
      features.map(async (feature) => {
        const { featureKey, name, score } = feature;
        
        // 验证必要字段
        if (!featureKey || !name || score === undefined) {
          return { error: `特性 "${name || featureKey}" 缺少必要字段` };
        }
        
        try {
          return await prisma.carFeature.create({
            data: {
              featureKey,
              name,
              score,
              car: {
                connect: { id: carId }
              }
            }
          });
        } catch (error) {
          console.error(`创建特性 "${name}" 失败:`, error);
          return { error: `创建特性 "${name}" 失败` };
        }
      })
    );
    
    // 检查是否有错误
    const errors = newFeatures.filter(feature => 'error' in feature);
    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        errors: errors.map(e => (e as any).error) 
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      features: newFeatures
    });
  } catch (error) {
    console.error('更新车型特性失败:', error);
    return NextResponse.json({ error: '更新车型特性失败' }, { status: 500 });
  }
} 