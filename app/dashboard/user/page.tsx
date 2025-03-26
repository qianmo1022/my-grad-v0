import DashboardLayout from "@/components/dashboard/layout"
import StatsCard from "@/components/dashboard/stats-card"
import RecentOrders from "@/components/dashboard/recent-orders"
import SavedConfigs from "@/components/dashboard/saved-configs"
import { Car, ShoppingCart, Heart, Clock } from "lucide-react"
import RecommendedCars from "@/components/dashboard/recommended-cars"
import { getRecommendedCars } from "@/lib/recommendation"

export default function UserDashboard() {
  // 模拟数据
  const stats = [
    {
      title: "已保存配置",
      value: "5",
      icon: <Car className="h-4 w-4" />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "订单总数",
      value: "8",
      icon: <ShoppingCart className="h-4 w-4" />,
      trend: { value: 5, isPositive: true },
    },
    {
      title: "收藏车型",
      value: "12",
      icon: <Heart className="h-4 w-4" />,
      trend: { value: 3, isPositive: true },
    },
    {
      title: "最近浏览",
      value: "24",
      icon: <Clock className="h-4 w-4" />,
      description: "过去30天内",
      trend: { value: 8, isPositive: true },
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
  ]

  const savedConfigs = [
    {
      id: "CFG-001",
      carName: "豪华轿车 - 个性定制",
      thumbnail: "/placeholder.svg?height=200&width=300",
      date: "2023-12-20",
      price: "¥398,000",
    },
    {
      id: "CFG-002",
      carName: "城市SUV - 家庭版",
      thumbnail: "/placeholder.svg?height=200&width=300",
      date: "2024-01-05",
      price: "¥312,000",
    },
    {
      id: "CFG-003",
      carName: "跑车系列 - 赛道版",
      thumbnail: "/placeholder.svg?height=200&width=300",
      date: "2024-01-18",
      price: "¥688,000",
    },
    {
      id: "CFG-004",
      carName: "豪华轿车 - 商务版",
      thumbnail: "/placeholder.svg?height=200&width=300",
      date: "2024-02-02",
      price: "¥372,000",
    },
  ]

  return (
    <DashboardLayout userType="user">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">欢迎回来，张先生</h2>
          <p className="text-muted-foreground">这是您的用户面板，您可以在这里管理您的汽车配置和订单。</p>
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
          <SavedConfigs configs={savedConfigs} />
          <RecentOrders orders={orders} userType="user" />
        </div>
        <div className="mt-6">
          <RecommendedCars cars={getRecommendedCars(3)} />
        </div>
      </div>
    </DashboardLayout>
  )
}

