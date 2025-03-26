import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// 定义销售数据类型
interface SalesDataItem {
  month: string;
  sales: number;
}

interface TopCarModel {
  id: string;
  name: string;
  sales: number;
  revenue: string;
  trend: number;
}

// 数据库中的销售数据记录类型
interface SalesDataRecord {
  id: string;
  date: Date;
  revenue: number;
  orderCount: number;
  period: string;
  dealerId: string;
}

// 获取销售数据
export async function GET(request: Request) {
  try {
    // 获取会话，验证商家身份
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }
    
    const dealerId = session.user.id;
    
    // 查询参数
    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "weekly";
    
    // 计算日期范围
    const today = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "weekly":
        startDate.setDate(today.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(today.getMonth() - 12);
        break;
      case "yearly":
        startDate.setFullYear(today.getFullYear() - 5);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }
    
    // 1. 查询销售数据 - 使用类型断言
    const salesData = await (prisma as any).salesData.findMany({
      where: {
        dealerId,
        period,
        date: {
          gte: startDate,
          lte: today
        }
      },
      orderBy: {
        date: "asc"
      }
    }) as SalesDataRecord[];
    
    // 2. 查询订单数据
    const orders = await prisma.order.findMany({
      where: {
        dealerId,
        createdAt: {
          gte: startDate,
          lte: today
        }
      },
      include: {
        car: {
          select: {
            id: true,
            name: true,
            basePrice: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    // 3. 计算热门车型
    const carSalesMap = new Map<string, {
      id: string;
      name: string;
      sales: number;
      revenue: number;
      trend: number;
    }>();
    
    let totalRevenue = 0;
    
    orders.forEach(order => {
      totalRevenue += order.amount;
      
      const carId = order.car.id;
      const carName = order.car.name;
      
      if (!carSalesMap.has(carId)) {
        carSalesMap.set(carId, {
          id: carId,
          name: carName,
          sales: 0,
          revenue: 0,
          trend: 0 // 真实场景下可以计算趋势
        });
      }
      
      const carData = carSalesMap.get(carId)!;
      carData.sales += 1;
      carData.revenue += order.amount;
      carSalesMap.set(carId, carData);
    });
    
    // 将Map转换为数组并排序
    const topCars: TopCarModel[] = Array.from(carSalesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map(car => ({
        ...car,
        revenue: `¥${car.revenue.toLocaleString()}`,
        trend: Math.random() * 10 - 5 // 模拟随机趋势数据，实际应该基于历史比较
      }));
    
    // 4. 计算平均订单价值
    const averageOrderValue = orders.length > 0 
      ? totalRevenue / orders.length 
      : 0;
    
    // 5. 计算销售趋势
    // 简化处理，真实场景应该比较当前周期和上个周期
    const salesTrend = {
      percentage: Math.random() * 20,
      isPositive: Math.random() > 0.3
    };
    
    // 格式化数据
    let formattedSalesData: SalesDataItem[] = [];
    
    if (salesData.length > 0) {
      formattedSalesData = salesData.map((data: SalesDataRecord) => ({
        month: formatDateLabel(data.date, period),
        sales: data.orderCount
      }));
    } else {
      // 生成模拟数据
      formattedSalesData = generateMockSalesData(period);
    }
    
    return NextResponse.json({
      weekly: period === "weekly" ? formattedSalesData : generateMockSalesData("weekly"),
      monthly: period === "monthly" ? formattedSalesData : generateMockSalesData("monthly"),
      yearly: period === "yearly" ? formattedSalesData : generateMockSalesData("yearly"),
      topCars,
      totalRevenue: `¥${totalRevenue.toLocaleString()}`,
      averageOrderValue: `¥${averageOrderValue.toLocaleString()}`,
      salesTrend
    });
  } catch (error) {
    console.error("获取销售数据失败:", error);
    return NextResponse.json(
      { error: "获取销售数据失败" },
      { status: 500 }
    );
  }
}

// 格式化日期标签
function formatDateLabel(date: Date, period: string): string {
  switch (period) {
    case "weekly":
      return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
    case "monthly":
      return `${date.getMonth() + 1}月`;
    case "yearly":
      return `${date.getFullYear()}`;
    default:
      return date.toLocaleDateString();
  }
}

// 生成模拟销售数据
function generateMockSalesData(period: string): SalesDataItem[] {
  switch (period) {
    case "weekly":
      return [
        { month: "周一", sales: 3 },
        { month: "周二", sales: 5 },
        { month: "周三", sales: 2 },
        { month: "周四", sales: 4 },
        { month: "周五", sales: 7 },
        { month: "周六", sales: 6 },
        { month: "周日", sales: 4 }
      ];
    case "monthly":
      return [
        { month: "1月", sales: 12 },
        { month: "2月", sales: 15 },
        { month: "3月", sales: 18 },
        { month: "4月", sales: 14 },
        { month: "5月", sales: 20 },
        { month: "6月", sales: 25 },
        { month: "7月", sales: 22 },
        { month: "8月", sales: 28 },
        { month: "9月", sales: 30 },
        { month: "10月", sales: 25 },
        { month: "11月", sales: 32 },
        { month: "12月", sales: 35 }
      ];
    case "yearly":
      return [
        { month: "2019", sales: 120 },
        { month: "2020", sales: 145 },
        { month: "2021", sales: 165 },
        { month: "2022", sales: 190 },
        { month: "2023", sales: 210 }
      ];
    default:
      return [];
  }
}
