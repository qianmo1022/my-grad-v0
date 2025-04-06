import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取特定车型的配置选项
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
    
    // 获取车型配置选项
    const options = await prisma.carConfigOption.findMany({
      where: { carId },
      include: {
        category: {
          select: {
            id: true,
            categoryKey: true,
            name: true
          }
        }
      },
      orderBy: [
        {
          category: {
            name: 'asc'
          }
        },
        {
          name: 'asc'
        }
      ]
    });
    
    return NextResponse.json(options);
  } catch (error) {
    console.error('获取车型配置选项失败:', error);
    return NextResponse.json({ error: '获取车型配置选项失败' }, { status: 500 });
  }
}

// 更新车型配置选项
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
    
    const { carId } = await params;
    
    // 检查车型是否存在
    const car = await prisma.car.findUnique({
      where: { id: carId }
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 解析请求体，获取选项列表
    const options = await request.json();
    
    if (!Array.isArray(options)) {
      return NextResponse.json({ error: '无效的配置选项数据' }, { status: 400 });
    }
    
    // 删除所有现有选项并创建新的选项
    await prisma.carConfigOption.deleteMany({
      where: { carId }
    });
    
    // 创建新选项
    const newOptions = await Promise.all(
      options.map(async (option) => {
        const { 
          optionKey, 
          name, 
          description, 
          price, 
          thumbnail, 
          colorCode, 
          categoryId,
          categoryKey 
        } = option;
        
        // 验证必要字段
        if (!optionKey || !name || price === undefined) {
          return { error: `选项 "${name || optionKey}" 缺少必要字段` };
        }
        
        let finalCategoryId = categoryId;
        
        // 如果没有categoryId但有categoryKey，尝试通过categoryKey查找分类
        if (!finalCategoryId && categoryKey) {
          const categoryByKey = await prisma.carConfigCategory.findFirst({
            where: { categoryKey }
          });
          
          if (categoryByKey) {
            finalCategoryId = categoryByKey.id;
          } else {
            // 如果通过categoryKey也找不到分类，尝试从optionKey中提取分类前缀
            const categoryKeyFromOption = optionKey.split('-')[0];
            if (categoryKeyFromOption) {
              const categoryByPrefix = await prisma.carConfigCategory.findFirst({
                where: { categoryKey: categoryKeyFromOption }
              });
              
              if (categoryByPrefix) {
                finalCategoryId = categoryByPrefix.id;
              }
            }
          }
        }
        
        // 验证最终得到的分类ID
        if (!finalCategoryId) {
          return { error: `选项 "${name}" 无法找到对应的分类` };
        }
        
        // 检查分类是否存在
        const category = await prisma.carConfigCategory.findUnique({
          where: { id: finalCategoryId }
        });
        
        if (!category) {
          return { error: `选项 "${name}" 的分类不存在` };
        }
        
        try {
          return await prisma.carConfigOption.create({
            data: {
              optionKey,
              name,
              description: description || '',
              price: parseFloat(price.toString()),
              thumbnail,
              colorCode,
              car: {
                connect: { id: carId }
              },
              category: {
                connect: { id: finalCategoryId }
              }
            }
          });
        } catch (error) {
          console.error(`创建配置选项 "${name}" 失败:`, error);
          return { error: `创建配置选项 "${name}" 失败` };
        }
      })
    );
    
    // 检查是否有错误
    const errors = newOptions.filter(option => 'error' in option);
    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        errors: errors.map(e => (e as any).error) 
      }, { status: 400 });
    }
    
    // 如果所有配置选项都已完成，可以将车型设置为草稿状态
    await prisma.car.update({
      where: { id: carId },
      data: {
        status: 'draft'
      }
    });
    
    return NextResponse.json({
      success: true,
      options: newOptions
    });
  } catch (error) {
    console.error('更新车型配置选项失败:', error);
    return NextResponse.json({ error: '更新车型配置选项失败' }, { status: 500 });
  }
} 