import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createReviewNotification } from '@/lib/notification';

export async function POST(request: Request) {
  try {
    // 获取当前会话信息，确保用户已登录
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取请求体中的评价ID
    const body = await request.json();
    const { reviewId } = body;
    
    if (!reviewId) {
      return NextResponse.json({ error: '缺少评价ID' }, { status: 400 });
    }
    
    // 获取评价信息
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        car: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (!review) {
      return NextResponse.json({ error: '评价不存在' }, { status: 404 });
    }
    
    // 由于没有ReviewHelpful模型，我们直接增加评价的有帮助计数
    // 注意：这种方法无法检查用户是否已标记过此评价
    // 在实际生产环境中，应该添加ReviewHelpful模型并进行迁移
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpful: { increment: 1 }
      }
    });
    
    // 如果当前用户不是评价的发布者，则向评价发布者发送通知
    if (review.userId !== session.user.id) {
      try {
        // 创建通知
        await createReviewNotification(
          review.userId,
          '您的评价很受欢迎',
          `您对${review.car.name}的评价获得了一个有帮助标记`,
          reviewId
        );
      } catch (notifyError) {
        // 如果通知创建失败，记录错误但不中断流程
        console.error('创建评价通知失败:', notifyError);
      }
    }
    
    return NextResponse.json({
      success: true,
      helpfulCount: updatedReview.helpful
    });
  } catch (error) {
    console.error('标记评价为有帮助失败:', error);
    return NextResponse.json({ error: '标记评价为有帮助失败' }, { status: 500 });
  }
} 