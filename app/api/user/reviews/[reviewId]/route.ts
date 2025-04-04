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
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

// 获取特定评价的详细信息
export async function GET(request: Request, { params }: { params: { reviewId: string } }) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    // 获取评价ID
    const { reviewId } = params;
    
    if (!reviewId) {
      return NextResponse.json({ error: '缺少评价ID' }, { status: 400 });
    }
    
    try {
      // 查询评价信息
      const review = await (prisma as any).review.findUnique({
        where: { id: reviewId },
        include: {
          car: {
            select: {
              id: true,
              name: true,
              thumbnail: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }) as Review | null;
      
      if (!review) {
        return NextResponse.json({ error: '评价不存在' }, { status: 404 });
      }
      
      // 构造用户名
      let userName = '用户';
      if (review.user?.firstName || review.user?.lastName) {
        userName = `${review.user.lastName || ''}${review.user.firstName || ''}`;
      }
      
      // 格式化响应数据
      const formattedReview = {
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
        user: {
          id: review.userId,
          name: userName,
          avatar: "/placeholder.svg?height=40&width=40",
        },
        helpful: review.helpful,
        verified: review.verified,
        tags: review.tags,
        images: review.images,
        configurationId: review.configurationId,
      };
      
      return NextResponse.json(formattedReview);
    } catch (error) {
      // 如果Review表不存在或查询出错
      console.error('获取评价详情失败:', error);
      return NextResponse.json({ error: 'Review表可能不存在，请先创建数据库表' }, { status: 500 });
    }
  } catch (error) {
    console.error('获取评价详情失败:', error);
    return NextResponse.json({ error: '获取评价详情失败' }, { status: 500 });
  }
}