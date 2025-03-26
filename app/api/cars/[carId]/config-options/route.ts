import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 定义接口
interface CarConfigOption {
  optionKey: string;
  name: string;
  description: string;
  price: number;
  thumbnail?: string;
  colorCode?: string;
}

interface CarConfigCategory {
  id: string;
  categoryKey: string;
  name: string;
  description: string;
  options: CarConfigOption[];
}

// 获取车型配置选项
export async function GET(
  request: Request,
  { params }: { params: { carId: string } }
) {
  try {
    const carId = params.carId;
    
    // 检查车型是否存在
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 获取所有配置分类
    const categories = await (prisma as any).carConfigCategory.findMany({
      include: {
        options: {
          where: { carId },
          orderBy: { name: 'asc' },
        },
      },
    }) as CarConfigCategory[];
    
    // 格式化响应数据
    const formattedCategories = categories
      .filter((category: CarConfigCategory) => category.options.length > 0) // 只返回有选项的分类
      .map((category: CarConfigCategory) => {
        const formattedOptions = category.options.map((option: CarConfigOption) => {
          const formattedOption: any = {
            id: option.optionKey,
            name: option.name,
            description: option.description,
            price: option.price,
          };
          
          // 只添加存在的可选属性
          if (option.thumbnail) {
            formattedOption.thumbnail = option.thumbnail;
          }
          
          if (option.colorCode) {
            formattedOption.colorCode = option.colorCode;
          }
          
          return formattedOption;
        });
        
        return {
          id: category.categoryKey,
          name: category.name,
          description: category.description,
          options: formattedOptions,
        };
      });
    
    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('获取车型配置选项失败:', error);
    return NextResponse.json({ error: '获取车型配置选项失败' }, { status: 500 });
  }
} 