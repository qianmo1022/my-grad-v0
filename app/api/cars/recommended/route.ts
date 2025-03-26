import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 定义车型特性接口
interface CarFeature {
  featureKey: string;
  score: number;
}

// 定义车型接口
interface Car {
  id: string;
  name: string;
  thumbnail: string;
  basePrice: number;
  description: string;
  features?: CarFeature[];
}

// 定义用户偏好接口
interface UserPreference {
  id?: string;
  userId: string;
  name: string;
  value: number;
}

// 定义用户浏览历史接口
interface BrowsingHistory {
  id?: string;
  userId: string;
  carId: string;
  timestamp: Date;
}

// 定义保存的配置接口
interface SavedConfiguration {
  id: string;
  userId: string;
  carId: string;
}

// 获取推荐车型
export async function GET(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    // 获取查询参数
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '3', 10);
    
    // 获取所有车型
    const allCars = await prisma.car.findMany({
      select: {
        id: true,
        name: true,
        thumbnail: true,
        basePrice: true,
        description: true,
      },
    });

    // 车型合集 - 因为目前数据库还没有CarFeature表，我们使用模拟数据
    const carsWithFeatures: Car[] = allCars.map(car => ({
      ...car,
      features: [
        { featureKey: 'performance', score: Math.floor(Math.random() * 10) + 1 },
        { featureKey: 'comfort', score: Math.floor(Math.random() * 10) + 1 },
        { featureKey: 'efficiency', score: Math.floor(Math.random() * 10) + 1 },
        { featureKey: 'safety', score: Math.floor(Math.random() * 10) + 1 },
      ]
    }));
    
    // 如果用户登录，则基于用户偏好推荐车型
    if (session?.user?.id) {
      // 获取用户偏好 - 这里可能需要模拟数据，因为UserPreference表可能还不存在
      const userPreferences: UserPreference[] = []; // 暂时使用空数组，后续可以替换为数据库查询
      
      // 获取用户浏览历史 - 这里可能需要模拟数据，因为BrowsingHistory表可能还不存在
      const userHistory: BrowsingHistory[] = []; // 暂时使用空数组，后续可以替换为数据库查询
      
      // 获取用户保存的配置
      const userConfigurations: SavedConfiguration[] = await prisma.savedConfiguration.findMany({
        where: { userId: session.user.id },
      }).catch(() => []);  // 如果表不存在，返回空数组
      
      // 计算每个车型的匹配分数
      const carScores = carsWithFeatures.map(car => {
        let score = 0;
        
        // 基于车型特性和用户偏好计算分数
        userPreferences.forEach(pref => {
          const feature = car.features?.find(f => f.featureKey.toLowerCase() === pref.name.toLowerCase());
          if (feature) {
            score += feature.score * pref.value;
          }
        });
        
        // 基于浏览历史增加分数
        userHistory.forEach(history => {
          if (history.carId === car.id) {
            score += 10;
          }
        });
        
        // 基于保存的配置增加分数
        userConfigurations.forEach(config => {
          if (config.carId === car.id) {
            score += 20;
          }
        });
        
        return {
          car,
          score,
        };
      });
      
      // 按分数降序排序并返回前N个车型
      carScores.sort((a, b) => b.score - a.score);
      const recommendedCars = carScores.slice(0, limit).map(item => {
        const car = item.car;
        return {
          id: car.id,
          name: car.name,
          thumbnail: car.thumbnail,
          basePrice: car.basePrice,  // 保留为数字，不转换为字符串
          description: car.description,
        };
      });
      
      return NextResponse.json(recommendedCars);
    }
    
    // 如果用户未登录，则返回随机推荐
    const shuffledCars = carsWithFeatures.sort(() => 0.5 - Math.random());
    const randomRecommendations = shuffledCars.slice(0, limit).map(car => ({
      id: car.id,
      name: car.name,
      thumbnail: car.thumbnail,
      basePrice: car.basePrice,  // 保留为数字，不转换为字符串
      description: car.description,
    }));
    
    return NextResponse.json(randomRecommendations);
  } catch (error) {
    console.error('获取推荐车型失败:', error);
    return NextResponse.json({ error: '获取推荐车型失败' }, { status: 500 });
  }
} 