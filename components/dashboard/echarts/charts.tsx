"use client"

import React, { useMemo } from 'react'
import { EChart } from './index'
import { formatNumber } from '@/lib/utils'

interface ChartDataItem {
  month: string
  sales: number
  [key: string]: any
}

interface ChartProps {
  data: ChartDataItem[]
  height?: string | number
  loading?: boolean
  className?: string
  title?: string
  description?: string
}

// 柱状图组件
export function BarChart({
  data,
  height = '300px',
  loading = false,
  className,
  title,
  description,
}: ChartProps) {
  const options = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
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
        data: data.map(item => item.month),
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
          name: '销量',
          type: 'bar',
          barWidth: '60%',
          data: data.map(item => item.sales),
          itemStyle: {
            color: '#3b82f6' // 蓝色
          }
        }
      ]
    }
  }, [data])

  return (
    <EChart
      options={options}
      height={height}
      loading={loading}
      className={className}
      title={title}
      description={description}
    />
  )
}

// 折线图组件
export function LineChart({
  data,
  height = '300px',
  loading = false,
  className,
  title,
  description,
}: ChartProps) {
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
        boundaryGap: false,
        data: data.map(item => item.month)
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => formatNumber(value)
        }
      },
      series: [
        {
          name: '数值',
          type: 'line',
          data: data.map(item => item.sales),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#10b981' // 绿色
          },
          lineStyle: {
            width: 3
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(16, 185, 129, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(16, 185, 129, 0.05)'
                }
              ]
            }
          }
        }
      ]
    }
  }, [data])

  return (
    <EChart
      options={options}
      height={height}
      loading={loading}
      className={className}
      title={title}
      description={description}
    />
  )
}

// 饼图组件
export function PieChart({
  data,
  height = '300px',
  loading = false,
  className,
  title,
  description,
}: ChartProps) {
  const options = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: data.map(item => item.month)
      },
      series: [
        {
          name: '数据',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data.map(item => ({
            value: item.sales,
            name: item.month
          }))
        }
      ]
    }
  }, [data])

  return (
    <EChart
      options={options}
      height={height}
      loading={loading}
      className={className}
      title={title}
      description={description}
    />
  )
}