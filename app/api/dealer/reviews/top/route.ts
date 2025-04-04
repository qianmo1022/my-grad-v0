import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 获取当前会话信息，确保用户已登录并且是经销商
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取评分高且有帮助标记多的评价
    const topReviews = await prisma.review.findMany({
      where: {
        helpful: {
          gt: 0
        }
      },
      orderBy: [
        { helpful: 'desc' },
        { rating: 'desc' }
      ],
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        car: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // 格式化评价数据
    const formattedReviews = topReviews.map(review => ({
      id: review.id,
      title: review.title,
      content: review.content,
      rating: review.rating,
      helpful: review.helpful,
      userName: review.user.firstName && review.user.lastName
        ? `${review.user.firstName} ${review.user.lastName}`
        : '匿名用户',
      carName: review.car.name,
      carId: review.car.id,
      date: review.createdAt.toLocaleDateString('zh-CN')
    }));
    
    return NextResponse.json({
      success: true,
      reviews: formattedReviews
    });
  } catch (error) {
    console.error('获取热门评价失败:', error);
    return NextResponse.json({ error: '获取热门评价失败' }, { status: 500 });
  }
} 