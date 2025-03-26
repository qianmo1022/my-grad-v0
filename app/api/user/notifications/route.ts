import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 定义通知类型枚举
enum NotificationType {
  SYSTEM = 'SYSTEM',
  ORDER = 'ORDER',
  REVIEW = 'REVIEW',
  PROMOTION = 'PROMOTION'
}

// 定义通知接口
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// 获取用户通知
export async function GET(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取查询参数
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const unreadOnly = url.searchParams.get('unread') === 'true';
    
    // 构建查询条件
    const where: any = {
      userId: session.user.id,
    };
    
    if (type) {
      where.type = type.toUpperCase();
    }
    
    if (unreadOnly) {
      where.read = false;
    }
    
    // 从数据库获取通知
    const notifications = await (prisma as any).notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    }) as Notification[];
    
    // 格式化通知数据
    const formattedNotifications = notifications.map((notification: Notification) => ({
      id: notification.id,
      type: notification.type.toLowerCase(),
      title: notification.title,
      message: notification.message,
      date: notification.createdAt.toISOString().split('T')[0],
      read: notification.read,
      link: notification.link,
    }));
    
    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('获取用户通知失败:', error);
    return NextResponse.json({ error: '获取用户通知失败' }, { status: 500 });
  }
}

// 标记通知为已读
export async function PATCH(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    // 获取请求体
    const body = await request.json();
    const { notificationId, all } = body;
    
    if (all) {
      // 标记所有通知为已读
      await (prisma as any).notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });
      
      return NextResponse.json({ success: true, message: '所有通知已标记为已读' });
    } else if (notificationId) {
      // 检查通知是否存在且属于当前用户
      const notification = await (prisma as any).notification.findFirst({
        where: {
          id: notificationId,
          userId: session.user.id,
        },
      });
      
      if (!notification) {
        return NextResponse.json({ error: '通知不存在或无权访问' }, { status: 404 });
      }
      
      // 标记单个通知为已读
      await (prisma as any).notification.update({
        where: {
          id: notificationId,
        },
        data: {
          read: true,
        },
      });
      
      return NextResponse.json({ success: true, message: '通知已标记为已读' });
    } else {
      return NextResponse.json({ error: '请提供通知ID或设置all=true' }, { status: 400 });
    }
  } catch (error) {
    console.error('标记通知失败:', error);
    return NextResponse.json({ error: '标记通知失败' }, { status: 500 });
  }
} 