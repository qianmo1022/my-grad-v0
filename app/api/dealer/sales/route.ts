import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// 获取商家销售数据
export async function GET(request: Request) {
  try {
    // 获取当前会话信息
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.type !== "dealer") {
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
    
    // 准备销售数据
    const currentDate = new Date();
    
    // 生成每周数据（过去7天）
    const weeklyData = [];
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      
      // 查询当天的订单数量
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const orderCount = await prisma.order.count({
        where: {
          dealerId: dealer.id,
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });
      
      weeklyData.push({
        month: weekDays[date.getDay()], // 使用对应的星期名称
        sales: orderCount
      });
    }
    
    // 生成每月数据（过去12个月）
    const monthlyData = [];
    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      const month = date.getMonth();
      const year = date.getFullYear();
      
      // 获取当月第一天和最后一天
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      const orderCount = await prisma.order.count({
        where: {
          dealerId: dealer.id,
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });
      
      monthlyData.push({
        month: monthNames[month],
        sales: orderCount
      });
    }
    
    // 生成每年数据（过去5年）
    const yearlyData = [];
    const currentYear = currentDate.getFullYear();
    for (let i = 5; i >= 0; i--) {
      const year = currentYear - i;
      
      // 获取该年第一天和最后一天
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
      
      const orderCount = await prisma.order.count({
        where: {
          dealerId: dealer.id,
          createdAt: {
            gte: yearStart,
            lte: yearEnd
          }
        }
      });
      
      yearlyData.push({
        month: year.toString(),
        sales: orderCount
      });
    }
    
    return NextResponse.json({
      weekly: weeklyData,
      monthly: monthlyData,
      yearly: yearlyData
    });
  } catch (error) {
    console.error("获取销售数据失败:", error);
    return NextResponse.json({ error: "获取销售数据失败" }, { status: 500 });
  }
}
