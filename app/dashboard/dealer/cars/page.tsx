"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard/layout"
import CarManagement from "@/components/dashboard/car-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function DealerCars() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [allCars, setAllCars] = useState<any[]>([])
  const [activeCars, setActiveCars] = useState<any[]>([])
  const [draftCars, setDraftCars] = useState<any[]>([])
  const [archivedCars, setArchivedCars] = useState<any[]>([])
  const [refreshKey, setRefreshKey] = useState<number>(0)

  // 刷新数据的函数
  const refreshData = () => {
    setRefreshKey(prev => prev + 1)
  }

  // 获取所有车型数据
  useEffect(() => {
    async function fetchAllCars() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/dealer/cars')
        if (response.ok) {
          const data = await response.json()
          setAllCars(data)
          
          // 根据状态过滤车型
          setActiveCars(data.filter((car: any) => car.status === "active"))
          setDraftCars(data.filter((car: any) => car.status === "draft"))
          setArchivedCars(data.filter((car: any) => car.status === "archived"))
        } else {
          console.error('获取车型数据失败')
          toast({
            title: "数据加载失败",
            description: "无法加载车型数据，请稍后重试",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('获取车型数据错误:', error)
        toast({
          title: "数据加载失败",
          description: "获取车型数据时发生错误",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllCars()
  }, [toast, refreshKey]) // 添加refreshKey作为依赖项，当它变化时重新获取数据

  // 获取特定状态的车型
  async function fetchCarsByStatus(status: string) {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/dealer/cars?status=${status}`)
      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        console.error(`获取${status}状态车型数据失败`)
        return []
      }
    } catch (error) {
      console.error(`获取${status}状态车型数据错误:`, error)
      return []
    } finally {
      setIsLoading(false)
    }
  }

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
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-24 rounded" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">全部车型</TabsTrigger>
                  <TabsTrigger value="active">已上线</TabsTrigger>
                  <TabsTrigger value="draft">草稿</TabsTrigger>
                  <TabsTrigger value="archived">已归档</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="pt-4">
                  {allCars.length > 0 ? (
                    <CarManagement cars={allCars} onDataChange={refreshData} />
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">暂无车型数据</p>
                  )}
                </TabsContent>
                <TabsContent value="active" className="pt-4">
                  {activeCars.length > 0 ? (
                    <CarManagement cars={activeCars} onDataChange={refreshData} />
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">暂无已上线车型</p>
                  )}
                </TabsContent>
                <TabsContent value="draft" className="pt-4">
                  {draftCars.length > 0 ? (
                    <CarManagement cars={draftCars} onDataChange={refreshData} />
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">暂无草稿车型</p>
                  )}
                </TabsContent>
                <TabsContent value="archived" className="pt-4">
                  {archivedCars.length > 0 ? (
                    <CarManagement cars={archivedCars} onDataChange={refreshData} />
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">暂无已归档车型</p>
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

