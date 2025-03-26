import DashboardLayout from "@/components/dashboard/layout"
import CarManagement from "@/components/dashboard/car-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DealerCars() {
  // 模拟数据
  const allCars = [
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
    {
      id: "CAR-005",
      name: "电动轿车",
      thumbnail: "/placeholder.svg?height=100&width=160",
      basePrice: "¥320,000",
      status: "active" as const,
      sales: 22,
    },
    {
      id: "CAR-006",
      name: "豪华SUV",
      thumbnail: "/placeholder.svg?height=100&width=160",
      basePrice: "¥450,000",
      status: "active" as const,
      sales: 18,
    },
    {
      id: "CAR-007",
      name: "经典轿车",
      thumbnail: "/placeholder.svg?height=100&width=160",
      basePrice: "¥280,000",
      status: "archived" as const,
      sales: 35,
    },
  ]

  const activeCars = allCars.filter((car) => car.status === "active")
  const draftCars = allCars.filter((car) => car.status === "draft")
  const archivedCars = allCars.filter((car) => car.status === "archived")

  return (
    <DashboardLayout userType="dealer">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">车型管理</h2>
          <p className="text-muted-foreground">管理您的车型和配置选项。</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>车型列表</CardTitle>
            <CardDescription>按状态查看您的车型</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">全部车型</TabsTrigger>
                <TabsTrigger value="active">已上线</TabsTrigger>
                <TabsTrigger value="draft">草稿</TabsTrigger>
                <TabsTrigger value="archived">已归档</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="pt-4">
                <CarManagement cars={allCars} />
              </TabsContent>
              <TabsContent value="active" className="pt-4">
                <CarManagement cars={activeCars} />
              </TabsContent>
              <TabsContent value="draft" className="pt-4">
                <CarManagement cars={draftCars} />
              </TabsContent>
              <TabsContent value="archived" className="pt-4">
                <CarManagement cars={archivedCars} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

