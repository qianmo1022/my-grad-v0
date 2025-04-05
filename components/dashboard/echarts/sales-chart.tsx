"use client"

import { useEffect, useState, useMemo } from "react"
import ReactECharts from 'echarts-for-react'
import { formatNumber } from '@/lib/utils'
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

  // 获取当前活动数据 - 确保在mounted前也有默认值
  const activeData = mounted ? data[activeTab as keyof typeof data] : data.monthly

  // 使用useMemo优化ECharts选项，避免不必要的重新计算
  const options = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const param = params[0]
          return `${param.name}: ${formatNumber(param.value)}`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: activeData.map(item => item.month),
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => formatNumber(value)
        }
      },
      series: [
        {
          name: '销售额',
          type: 'bar',
          barWidth: '60%',
          data: activeData.map(item => item.sales),
          itemStyle: {
            color: '#3b82f6' // 蓝色
          }
        }
      ]
    }
  }, [activeData]) // 依赖于activeData，当activeTab变化时重新计算

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
        <div className="h-[200px]">
          <ReactECharts
            option={options}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </CardContent>
    </Card>
  )
}