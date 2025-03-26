"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SalesData {
  month: string
  sales: number
}

interface SalesChartProps {
  data: {
    weekly: SalesData[]
    monthly: SalesData[]
    yearly: SalesData[]
  }
}

export default function SalesChart({ data }: SalesChartProps) {
  const [activeTab, setActiveTab] = useState("monthly")
  const [mounted, setMounted] = useState(false)

  // 避免水合错误
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const activeData = data[activeTab as keyof typeof data]
  const maxSales = Math.max(...activeData.map((item) => item.sales))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>销售趋势</CardTitle>
            <CardDescription>查看销售数据和趋势分析</CardDescription>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="weekly">周</TabsTrigger>
              <TabsTrigger value="monthly">月</TabsTrigger>
              <TabsTrigger value="yearly">年</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-end gap-2">
          {activeData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-primary rounded-t"
                style={{
                  height: `${(item.sales / maxSales) * 150}px`,
                  minHeight: "4px",
                }}
              />
              <span className="text-xs text-muted-foreground">{item.month}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

