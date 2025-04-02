"use client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, ShoppingCart, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

export default function SavedConfigs({ configs: initialConfigs }: SavedConfigsProps) {
  const [configs, setConfigs] = useState(initialConfigs)
  const { toast } = useToast()

  // 处理删除配置
  const handleDeleteConfig = async (configId: string) => {
    try {
      const response = await fetch(`/api/configurations/delete?configId=${configId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        // 更新UI，移除已删除的配置
        setConfigs(configs.filter(config => config.id !== configId))
        toast({
          title: "删除成功",
          description: "配置已成功删除",
        })
      } else {
        // 显示错误消息
        toast({
          title: "删除失败",
          description: data.error || "无法删除配置，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("删除配置出错:", error)
      toast({
        title: "删除失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      })
    }
  }
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
                  <Link href={`/configure/saved/${config.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-1" />
                      查看
                    </Button>
                  </Link>
                  <Link href={`/checkout/${config.id}`} className="flex-1">
                    <Button variant="default" size="sm" className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      购买
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="px-2"
                    onClick={() => handleDeleteConfig(config.id)}
                  >
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

