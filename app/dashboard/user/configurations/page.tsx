import DashboardLayout from "@/components/dashboard/layout"
import SavedConfigs from "@/components/dashboard/saved-configs"

export default function UserConfigurations() {
  // 模拟数据
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
    {
      id: "CFG-005",
      carName: "紧凑型轿车 - 经济版",
      thumbnail: "/placeholder.svg?height=200&width=300",
      date: "2024-02-15",
      price: "¥192,000",
    },
    {
      id: "CFG-006",
      carName: "城市SUV - 越野版",
      thumbnail: "/placeholder.svg?height=200&width=300",
      date: "2024-02-28",
      price: "¥328,000",
    },
  ]

  return (
    <DashboardLayout userType="user">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">我的配置</h2>
          <p className="text-muted-foreground">查看和管理您保存的所有汽车配置方案。</p>
        </div>

        <SavedConfigs configs={savedConfigs} />
      </div>
    </DashboardLayout>
  )
}

