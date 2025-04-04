import { prisma } from './db';

// 通知类型
export enum NotificationType {
  SYSTEM = 'SYSTEM',
  ORDER = 'ORDER',
  REVIEW = 'REVIEW',
  PROMOTION = 'PROMOTION'
}

// 创建通知接口
interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * 创建新通知
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link
}: CreateNotificationParams): Promise<any> {
  try {
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // 创建通知
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        read: false,
        link,
        user: {
          connect: { id: userId }
        }
      }
    });

    return notification;
  } catch (error) {
    console.error('创建通知失败:', error);
    throw error;
  }
}

/**
 * 创建系统通知
 */
export async function createSystemNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
): Promise<any> {
  return createNotification({
    userId,
    type: NotificationType.SYSTEM,
    title,
    message,
    link
  });
}

/**
 * 创建订单相关通知
 */
export async function createOrderNotification(
  userId: string,
  title: string,
  message: string,
  orderId?: string
): Promise<any> {
  const link = orderId ? `/dashboard/user/orders/${orderId}` : '/dashboard/user/orders';
  
  return createNotification({
    userId,
    type: NotificationType.ORDER,
    title,
    message,
    link
  });
}

/**
 * 创建评价相关通知
 */
export async function createReviewNotification(
  userId: string,
  title: string,
  message: string,
  reviewId?: string
): Promise<any> {
  const link = reviewId ? `/dashboard/user/reviews/${reviewId}` : '/dashboard/user/reviews';
  
  return createNotification({
    userId,
    type: NotificationType.REVIEW,
    title,
    message,
    link
  });
}

/**
 * 创建促销相关通知
 */
export async function createPromotionNotification(
  userId: string,
  title: string,
  message: string,
  link: string
): Promise<any> {
  return createNotification({
    userId,
    type: NotificationType.PROMOTION,
    title,
    message,
    link
  });
}

/**
 * 为多个用户创建相同通知
 */
export async function createNotificationForUsers(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  link?: string
): Promise<any[]> {
  try {
    const notifications = await Promise.all(
      userIds.map(userId =>
        createNotification({
          userId,
          type,
          title,
          message,
          link
        }).catch(error => {
          console.error(`为用户 ${userId} 创建通知失败:`, error);
          return null;
        })
      )
    );

    return notifications.filter(notification => notification !== null);
  } catch (error) {
    console.error('批量创建通知失败:', error);
    throw error;
  }
}

/**
 * 创建系统广播通知
 */
export async function createSystemBroadcast(
  title: string,
  message: string,
  link?: string
): Promise<any[]> {
  try {
    // 获取所有用户
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    const userIds = users.map(user => user.id);
    
    return createNotificationForUsers(
      userIds,
      NotificationType.SYSTEM,
      title,
      message,
      link
    );
  } catch (error) {
    console.error('创建系统广播通知失败:', error);
    throw error;
  }
}

/**
 * 获取用户未读通知数量
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });

    return count;
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    return 0;
  }
}

/**
 * 删除所有已读通知
 */
export async function clearReadNotifications(userId: string): Promise<number> {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        read: true
      }
    });

    return result.count;
  } catch (error) {
    console.error('清除已读通知失败:', error);
    throw error;
  }
} 