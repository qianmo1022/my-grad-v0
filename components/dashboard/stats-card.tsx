import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export default function StatsCard({ title, value, description, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 p-1.5 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={cn("text-xs font-medium", trend.isPositive ? "text-green-500" : "text-red-500")}>
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">相比上月</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

