import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 定义接口
interface ReviewStat {
  rating: number;
  _count: {
    rating: number;
  };
}

interface Review {
  id: string;
  userId: string;
  carId: string;
  title: string;
  content: string;
  rating: number;
  helpful: number;
  verified: boolean;
  tags: string[];
  images: string[];
  configurationId?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    firstName?: string;
    lastName?: string;
  };
}

// 获取车型评价
export async function GET(
  request: Request,
  { params }: { params: { carId: string } }
) {
  try {
    const { carId } = await params;
    
    // 获取查询参数
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const ratingFilter = url.searchParams.get('rating');
    const sortBy = url.searchParams.get('sortBy') || 'recent'; // recent, helpful, highest, lowest
    
    // 检查车型是否存在
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 构建查询条件
    const where: any = { carId };
    
    if (ratingFilter && !isNaN(parseInt(ratingFilter))) {
      where.rating = parseInt(ratingFilter);
    }
    
    // 构建排序条件
    let orderBy: any;
    switch (sortBy) {
      case 'helpful':
        orderBy = { helpful: 'desc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }
    
    // 从数据库获取评价
    const reviews = await (prisma as any).review.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }) as Review[];
    
    // 计算平均评分和评分分布
    const reviewStats = await (prisma as any).review.groupBy({
      by: ['rating'],
      where: { carId },
      _count: {
        rating: true,
      },
    }) as ReviewStat[];
    
    const totalReviews = await (prisma as any).review.count({
      where: { carId },
    });
    
    // 计算平均评分
    let averageRating = 0;
    if (totalReviews > 0) {
      const ratingSum = reviewStats.reduce((sum: number, stat: ReviewStat) => {
        return sum + (stat.rating * stat._count.rating);
      }, 0);
      averageRating = ratingSum / totalReviews;
    }
    
    // 计算评分分布
    const ratingDistribution = [0, 0, 0, 0, 0]; // 1星到5星的数量
    reviewStats.forEach((stat: ReviewStat) => {
      if (stat.rating >= 1 && stat.rating <= 5) {
        ratingDistribution[stat.rating - 1] = stat._count.rating;
      }
    });
    
    // 格式化评价数据
    const formattedReviews = reviews.map((review: Review) => {
      // 获取用户名
      let userName = '匿名用户';
      if (review.user.firstName || review.user.lastName) {
        if (review.user.lastName && review.user.firstName) {
          userName = `${review.user.lastName}${review.user.firstName}`;
        } else {
          userName = review.user.firstName || review.user.lastName || '匿名用户';
        }
      }
      
      return {
        id: review.id,
        userId: review.userId,
        userName,
        rating: review.rating,
        title: review.title,
        content: review.content,
        date: review.createdAt.toISOString().split('T')[0],
        helpful: review.helpful,
        verified: review.verified,
        tags: review.tags,
        images: review.images,
        configurationId: review.configurationId,
      };
    });
    
    return NextResponse.json({
      reviews: formattedReviews,
      stats: {
        average: averageRating.toFixed(1),
        count: totalReviews,
        distribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error('获取车型评价失败:', error);
    return NextResponse.json({ error: '获取车型评价失败' }, { status: 500 });
  }
}