import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import type { CarModel } from "@/lib/car-data"

interface RecommendedCarsProps {
  cars: CarModel[]
}

export default function RecommendedCars({ cars }: RecommendedCarsProps) {
  if (!cars.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>为您推荐</CardTitle>
          <CardDescription>基于您的偏好和浏览历史</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">暂无推荐车型，请浏览更多车型或设置您的偏好。</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>为您推荐</CardTitle>
        <CardDescription>基于您的偏好和浏览历史</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cars.map((car) => (
            <Card key={car.id} className="overflow-hidden border-0 shadow-md">
              <div className="relative">
                <div className="relative h-40 w-full">
                  <Image src={car.thumbnail || "/placeholder.svg"} alt={car.name} fill className="object-cover" />
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    推荐
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">{car.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3">{car.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-medium">¥{car.basePrice.toLocaleString()}</span>
                  <Link href={`/configure/${car.id}`}>
                    <Button size="sm">开始配置</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

