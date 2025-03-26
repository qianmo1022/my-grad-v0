import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RecentOrders from "@/components/dashboard/recent-orders"

export default function UserOrders() {
  // 模拟数据
  const allOrders = [
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
      status: "completed" as const,
    },
    {
      id: "ORD-005",
      car: "紧凑型轿车 - 经济版",
      date: "2024-02-05",
      amount: "¥192,000",
      status: "cancelled" as const,
    },
  ]

  const pendingOrders = allOrders.filter((order) => order.status === "pending")
  const processingOrders = allOrders.filter((order) => order.status === "processing")
  const completedOrders = allOrders.filter((order) => order.status === "completed")

  return (
    <DashboardLayout userType="user">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">我的订单</h2>
          <p className="text-muted-foreground">查看和管理您的所有订单记录。</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>订单管理</CardTitle>
            <CardDescription>按状态查看您的订单</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">全部订单</TabsTrigger>
                <TabsTrigger value="pending">待处理</TabsTrigger>
                <TabsTrigger value="processing">处理中</TabsTrigger>
                <TabsTrigger value="completed">已完成</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="pt-4">
                <RecentOrders orders={allOrders} userType="user" />
              </TabsContent>
              <TabsContent value="pending" className="pt-4">
                <RecentOrders orders={pendingOrders} userType="user" />
              </TabsContent>
              <TabsContent value="processing" className="pt-4">
                <RecentOrders orders={processingOrders} userType="user" />
              </TabsContent>
              <TabsContent value="completed" className="pt-4">
                <RecentOrders orders={completedOrders} userType="user" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

