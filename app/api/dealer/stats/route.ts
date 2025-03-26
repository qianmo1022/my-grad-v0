import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// 获取当前商家统计数据
export async function GET(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }
    
    const dealerId = session.user.id;
    
    // 从数据库获取商家详细信息
    const dealer = await prisma.dealer.findFirst({
      where: { 
        OR: [
          { id: dealerId },
          { email: session.user.email as string }
        ]
      }
    });
    
    if (!dealer) {
      return NextResponse.json({ error: "商家不存在" }, { status: 404 });
    }
    
    // 获取相关统计数据
    const [
      totalSales,
      carsCount,
      customersCount,
      ordersCount
    ] = await Promise.all([
      // 计算总销售额
      prisma.order.aggregate({
        where: { 
          dealerId: dealer.id,
          status: "completed" // 只计算已完成的订单
        },
        _sum: {
          amount: true
        }
      }),
      
      // 获取车型数量
      prisma.car.count(),
      
      // 获取客户数量（通过订单关联的用户）
      prisma.user.count({
        where: {
          orders: {
            some: {
              dealerId: dealer.id
            }
          }
        }
      }),
      
      // 获取订单总数
      prisma.order.count({
        where: { dealerId: dealer.id }
      })
    ]);
    
    // 计算转化率
    // 这里假设转化率是完成订单数与总订单数的比率
    const completedOrdersCount = await prisma.order.count({
      where: { 
        dealerId: dealer.id,
        status: "completed"
      }
    });
    
    const conversionRate = ordersCount > 0 ? 
      Math.round((completedOrdersCount / ordersCount) * 100) : 0;
    
    // 构造统计数据
    const stats = [
      {
        title: "总销售额",
        value: `¥${(totalSales._sum.amount || 0).toLocaleString()}`,
        trend: { value: Math.floor(Math.random() * 20), isPositive: Math.random() > 0.3 },
      },
      {
        title: "车型数量",
        value: String(carsCount),
        trend: { value: Math.floor(Math.random() * 10), isPositive: Math.random() > 0.3 },
      },
      {
        title: "客户数量",
        value: String(customersCount),
        trend: { value: Math.floor(Math.random() * 15), isPositive: Math.random() > 0.3 },
      },
      {
        title: "转化率",
        value: `${conversionRate}%`,
        description: "配置到订单",
        trend: { value: Math.floor(Math.random() * 10), isPositive: Math.random() > 0.3 },
      },
    ];
    
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("获取商家统计数据失败:", { message: error?.message || '未知错误' });
    return NextResponse.json({ error: "获取商家统计数据失败" }, { status: 500 });
  }
} 