import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// 获取当前用户统计数据
export async function GET() {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // 从数据库获取用户详细信息
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: userId },
          { email: session.user.email as string }
        ]
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    // 获取相关统计数据
    const [
      savedConfigurationsCount,
      ordersCount,
      // 假设有favorites表，如果没有可以根据实际情况调整
      favoritesCount,
      // 获取最近30天的浏览历史数量
      recentBrowsingCount
    ] = await Promise.all([
      prisma.savedConfiguration.count({
        where: { userId: user.id }
      }),
      prisma.order.count({
        where: { userId: user.id }
      }),
      // 这里假设使用SavedConfiguration作为收藏的表
      // 在实际应用中可能需要单独的favorites表
      prisma.savedConfiguration.count({
        where: { 
          userId: user.id,
          // 可以添加额外条件区分保存的配置和收藏
        }
      }),
      prisma.browsingHistory.count({
        where: {
          userId: user.id,
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30天内
          }
        }
      })
    ]);
    
    // 计算趋势（实际应用中可能需要更复杂的计算）
    // 这里简单模拟一下趋势
    const stats = [
      {
        title: "已保存配置",
        value: savedConfigurationsCount.toString(),
        trend: { value: Math.floor(Math.random() * 20), isPositive: Math.random() > 0.3 },
      },
      {
        title: "订单总数",
        value: ordersCount.toString(),
        trend: { value: Math.floor(Math.random() * 10), isPositive: Math.random() > 0.3 },
      },
      {
        title: "最近浏览",
        value: recentBrowsingCount.toString(),
        description: "过去30天内",
        trend: { value: Math.floor(Math.random() * 25), isPositive: Math.random() > 0.3 },
      },
    ];
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('获取用户统计数据失败:', error);
    return NextResponse.json({ error: '获取用户统计数据失败' }, { status: 500 });
  }
} 