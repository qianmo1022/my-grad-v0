"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Edit } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCarById, getCarConfigOptions, type ConfigOption } from "@/lib/car-data"
import PriceSummary from "@/components/configurator/price-summary"
import CarImageViewer from "@/components/configurator/car-image-viewer"
import { useToast } from "@/components/ui/use-toast"

// 模拟获取已保存配置的函数
const getSavedConfig = (configId: string) => {
  if (!configId) {
    throw new Error("configId不能为空");
  }
  
  // 这里应该从API获取已保存的配置
  // 现在使用模拟数据
  const mockSavedConfigs = [
    {
      id: "CFG-001",
      carId: "luxury-sedan",
      carName: "豪华轿车 - 个性定制",
      date: "2023-12-20",
      price: 398000,
      options: {
        "exterior-color": "black",
        wheels: "luxury",
        interior: "premium-leather",
        "tech-package": "advanced-tech",
      },
    },
    {
      id: "CFG-002",
      carId: "city-suv",
      carName: "城市SUV - 家庭版",
      date: "2024-01-05",
      price: 312000,
      options: {
        "exterior-color": "silver",
        wheels: "sport",
        interior: "leather",
        roof: "panoramic",
      },
    },
    {
      id: "CFG-003",
      carId: "sports-car",
      carName: "跑车系列 - 赛道版",
      date: "2024-01-18",
      price: 688000,
      options: {
        "exterior-color": "red",
        wheels: "sport",
        performance: "track-performance",
        interior: "premium-sport",
      },
    },
    {
      id: "CFG-004",
      carId: "luxury-sedan",
      carName: "豪华轿车 - 商务版",
      date: "2024-02-02",
      price: 372000,
      options: {
        "exterior-color": "blue",
        wheels: "standard",
        interior: "leather",
        "tech-package": "standard-tech",
      },
    },
  ]

  return mockSavedConfigs.find((config) => config.id === configId)
}

interface SavedConfigPageProps {
  params: Promise<{
    configId: string
  }>
}

export default function SavedConfigPage({ params }: SavedConfigPageProps) {
  const unwrappedParams = React.use(params)
  const configId = unwrappedParams.configId
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("")
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ConfigOption>>({})
  const [totalPrice, setTotalPrice] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [savedConfig, setSavedConfig] = useState<any>(null)

  useEffect(() => {
    // 定义异步函数来加载数据
    const loadData = async () => {
      // 获取已保存的配置
      const config = getSavedConfig(configId)
      if (!config) {
        return notFound()
      }

      setSavedConfig(config)

      // 获取车型信息和配置选项
      const car = await getCarById(config.carId)
      if (!car) {
        return notFound()
      }

      const configCategories = getCarConfigOptions(config.carId)
      const initialOptions: Record<string, ConfigOption> = {}

      // 设置已保存的选项
      configCategories.forEach((category) => {
        const savedOptionId = config.options[category.id as keyof typeof config.options]
        if (savedOptionId) {
          const option = category.options.find((opt) => opt.id === savedOptionId)
          if (option) {
            initialOptions[category.id] = option
          }
        }
      })

      setSelectedOptions(initialOptions)
      setTotalPrice(config.price)
      setActiveTab(configCategories[0]?.id || "")
      setIsLoading(false)
    }
    
    // 调用异步函数
    loadData()
  }, [configId])

  // 获取当前选择的颜色
  const getCurrentColor = () => {
    const colorOption = selectedOptions["exterior-color"]
    return colorOption?.colorCode || "#000000"
  }

  // 处理编辑按钮点击
  const handleEdit = () => {
    router.push(`/configure/${savedConfig.carId}`)
  }

  // 处理购买按钮点击
  const handleBuy = () => {
    router.push(`/checkout/${configId}`)
  }

  // 在组件中声明car状态
  const [car, setCar] = useState<any>(null)
  const [configCategories, setConfigCategories] = useState<any[]>([])

  // 在useEffect中加载car数据
  useEffect(() => {
    if (savedConfig) {
      const loadCarData = async () => {
        const carData = await getCarById(savedConfig.carId)
        setCar(carData)
        const categories = getCarConfigOptions(savedConfig.carId)
        setConfigCategories(categories)
      }
      loadCarData()
    }
  }, [savedConfig])

  if (isLoading || !savedConfig || !car) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" className="mb-2 pl-0" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <h1 className="text-3xl font-bold">加载中...</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" className="mb-2 pl-0" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <h1 className="text-3xl font-bold">{savedConfig.carName}</h1>
          <p className="text-muted-foreground">保存于 {savedConfig.date}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            编辑配置
          </Button>
          <Button onClick={handleBuy}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            购买
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 车辆图片展示 */}
        <div className="lg:col-span-2 h-[500px] bg-muted rounded-lg overflow-hidden">
          <CarImageViewer carId={savedConfig.carId} carColor={getCurrentColor()} />
        </div>

        {/* 配置选项 */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="w-full grid"
              style={{ gridTemplateColumns: `repeat(${configCategories.length}, 1fr)` }}
            >
              {configCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {configCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="pt-4">
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2">已选择的{category.name}</h3>
                  <div className="flex items-center gap-3">
                    {selectedOptions[category.id] ? (
                      <>
                        <div className="font-medium">{selectedOptions[category.id].name}</div>
                        <div className="text-sm text-muted-foreground">{selectedOptions[category.id].description}</div>
                        {selectedOptions[category.id].price > 0 && (
                          <div className="ml-auto font-medium">
                            +¥{selectedOptions[category.id].price.toLocaleString()}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground">未选择</div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* 价格摘要 */}
          <PriceSummary basePrice={car?.basePrice || 0} selectedOptions={selectedOptions} totalPrice={totalPrice} />

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button className="flex-1 gap-2" variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
              编辑配置
            </Button>
            <Button className="flex-1 gap-2" variant="default" onClick={handleBuy}>
              <ShoppingCart className="h-4 w-4" />
              立即购买
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

