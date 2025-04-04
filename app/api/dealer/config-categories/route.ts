import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 获取配置分类
export async function GET() {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取所有配置分类
    const categories = await prisma.carConfigCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('获取配置分类失败:', error);
    return NextResponse.json({ error: '获取配置分类失败' }, { status: 500 });
  }
}

// 更新配置分类
export async function PUT(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 解析请求体，获取分类列表
    const categories = await request.json();
    
    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: '无效的配置分类数据' }, { status: 400 });
    }
    
    // 处理每个分类
    const results = await Promise.all(
      categories.map(async (category) => {
        const { id, categoryKey, name, description } = category;
        
        // 验证必要字段
        if (!categoryKey || !name) {
          return { error: `分类 "${name || categoryKey || id}" 缺少必要字段` };
        }
        
        // 如果有ID，更新现有分类
        if (id) {
          try {
            return await prisma.carConfigCategory.update({
              where: { id },
              data: {
                categoryKey,
                name,
                description
              }
            });
          } catch (error) {
            console.error(`更新分类 "${name}" 失败:`, error);
            return { error: `更新分类 "${name}" 失败` };
          }
        } 
        // 否则创建新分类
        else {
          // 不再检查分类标识是否已存在，允许相同的categoryKey存在多次
          try {
            return await prisma.carConfigCategory.create({
              data: {
                categoryKey,
                name,
                description
              }
            });
          } catch (error) {
            console.error(`创建分类 "${name}" 失败:`, error);
            return { error: `创建分类 "${name}" 失败` };
          }
        }
      })
    );
    
    // 检查是否有错误
    const errors = results.filter(result => 'error' in result);
    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        errors: errors.map(e => (e as any).error) 
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      categories: results
    });
  } catch (error) {
    console.error('更新配置分类失败:', error);
    return NextResponse.json({ error: '更新配置分类失败' }, { status: 500 });
  }
} 