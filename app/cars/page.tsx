import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { carModels } from "@/lib/car-data"

export default function CarsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/dashboard/user">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回仪表盘
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">浏览车型</h1>
        <p className="text-muted-foreground">选择您感兴趣的车型开始配置</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {carModels.map((car) => (
          <Card key={car.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image src={car.thumbnail || "/placeholder.svg"} alt={car.name} fill className="object-cover" />
            </div>
            <CardHeader>
              <CardTitle>{car.name}</CardTitle>
              <CardDescription>¥{car.basePrice.toLocaleString()}起</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">{car.description}</p>
            </CardContent>
            <CardFooter>
              <Link href={`/configure/${car.id}`} className="w-full">
                <Button variant="default" className="w-full">
                  开始配置
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

