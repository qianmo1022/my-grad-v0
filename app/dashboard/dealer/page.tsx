import DashboardLayout from "@/components/dashboard/layout"
import StatsCard from "@/components/dashboard/stats-card"
import RecentOrders from "@/components/dashboard/recent-orders"
import CarManagement from "@/components/dashboard/car-management"
import SalesChart from "@/components/dashboard/sales-chart"
import { Car, Users, CreditCard, TrendingUp } from "lucide-react"

export default function DealerDashboard() {
  // 模拟数据
  const stats = [
    {
      title: "总销售额",
      value: "¥3,250,000",
      icon: <CreditCard className="h-4 w-4" />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "车型数量",
      value: "15",
      icon: <Car className="h-4 w-4" />,
      trend: { value: 5, isPositive: true },
    },
    {
      title: "客户数量",
      value: "128",
      icon: <Users className="h-4 w-4" />,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "转化率",
      value: "24%",
      icon: <TrendingUp className="h-4 w-4" />,
      description: "配置到订单",
      trend: { value: 3, isPositive: true },
    },
  ]

  const orders = [
    {
      id: "ORD-001",
      car: "豪华轿车 - 高配版",
      date: "2023-11-15",
      amount: "¥385,000",
      status: "completed" as const,
    },
    {
      id: "ORD-002",
      car: "城市SUV - 标准版",
      date: "2023-12-03",
      amount: "¥292,000",
      status: "processing" as const,
    },
    {
      id: "ORD-003",
      car: "跑车系列 - 性能版",
      date: "2024-01-10",
      amount: "¥665,000",
      status: "pending" as const,
    },
    {
      id: "ORD-004",
      car: "豪华轿车 - 商务版",
      date: "2024-01-22",
      amount: "¥372,000",
      status: "processing" as const,
    },
  ]

  const cars = [
    {
      id: "CAR-001",
      name: "豪华轿车",
      thumbnail: "/placeholder.svg?height=100&width=160",
      basePrice: "¥350,000",
      status: "active" as const,
      sales: 28,
    },
    {
      id: "CAR-002",
      name: "城市SUV",
      thumbnail: "/placeholder.svg?height=100&width=160",
      basePrice: "¥280,000",
      status: "active" as const,
      sales: 42,
    },
    {
      id: "CAR-003",
      name: "跑车系列",
      thumbnail: "/placeholder.svg?height=100&width=160",
      basePrice: "¥580,000",
      status: "active" as const,
      sales: 15,
    },
    {
      id: "CAR-004",
      name: "紧凑型轿车",
      thumbnail: "/placeholder.svg?height=100&width=160",
      basePrice: "¥180,000",
      status: "draft" as const,
      sales: 0,
    },
  ]

  const salesData = {
    weekly: [
      { month: "周一", sales: 5 },
      { month: "周二", sales: 8 },
      { month: "周三", sales: 12 },
      { month: "周四", sales: 10 },
      { month: "周五", sales: 15 },
      { month: "周六", sales: 18 },
      { month: "周日", sales: 14 },
    ],
    monthly: [
      { month: "1月", sales: 42 },
      { month: "2月", sales: 38 },
      { month: "3月", sales: 45 },
      { month: "4月", sales: 50 },
      { month: "5月", sales: 55 },
      { month: "6月", sales: 60 },
      { month: "7月", sales: 58 },
      { month: "8月", sales: 65 },
      { month: "9月", sales: 70 },
      { month: "10月", sales: 75 },
      { month: "11月", sales: 80 },
      { month: "12月", sales: 85 },
    ],
    yearly: [
      { month: "2019", sales: 320 },
      { month: "2020", sales: 280 },
      { month: "2021", sales: 350 },
      { month: "2022", sales: 420 },
      { month: "2023", sales: 480 },
      { month: "2024", sales: 180 },
    ],
  }

  return (
    <DashboardLayout userType="dealer">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">欢迎回来，豪华汽车4S店</h2>
          <p className="text-muted-foreground">这是您的商家面板，您可以在这里管理车型、订单和查看销售数据。</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SalesChart data={salesData} />
          <RecentOrders orders={orders} userType="dealer" />
        </div>

        <CarManagement cars={cars} />
      </div>
    </DashboardLayout>
  )
}

