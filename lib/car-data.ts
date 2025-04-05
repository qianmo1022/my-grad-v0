// 汽车数据类型定义
import { prisma } from '@/lib/db';

export interface CarModel {
  id: string
  name: string
  basePrice: number
  description: string
  thumbnail: string
  defaultColor: string
}

export interface ConfigCategory {
  id: string
  categoryKey: string
  name: string
  description: string
  options: ConfigOption[]
}

export interface ConfigOption {
  id: string
  optionKey: string
  name: string
  description: string
  price: number
  thumbnail?: string
  colorCode?: string
  categoryId?: string
}

// 判断是否在服务器端
const isServer = typeof window === 'undefined';

// 获取所有车型
export async function getAllCars(): Promise<CarModel[]> {
  try {
    if (isServer) {
      // 服务器端直接使用 Prisma
      const cars = await prisma.car.findMany({
        where: { status: 'active' },
        orderBy: { name: 'asc' }
      });
      
      return cars.map(car => ({
        id: car.id,
        name: car.name,
        basePrice: car.basePrice,
        description: car.description,
        thumbnail: car.thumbnail,
        defaultColor: car.defaultColor
      }));
    } else {
      // 客户端使用 fetch API
      const response = await fetch('/api/cars');
      if (!response.ok) {
        throw new Error('获取车型列表失败');
      }
      return await response.json();
    }
  } catch (error) {
    console.error('获取车型列表失败:', error);
    return [];
  }
}

// 获取特定车型的配置选项
export async function getCarConfigOptions(carId: string): Promise<ConfigCategory[]> {
  try {
    if (isServer) {
      // 服务器端直接使用 Prisma
      // 获取与该车型关联的所有配置选项
      const options = await prisma.carConfigOption.findMany({
        where: { carId: carId },
        include: {
          category: true
        },
        orderBy: [
          { category: { name: 'asc' } },
          { name: 'asc' }
        ]
      });

      // 如果没有配置选项，则返回空数组
      if (options.length === 0) {
        return [];
      }

      // 按分类组织选项
      const categoriesMap = new Map<string, ConfigCategory>();
      
      for (const option of options) {
        const category = option.category;
        
        if (!categoriesMap.has(category.id)) {
          categoriesMap.set(category.id, {
            id: category.id,
            categoryKey: category.categoryKey,
            name: category.name,
            description: category.description,
            options: []
          });
        }
        
        const configOption: ConfigOption = {
          id: option.id,
          optionKey: option.optionKey,
          name: option.name,
          description: option.description,
          price: option.price,
          thumbnail: option.thumbnail || undefined,
          colorCode: option.colorCode || undefined,
          categoryId: category.id
        };
        
        categoriesMap.get(category.id)!.options.push(configOption);
      }
      
      // 转换为数组并返回
      return Array.from(categoriesMap.values());
    } else {
      // 客户端使用 fetch API
      const response = await fetch(`/api/cars/${carId}/config-options`);
      if (!response.ok) {
        throw new Error('获取车型配置选项失败');
      }
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('获取车型配置选项失败:', error);
    return [];
  }
}

// 获取特定车型信息
export async function getCarById(carId: string): Promise<CarModel | undefined> {
  try {
    if (isServer) {
      // 服务器端直接使用 Prisma
      const car = await prisma.car.findUnique({
        where: { id: carId }
      });
      
      if (!car) {
        return undefined;
      }
      
      return {
        id: car.id,
        name: car.name,
        basePrice: car.basePrice,
        description: car.description,
        thumbnail: car.thumbnail,
        defaultColor: car.defaultColor
      };
    } else {
      // 客户端使用 fetch API
      const response = await fetch(`/api/cars/${carId}`);
      if (!response.ok) {
        throw new Error('获取车型信息失败');
      }
      return await response.json();
    }
  } catch (error) {
    console.error('获取车型信息失败:', error);
    return undefined;
  }
}

// 获取经销商的车型列表
export async function getDealerCars(dealerId: string): Promise<CarModel[]> {
  try {
    if (isServer) {
      // 服务器端直接使用 Prisma
      const cars = await prisma.car.findMany({
        where: { 
          dealerId: dealerId,
          status: 'active'
        },
        orderBy: { name: 'asc' }
      });
      
      return cars.map(car => ({
        id: car.id,
        name: car.name,
        basePrice: car.basePrice,
        description: car.description,
        thumbnail: car.thumbnail,
        defaultColor: car.defaultColor
      }));
    } else {
      // 客户端使用 fetch API
      const response = await fetch(`/api/dealers/${dealerId}/cars`);
      if (!response.ok) {
        throw new Error('获取经销商车型列表失败');
      }
      return await response.json();
    }
  } catch (error) {
    console.error('获取经销商车型列表失败:', error);
    return [];
  }
}

// 获取所有配置分类
export async function getAllConfigCategories(): Promise<ConfigCategory[]> {
  try {
    if (isServer) {
      // 服务器端直接使用 Prisma
      const categories = await prisma.carConfigCategory.findMany({
        orderBy: { name: 'asc' },
        include: {
          options: true
        }
      });
      
      return categories.map(category => ({
        id: category.id,
        categoryKey: category.categoryKey,
        name: category.name,
        description: category.description,
        options: category.options.map(option => ({
          id: option.id,
          optionKey: option.optionKey,
          name: option.name,
          description: option.description,
          price: option.price,
          thumbnail: option.thumbnail || undefined,
          colorCode: option.colorCode || undefined,
          categoryId: category.id
        }))
      }));
    } else {
      // 客户端使用 fetch API
      const response = await fetch('/api/config-categories');
      if (!response.ok) {
        throw new Error('获取配置分类失败');
      }
      return await response.json();
    }
  } catch (error) {
    console.error('获取配置分类失败:', error);
    return [];
  }
}

