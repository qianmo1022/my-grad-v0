"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Edit } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCarById, getCarConfigOptions, type ConfigOption, type ConfigCategory } from "@/lib/car-data"
import PriceSummary from "@/components/configurator/price-summary"
import CarImageViewer from "@/components/configurator/car-image-viewer"
import { useToast } from "@/components/ui/use-toast"

// 已保存配置的接口定义
interface SavedConfig {
  id: string
  carId: string
  carName: string
  price: number
  date: string
  thumbnail: string
  options: Record<string, string | { id: string }>
}

// 从API获取已保存配置的函数
const getSavedConfig = async (configId: string): Promise<SavedConfig> => {
  if (!configId) {
    throw new Error("configId不能为空");
  }
  
  try {
    const response = await fetch(`/api/configurations/${configId}`);
    
    if (!response.ok) {
      throw new Error('获取配置失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取保存的配置失败:', error);
    throw error;
  }
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
  const [savedConfig, setSavedConfig] = useState<SavedConfig | null>(null)
  const [car, setCar] = useState<any>(null)
  const [configCategories, setConfigCategories] = useState<ConfigCategory[]>([])

  useEffect(() => {
    // 定义异步函数来加载数据
    const loadData = async () => {
      try {
        // 获取已保存的配置
        const config = await getSavedConfig(configId)
        if (!config) {
          return notFound()
        }

        setSavedConfig(config)

        // 获取车型信息和配置选项
        const carData = await getCarById(config.carId)
        if (!carData) {
          return notFound()
        }

        // 获取配置分类并等待Promise解析
        const configCategoriesData = await getCarConfigOptions(config.carId)
        const initialOptions: Record<string, ConfigOption> = {}

        // 设置已保存的选项
        configCategoriesData.forEach((category: ConfigCategory) => {
          // 查找选项时优先使用categoryKey
          const savedOption = config.options[category.categoryKey] || config.options[category.id as keyof typeof config.options];
          
          if (savedOption) {
            if (typeof savedOption === 'string') {
              // 如果是字符串，可能是optionKey或id
              // 先尝试通过optionKey查找
              let option = category.options.find((opt: ConfigOption) => opt.optionKey === savedOption);
              
              // 如果没找到，再尝试通过id查找
              if (!option) {
                option = category.options.find((opt: ConfigOption) => opt.id === savedOption);
              }
              
              if (option) {
                initialOptions[category.id] = option;
              }
            } else if (typeof savedOption === 'object' && savedOption.id) {
              // 如果已经是对象，查找完整的选项对象以获取所有属性
              const option = category.options.find((opt: ConfigOption) => opt.id === savedOption.id);
              if (option) {
                initialOptions[category.id] = option;
              }
            }
          }
        })

        setSelectedOptions(initialOptions)
        setTotalPrice(config.price)
        setActiveTab(configCategoriesData.length > 0 ? configCategoriesData[0]?.id : "")
        // 设置配置分类和车型数据
        setConfigCategories(configCategoriesData)
        setCar(carData)
        setIsLoading(false)
      } catch (error) {
        console.error('加载配置数据失败:', error)
        toast({
          title: "加载失败",
          description: "无法加载配置数据，请稍后再试",
          variant: "destructive"
        })
      }
    }
    
    // 调用异步函数
    loadData()
  }, [configId, toast])

  // 获取当前选择的颜色
  const getCurrentColor = () => {
    const colorOption = selectedOptions["exterior-color"]
    return colorOption?.colorCode || "#000000"
  }

  // 处理编辑按钮点击
  const handleEdit = () => {
    if (savedConfig) {
      router.push(`/configure/${savedConfig.carId}`)
    }
  }

  // 处理购买按钮点击
  const handleBuy = () => {
    router.push(`/checkout/${configId}`)
  }

  // 在useEffect中加载car数据
  useEffect(() => {
    if (savedConfig && configCategories.length === 0) {
      const loadCarData = async () => {
        try {
          const carData = await getCarById(savedConfig.carId)
          setCar(carData)
          const categoriesData = await getCarConfigOptions(savedConfig.carId)
          setConfigCategories(categoriesData)
        } catch (error) {
          console.error('加载车型数据失败:', error)
        }
      }
      loadCarData()
    }
  }, [savedConfig, configCategories.length])

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
          <h1 className="text-3xl font-bold">{savedConfig?.carName}</h1>
          <p className="text-muted-foreground">保存于 {savedConfig?.date}</p>
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
          <CarImageViewer carId={savedConfig?.carId || ""} carColor={getCurrentColor()} />
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

