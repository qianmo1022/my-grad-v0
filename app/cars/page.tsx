"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, PlusCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

export default function CarsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [dealers, setDealers] = useState<any[]>([])
  const [selectedDealerId, setSelectedDealerId] = useState<string>("")
  const [cars, setCars] = useState<any[]>([])

  // 获取所有商家
  useEffect(() => {
    async function fetchDealers() {
      try {
        const response = await fetch('/api/dealers')
        if (!response.ok) {
          throw new Error('获取商家列表失败')
        }
        const data = await response.json()
        setDealers(data)
        if (data.length > 0) {
          setSelectedDealerId(data[0].id) // 默认选择第一个商家
        }
      } catch (error) {
        console.error('获取商家列表错误:', error)
        toast({
          title: "数据加载失败",
          description: "无法加载商家列表，请稍后重试",
          variant: "destructive",
        })
      }
    }

    fetchDealers()
  }, [toast])

  // 根据选择的商家ID获取车型
  useEffect(() => {
    async function fetchCarsByDealer() {
      if (!selectedDealerId) return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/api/cars?dealerId=${selectedDealerId}&status=active`)
        if (!response.ok) {
          throw new Error('获取车型列表失败')
        }
        const data = await response.json()
        setCars(data)
      } catch (error) {
        console.error('获取车型列表错误:', error)
        toast({
          title: "数据加载失败",
          description: "无法加载车型列表，请稍后重试",
          variant: "destructive",
        })
        setCars([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCarsByDealer()
  }, [selectedDealerId, toast])

  // 处理商家选择变化
  const handleDealerChange = (dealerId: string) => {
    setSelectedDealerId(dealerId)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/dashboard/user">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回仪表盘
          </Button>
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">浏览车型</h1>
            <p className="text-muted-foreground">选择您感兴趣的车型开始配置</p>
          </div>
          
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">选择商家：</p>
            <Select value={selectedDealerId} onValueChange={handleDealerChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择商家" />
              </SelectTrigger>
              <SelectContent>
                {dealers.map((dealer) => (
                  <SelectItem key={dealer.id} value={dealer.id}>{dealer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : cars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
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
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">该商家暂无上线车型</p>
        </div>
      )}
    </div>
  )
}

