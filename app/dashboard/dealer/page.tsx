"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard/layout"
import StatsCard from "@/components/dashboard/stats-card"
import RecentOrders from "@/components/dashboard/recent-orders"
import CarManagement from "@/components/dashboard/car-management"
import SalesChart from "@/components/dashboard/sales-chart"
import { Car, Users, CreditCard, TrendingUp } from "lucide-react"

export default function DealerDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [stats, setStats] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [cars, setCars] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any>({
    weekly: [],
    monthly: [],
    yearly: []
  })
  const [dealerName, setDealerName] = useState<string>("商家")

  // 获取商家名称
  useEffect(() => {
    if (session?.user) {
      setDealerName(session.user.name || "商家")
    }
  }, [session])

  // 获取统计数据
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dealer/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          console.error('获取统计数据失败')
          // 设置默认统计数据
          setStats([
            {
              title: "总销售额",
              value: "¥0",
              icon: <CreditCard className="h-4 w-4" />,
              trend: { value: 0, isPositive: true },
            },
            {
              title: "车型数量",
              value: "0",
              icon: <Car className="h-4 w-4" />,
              trend: { value: 0, isPositive: true },
            },
            {
              title: "客户数量",
              value: "0",
              icon: <Users className="h-4 w-4" />,
              trend: { value: 0, isPositive: true },
            },
            {
              title: "转化率",
              value: "0%",
              icon: <TrendingUp className="h-4 w-4" />,
              description: "配置到订单",
              trend: { value: 0, isPositive: true },
            },
          ])
        }
      } catch (error) {
        console.error('获取统计数据错误:', error)
        toast({
          title: "数据加载失败",
          description: "无法加载统计数据，请稍后重试",
          variant: "destructive",
        })
      }
    }

    fetchStats()
  }, [toast])

  // 获取订单数据
  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch('/api/dealer/orders?limit=4')
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        } else {
          console.error('获取订单数据失败')
          setOrders([])
        }
      } catch (error) {
        console.error('获取订单数据错误:', error)
        setOrders([])
      }
    }

    fetchOrders()
  }, [])

  // 获取车型数据
  useEffect(() => {
    async function fetchCars() {
      try {
        const response = await fetch('/api/dealer/cars')
        if (response.ok) {
          const data = await response.json()
          setCars(data.slice(0, 4)) // 只显示前4个
        } else {
          console.error('获取车型数据失败')
          setCars([])
        }
      } catch (error) {
        console.error('获取车型数据错误:', error)
        setCars([])
      }
    }

    fetchCars()
  }, [])

  // 获取销售数据
  useEffect(() => {
    async function fetchSalesData() {
      try {
        const response = await fetch('/api/dealer/sales')
        if (response.ok) {
          const data = await response.json()
          setSalesData(data)
        } else {
          console.error('获取销售数据失败')
          // 保持默认空数据
        }
      } catch (error) {
        console.error('获取销售数据错误:', error)
        // 保持默认空数据
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesData()
  }, [])

  // 添加图标到统计数据
  const statsWithIcons = stats.map(stat => {
    let icon;
    switch(stat.title) {
      case "总销售额":
        icon = <CreditCard className="h-4 w-4" />;
        break;
      case "车型数量":
        icon = <Car className="h-4 w-4" />;
        break;
      case "客户数量":
        icon = <Users className="h-4 w-4" />;
        break;
      case "转化率":
        icon = <TrendingUp className="h-4 w-4" />;
        break;
      default:
        icon = null;
    }
    return { ...stat, icon };
  });

  return (
    <DashboardLayout userType="dealer">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">欢迎回来，{dealerName}</h2>
          <p className="text-muted-foreground">这是您的商家面板，您可以在这里管理车型、订单和查看销售数据。</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">加载数据中...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statsWithIcons.map((stat, index) => (
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
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

