"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Download, TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Car, Clock, FileBarChart } from "lucide-react"
import { BarChart, LineChart, PieChart } from "@/components/dashboard/echarts/charts"
import { formatCurrency } from "@/lib/utils"

// 热门车型数据
interface TopCarModel {
  id: string
  name: string
  sales: number
  revenue: string
  trend: number
}

// 销售数据
interface SalesData {
  weekly: { month: string, sales: number }[]
  monthly: { month: string, sales: number }[]
  yearly: { month: string, sales: number }[]
}

export default function DealerReports() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("weekly")
  const [salesData, setSalesData] = useState<SalesData>({
    weekly: [],
    monthly: [],
    yearly: []
  })
  const [topCars, setTopCars] = useState<TopCarModel[]>([])
  const [salesTrend, setSalesTrend] = useState({ 
    percentage: 12.5, 
    isPositive: true 
  })
  const [totalRevenue, setTotalRevenue] = useState("¥2,560,000")
  const [averageOrderValue, setAverageOrderValue] = useState("¥320,000")
  
  // 分析数据
  const [salesAnalytics, setSalesAnalytics] = useState({
    salesDistribution: [],
    salesForecast: []
  })
  const [customerAnalytics, setCustomerAnalytics] = useState({
    ageDistribution: [],
    sourceDistribution: []
  })
  const [inventoryAnalytics, setInventoryAnalytics] = useState({
    turnoverRates: [],
    inventoryDistribution: []
  })
  const [analyticsLoading, setAnalyticsLoading] = useState({
    sales: false,
    customers: false,
    inventory: false
  })

  // 获取销售数据
  useEffect(() => {
    async function fetchSalesData() {
      try {
        setIsLoading(true)
        
        // 调用API获取销售数据
        const response = await fetch(`/api/dealer/sales?period=${timeRange}`)
        if (!response.ok) {
          throw new Error('获取销售数据失败')
        }
        
        const data = await response.json()
        setSalesData({
          weekly: data.weekly,
          monthly: data.monthly,
          yearly: data.yearly
        })
        setTopCars(data.topCars)
        setTotalRevenue(data.totalRevenue)
        setAverageOrderValue(data.averageOrderValue)
        setSalesTrend(data.salesTrend)
        
        setIsLoading(false)
      } catch (error) {
        console.error('获取销售数据错误:', error)
        toast({
          title: "数据加载失败",
          description: "无法加载销售数据，请稍后重试",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchSalesData()
  }, [timeRange, toast])
  
  // 获取销售分析数据
  const fetchAnalyticsData = async (type: string) => {
    try {
      setAnalyticsLoading(prev => ({ ...prev, [type]: true }))
      
      const response = await fetch(`/api/dealer/analytics?type=${type}`)
      if (!response.ok) {
        throw new Error(`获取${type}分析数据失败`)
      }
      
      const data = await response.json()
      
      switch (type) {
        case 'sales':
          setSalesAnalytics(data)
          break
        case 'customers':
          setCustomerAnalytics(data)
          break
        case 'inventory':
          setInventoryAnalytics(data)
          break
      }
    } catch (error) {
      console.error(`获取${type}分析数据错误:`, error)
      toast({
        title: "数据加载失败",
        description: `无法加载${type}分析数据，请稍后重试`,
        variant: "destructive",
      })
    } finally {
      setAnalyticsLoading(prev => ({ ...prev, [type]: false }))
    }
  }
  
  // 当切换标签时加载相应的分析数据
  const handleTabChange = (value: string) => {
    if (value === 'sales' && salesAnalytics.salesDistribution.length === 0) {
      fetchAnalyticsData('sales')
    } else if (value === 'customers' && customerAnalytics.ageDistribution.length === 0) {
      fetchAnalyticsData('customers')
    } else if (value === 'inventory' && inventoryAnalytics.turnoverRates.length === 0) {
      fetchAnalyticsData('inventory')
    }
  }

  // 导出报表
  const exportReport = () => {
    toast({
      title: "导出成功",
      description: "销售报表已成功导出为Excel文件",
    })
    // 实际导出功能实现
  }

  return (
    <DashboardLayout userType="dealer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">销售报表</h2>
            <p className="text-muted-foreground">查看和分析您的销售数据</p>
          </div>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            导出报表
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">加载销售数据中...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总销售额</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRevenue}</div>
                  <div className="flex items-center pt-1 text-xs text-muted-foreground">
                    {salesTrend.isPositive ? (
                      <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span className={salesTrend.isPositive ? "text-green-500" : "text-red-500"}>
                      {salesTrend.percentage}%
                    </span>
                    <span className="ml-1">相比上月</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均订单金额</CardTitle>
                  <FileBarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageOrderValue}</div>
                  <p className="pt-1 text-xs text-muted-foreground">
                    基于最近30天的数据
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">本周订单总数</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData.weekly.reduce((a, b) => a + b.sales, 0)}</div>
                  <p className="pt-1 text-xs text-muted-foreground">
                    过去7天的总订单数
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均交付时间</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15天</div>
                  <p className="pt-1 text-xs text-muted-foreground">
                    从订单到交付的平均时间
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>销售趋势</CardTitle>
                    <Select
                      value={timeRange}
                      onValueChange={setTimeRange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="选择时间范围" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">每周</SelectItem>
                        <SelectItem value="monthly">每月</SelectItem>
                        <SelectItem value="yearly">每年</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <CardDescription>
                    {timeRange === 'weekly' ? '过去7天' : timeRange === 'monthly' ? '过去12个月' : '过去5年'}的销售趋势
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={salesData[timeRange as keyof SalesData]} 
                    height="250px"
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>热门车型</CardTitle>
                  <CardDescription>
                    按销售数量排名的热门车型
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>车型</TableHead>
                        <TableHead className="text-right">销量</TableHead>
                        <TableHead className="text-right">趋势</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCars.map((car) => (
                        <TableRow key={car.id}>
                          <TableCell className="font-medium">{car.name}</TableCell>
                          <TableCell className="text-right">{car.sales}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              {car.trend > 0 ? (
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                              ) : (
                                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                              )}
                              <span className={car.trend > 0 ? "text-green-500" : "text-red-500"}>
                                {Math.abs(car.trend)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="sales" className="w-full" onValueChange={handleTabChange}>
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="sales">销售分析</TabsTrigger>
                <TabsTrigger value="customers">客户分析</TabsTrigger>
                <TabsTrigger value="inventory">库存分析</TabsTrigger>
              </TabsList>
              <TabsContent value="sales" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <PieChart 
                    data={salesAnalytics.salesDistribution} 
                    loading={analyticsLoading.sales}
                    title="销售分布"
                    description="按车型类别的销售分布"
                  />
                  <LineChart 
                    data={salesAnalytics.salesForecast} 
                    loading={analyticsLoading.sales}
                    title="销售预测"
                    description="未来3个月的销售预测"
                  />
                </div>
              </TabsContent>
              <TabsContent value="customers" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <BarChart 
                    data={customerAnalytics.ageDistribution} 
                    loading={analyticsLoading.customers}
                    title="客户年龄分布"
                    description="按年龄段的客户分布"
                  />
                  <PieChart 
                    data={customerAnalytics.sourceDistribution} 
                    loading={analyticsLoading.customers}
                    title="客户来源"
                    description="按获客渠道的分布"
                  />
                </div>
              </TabsContent>
              <TabsContent value="inventory" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <LineChart 
                    data={inventoryAnalytics.turnoverRates} 
                    loading={analyticsLoading.inventory}
                    title="库存周转率"
                    description="各车型的库存周转情况"
                  />
                  <PieChart 
                    data={inventoryAnalytics.inventoryDistribution} 
                    loading={analyticsLoading.inventory}
                    title="库存分布"
                    description="按车型类别的库存分布"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}