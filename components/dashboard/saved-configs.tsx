import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, ShoppingCart, Trash2 } from "lucide-react"

interface SavedConfig {
  id: string
  carName: string
  thumbnail: string
  date: string
  price: string
}

interface SavedConfigsProps {
  configs: SavedConfig[]
}

export default function SavedConfigs({ configs }: SavedConfigsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>已保存的配置</CardTitle>
        <CardDescription>您保存的汽车配置方案</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map((config) => (
            <Card key={config.id} className="overflow-hidden">
              <div className="relative h-40 w-full">
                <Image
                  src={config.thumbnail || "/placeholder.svg"}
                  alt={config.carName}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold">{config.carName}</h3>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-muted-foreground">保存于 {config.date}</p>
                  <p className="font-medium">{config.price}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/configure/${config.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      查看
                    </Button>
                  </Link>
                  <Button variant="default" size="sm" className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    购买
                  </Button>
                  <Button variant="ghost" size="sm" className="px-2">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

