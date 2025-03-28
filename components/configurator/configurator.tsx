"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCarById, getCarConfigOptions, type ConfigOption } from "@/lib/car-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Save } from "lucide-react"
import ConfigOptions from "./config-options"
import PriceSummary from "./price-summary"
import CarViewer from "./car-viewer"
import { getRecommendedOptions } from "@/lib/recommendation"
import RecommendedOptions from "./recommended-options"

interface ConfiguratorProps {
  carId: string
}

export default function Configurator({ carId }: ConfiguratorProps) {
  const router = useRouter()
  const car = getCarById(carId)
  const configCategories = getCarConfigOptions(carId)

  const [activeTab, setActiveTab] = useState(configCategories[0]?.id || "")
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ConfigOption>>({})
  const [totalPrice, setTotalPrice] = useState(car?.basePrice || 0)
  const [isInitialized, setIsInitialized] = useState(false)

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

  // 获取当前选择的颜色
  const getCurrentColor = () => {
    const colorOption = selectedOptions["exterior-color"]
    return colorOption?.colorCode || car?.defaultColor || "#000000"
  }

  if (!car) return null

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
              </TabsContent>
            ))}
          </Tabs>

          {/* 价格摘要 */}
          <PriceSummary basePrice={car.basePrice} selectedOptions={selectedOptions} totalPrice={totalPrice} />

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button className="flex-1 gap-2">
              <Save className="h-4 w-4" />
              保存配置
            </Button>
            <Button className="flex-1 gap-2" variant="default">
              <ShoppingCart className="h-4 w-4" />
              下单预定
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

