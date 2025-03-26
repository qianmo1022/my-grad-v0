import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 定义Review接口，与schema.prisma保持一致
interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  helpful: number;
  verified: boolean;
  images: string[];
  tags: string[];
  configurationId?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  carId: string;
  car: {
    id: string;
    name: string;
    thumbnail: string;
  };
}

// 获取用户的所有评论
export async function GET(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取查询参数
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const offset = (page - 1) * limit;
    
    // 由于Review模型可能尚未在数据库中创建，我们先添加一个临时的try-catch
    try {
      // 获取用户的评论
      const reviews = await (prisma as any).review.findMany({
        where: { userId: session.user.id },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          car: {
            select: {
              id: true,
              name: true,
              thumbnail: true,
            },
          },
        },
      }) as Review[];
      
      // 获取评论总数
      const totalCount = await (prisma as any).review.count({
        where: { userId: session.user.id },
      });
      
      // 格式化响应数据
      const formattedReviews = reviews.map((review: Review) => ({
        id: review.id,
        title: review.title,
        content: review.content,
        rating: review.rating,
        date: review.createdAt,
        car: {
          id: review.car.id,
          name: review.car.name,
          thumbnail: review.car.thumbnail,
        },
        helpful: review.helpful,
        verified: review.verified,
      }));
      
      return NextResponse.json({
        reviews: formattedReviews,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      // 如果Review表不存在，返回空数组
      console.error('获取评论信息失败:', error);
      return NextResponse.json({
        reviews: [],
        pagination: {
          total: 0,
          page: 1,
          limit,
          pages: 0,
        },
      });
    }
  } catch (error) {
    console.error('获取用户评论失败:', error);
    return NextResponse.json({ error: '获取用户评论失败' }, { status: 500 });
  }
}

// 创建新评论
export async function POST(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 解析请求体
    const body = await request.json();
    const { carId, title, content, rating } = body;
    
    // 参数验证
    if (!carId || !title || !content || !rating) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: '评分必须在1到5之间' }, { status: 400 });
    }
    
    // 检查车型是否存在
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });
    
    if (!car) {
      return NextResponse.json({ error: '车型不存在' }, { status: 404 });
    }
    
    // 检查用户是否已评论过该车型
    try {
      const existingReview = await (prisma as any).review.findFirst({
        where: {
          userId: session.user.id,
          carId,
        },
      });
      
      if (existingReview) {
        return NextResponse.json({ error: '您已经评论过该车型' }, { status: 400 });
      }
      
      // 创建新评论
      const newReview = await (prisma as any).review.create({
        data: {
          userId: session.user.id,
          carId,
          title,
          content,
          rating,
          helpful: 0,
          verified: false,
          tags: [],
          images: [],
        },
      });
      
      return NextResponse.json({
        id: newReview.id,
        title: newReview.title,
        content: newReview.content,
        rating: newReview.rating,
        date: newReview.createdAt,
      });
    } catch (error) {
      console.error('创建评论失败:', error);
      return NextResponse.json({ error: 'Review表可能不存在，请先创建数据库表' }, { status: 500 });
    }
  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json({ error: '创建评论失败' }, { status: 500 });
  }
} 