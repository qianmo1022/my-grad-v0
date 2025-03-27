"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RecentOrders from "@/components/dashboard/recent-orders"
import { Skeleton } from "@/components/ui/skeleton"

export default function DealerOrders() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [processingOrders, setProcessingOrders] = useState<any[]>([])
  const [completedOrders, setCompletedOrders] = useState<any[]>([])

  // 获取所有订单
  useEffect(() => {
    async function fetchAllOrders() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/dealer/orders')
        if (response.ok) {
          const data = await response.json()
          setAllOrders(data)
          // 根据状态过滤订单
          setPendingOrders(data.filter((order: any) => order.status === "pending"))
          setProcessingOrders(data.filter((order: any) => order.status === "processing"))
          setCompletedOrders(data.filter((order: any) => order.status === "completed"))
        } else {
          console.error('获取订单数据失败')
          toast({
            title: "数据加载失败",
            description: "无法加载订单数据，请稍后重试",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('获取订单数据错误:', error)
        toast({
          title: "数据加载失败",
          description: "获取订单数据时发生错误",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllOrders()
  }, [toast])

  return (
    <DashboardLayout userType="dealer">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">订单管理</h2>
          <p className="text-muted-foreground">管理客户订单和跟踪订单状态。</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>订单列表</CardTitle>
            <CardDescription>按状态查看订单</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                <div className="flex space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-24" />
                  ))}
                </div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">全部订单</TabsTrigger>
                  <TabsTrigger value="pending">待处理</TabsTrigger>
                  <TabsTrigger value="processing">处理中</TabsTrigger>
                  <TabsTrigger value="completed">已完成</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="pt-4">
                  {allOrders.length > 0 ? (
                    <RecentOrders orders={allOrders} userType="dealer" />
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">暂无订单</p>
                  )}
                </TabsContent>
                <TabsContent value="pending" className="pt-4">
                  {pendingOrders.length > 0 ? (
                    <RecentOrders orders={pendingOrders} userType="dealer" />
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">暂无待处理订单</p>
                  )}
                </TabsContent>
                <TabsContent value="processing" className="pt-4">
                  {processingOrders.length > 0 ? (
                    <RecentOrders orders={processingOrders} userType="dealer" />
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">暂无处理中订单</p>
                  )}
                </TabsContent>
                <TabsContent value="completed" className="pt-4">
                  {completedOrders.length > 0 ? (
                    <RecentOrders orders={completedOrders} userType="dealer" />
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">暂无已完成订单</p>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

