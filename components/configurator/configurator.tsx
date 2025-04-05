"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { type ConfigOption, type ConfigCategory, type CarModel } from "@/lib/car-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Save } from "lucide-react"
import { useSession } from "next-auth/react"
import ConfigOptions from "./config-options"
import PriceSummary from "./price-summary"
import CarViewer from "./car-viewer"
import { getRecommendedOptions } from "@/lib/recommendation"
import RecommendedOptions from "./recommended-options"
import { Skeleton } from "@/components/ui/skeleton"

interface ConfiguratorProps {
  carId: string
  preloadedCar?: CarModel
  preloadedConfigCategories?: ConfigCategory[]
}

export default function Configurator({ carId, preloadedCar, preloadedConfigCategories }: ConfiguratorProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [car, setCar] = useState<CarModel | null>(preloadedCar || null)
  const [configCategories, setConfigCategories] = useState<ConfigCategory[]>(
    preloadedConfigCategories || []
  )
  const [activeTab, setActiveTab] = useState(configCategories[0]?.id || "")
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ConfigOption>>({})
  const [totalPrice, setTotalPrice] = useState(preloadedCar?.basePrice || 0)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(!preloadedCar)

  // 加载汽车数据和配置选项（如果没有预加载）
  useEffect(() => {
    const loadData = async () => {
      if (!preloadedCar) {
        setIsLoading(true)
        try {
          // 使用 fetch API 加载车辆数据
          const carResponse = await fetch(`/api/cars/${carId}`);
          if (carResponse.ok) {
            const carData = await carResponse.json();
            setCar(carData);
            setTotalPrice(carData?.basePrice || 0);
          }
        } catch (error) {
          console.error('获取车辆数据失败:', error);
        }
      }

      if (!preloadedConfigCategories || preloadedConfigCategories.length === 0) {
        try {
          // 使用 fetch API 加载配置选项
          const configResponse = await fetch(`/api/cars/${carId}/config-options`);
          if (configResponse.ok) {
            const configData = await configResponse.json();
            setConfigCategories(configData);
            if (configData.length > 0) {
              setActiveTab(configData[0]?.id || "");
            }
          }
        } catch (error) {
          console.error('获取配置选项失败:', error);
        }
      }
      
      setIsLoading(false);
    }
    
    loadData();
  }, [carId, preloadedCar, preloadedConfigCategories])

  // 初始化选择的配置（每个类别的第一个选项）- 只在组件挂载和carId/configCategories变化时执行一次
  useEffect(() => {
    if (!isInitialized && configCategories.length > 0) {
      const initialOptions: Record<string, ConfigOption> = {}
      configCategories.forEach((category) => {
        if (category.options.length > 0) {
          initialOptions[category.id] = category.options[0]
        }
      })
      setSelectedOptions(initialOptions)
      setIsInitialized(true)
    }
  }, [carId, configCategories, isInitialized])

  // 计算总价 - 只在selectedOptions或car变化时执行
  useEffect(() => {
    if (!car) return

    let price = car.basePrice
    Object.values(selectedOptions).forEach((option) => {
      price += option.price
    })
    setTotalPrice(price)
  }, [selectedOptions, car])

  // 处理选项变更
  const handleOptionChange = (categoryId: string, option: ConfigOption) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [categoryId]: option,
    }))
  }

  // 处理保存配置
  const handleSaveConfig = async () => {
    if (!session || !car) return;
    
    try {
      const response = await fetch('/api/configurations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          carId: car.id,
          options: Object.entries(selectedOptions).reduce((acc, [key, value]) => {
            acc[key] = value.id;
            return acc;
          }, {} as Record<string, string>),
          basePrice: car.basePrice,
          totalPrice: totalPrice
        }),
      });

      if (!response.ok) {
        throw new Error('保存配置失败');
      }

      const data = await response.json();
      router.push(`/configure/saved/${data.id}`);
    } catch (error) {
      console.error('保存配置时出错:', error);
    }
  }

  // 处理下单预定
  const handleOrder = async () => {
    if (!session || !car) return;
    
    try {
      const response = await fetch('/api/configurations/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          carId: car.id,
          options: selectedOptions,
          totalPrice: totalPrice
        }),
      });

      if (!response.ok) {
        throw new Error('下单预定失败');
      }

      const data = await response.json();
      router.push(`/checkout/${data.id}`);
    } catch (error) {
      console.error('下单预定时出错:', error);
    }
  }

  // 获取当前选择的颜色
  const getCurrentColor = () => {
    const colorOption = selectedOptions["exterior-color"]
    return colorOption?.colorCode || car?.defaultColor || "#000000"
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[500px] col-span-2" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!car) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" className="mb-2 pl-0" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <h1 className="text-3xl font-bold">{car.name} 配置</h1>
          <p className="text-muted-foreground">{car.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3D 车辆查看器 */}
        <div className="lg:col-span-2 h-[500px] bg-muted rounded-lg overflow-hidden">
          <CarViewer carColor={getCurrentColor()} />
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
                <div className="h-[calc(100vh-600px)] overflow-y-auto pr-4">
                  <ConfigOptions
                    category={category}
                    selectedOption={selectedOptions[category.id]}
                    onOptionChange={(option) => handleOptionChange(category.id, option)}
                  />
                  {activeTab && selectedOptions[activeTab] && (
                    <RecommendedOptions
                      options={getRecommendedOptions(carId, activeTab)}
                      selectedOption={selectedOptions[activeTab]}
                      onOptionSelect={(option) => handleOptionChange(activeTab, option)}
                    />
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* 价格摘要 */}
          <PriceSummary basePrice={car.basePrice} selectedOptions={selectedOptions} totalPrice={totalPrice} />

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button className="flex-1 gap-2" variant="outline" onClick={handleSaveConfig}>
              <Save className="h-4 w-4" />
              保存配置
            </Button>
            <Button className="flex-1 gap-2" variant="default" onClick={handleOrder}>
              <ShoppingCart className="h-4 w-4" />
              下单预定
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

