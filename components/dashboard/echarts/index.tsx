"use client"

import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from '@/lib/utils'

interface ChartProps {
  title?: string
  description?: string
  className?: string
  options: any
  loading?: boolean
  height?: string | number
  style?: React.CSSProperties
}

export function EChart({
  title,
  description,
  className,
  options,
  loading = false,
  height = '300px',
  style,
  ...props
}: ChartProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>) {
  return (
    <Card className={cn(className)} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className={cn("w-full", loading && "opacity-50")}>
          <ReactECharts
            option={options}
            style={{ height, width: '100%', ...style }}
            opts={{ renderer: 'canvas' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </div>
      </CardContent>
    </Card>
  )
}