import type { ConfigOption } from "@/lib/car-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface PriceSummaryProps {
  basePrice: number
  selectedOptions: Record<string, ConfigOption>
  totalPrice: number
}

export default function PriceSummary({ basePrice, selectedOptions, totalPrice }: PriceSummaryProps) {
  // 计算选配总价
  const optionsTotal = Object.values(selectedOptions).reduce((sum, option) => sum + option.price, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>价格摘要</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">基础价格</span>
          <span>¥{basePrice.toLocaleString()}</span>
        </div>

        {Object.values(selectedOptions)
          .filter((option) => option.price > 0)
          .map((option) => (
            <div key={option.id} className="flex justify-between">
              <span className="text-muted-foreground">{option.name}</span>
              <span>+¥{option.price.toLocaleString()}</span>
            </div>
          ))}

        <Separator />

        <div className="flex justify-between font-medium">
          <span>选配总价</span>
          <span>¥{optionsTotal.toLocaleString()}</span>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>总价</span>
          <span>¥{totalPrice.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

