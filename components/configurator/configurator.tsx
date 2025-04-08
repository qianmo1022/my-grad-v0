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

  // 初始化选择的配置（只为必选的三个分类设置默认值）- 只在组件挂载和carId/configCategories变化时执行一次
  useEffect(() => {
    if (!isInitialized && configCategories.length > 0) {
      const initialOptions: Record<string, ConfigOption> = {}
      const requiredCategoryKeys = ['interior-color', 'exterior-color', 'wheels'];
      
      configCategories.forEach((category) => {
        // 只为内饰颜色、外观颜色和轮毂这三项设置默认值
        if (category.options.length > 0 && requiredCategoryKeys.includes(category.categoryKey)) {
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
      if (option) { // 确保选项存在
        price += option.price
      }
    })
    setTotalPrice(price)
  }, [selectedOptions, car])

  // 处理选项变更
  const handleOptionChange = (categoryId: string, option: ConfigOption | null) => {
    // 如果传入的option为null，表示要取消选择
    // 或者如果点击的是当前已选中的选项，且不是必选项，则取消选择
    // 查找当前分类
    const category = configCategories.find(cat => cat.id === categoryId);
    const requiredCategoryKeys = ['interior-color', 'exterior-color', 'wheels'];
    const isRequiredCategory = category ? requiredCategoryKeys.includes(category.categoryKey) : false;
    const isCurrentlySelected = selectedOptions[categoryId]?.id === option?.id;
    
    if (option === null || (isCurrentlySelected && !isRequiredCategory)) {
      // 如果是必选项，不允许取消选择
      if (isRequiredCategory) return;
      
      // 取消选择该选项
      setSelectedOptions((prev) => {
        const newOptions = { ...prev };
        delete newOptions[categoryId];
        return newOptions;
      });
    } else {
      // 选择新选项
      setSelectedOptions((prev) => ({
        ...prev,
        [categoryId]: option,
      }));
    }
  }

  // 处理保存配置
  const handleSaveConfig = async () => {
    if (!session || !car) return;
    
    try {
      // 查找每个选项所属分类的categoryKey，和选项的optionKey
      // 只处理已选择的选项，允许某些分类为空
      const optionsWithKeys = Object.entries(selectedOptions).reduce((acc, [categoryId, option]) => {
        // 找到当前分类
        const category = configCategories.find(cat => cat.id === categoryId);
        if (category && option) {
          // 使用categoryKey作为键，optionKey作为值
          acc[category.categoryKey] = option.optionKey;
        }
        return acc;
      }, {} as Record<string, string>);
      
      // 确保必选的三个分类已选择
      // 查找categoryKey对应的分类ID
      const requiredCategoryKeys = ['interior-color', 'exterior-color', 'wheels'];
      const requiredCategoryIds = configCategories
        .filter(cat => requiredCategoryKeys.includes(cat.categoryKey))
        .map(cat => cat.id);
      
      // 检查是否所有必选分类都已选择
      const missingRequired = requiredCategoryIds.filter(catId => !selectedOptions[catId]);
      
      if (missingRequired.length > 0) {
        throw new Error('请选择必要的配置选项：内饰颜色、外观颜色和轮毂');
      }

      const response = await fetch('/api/configurations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          carId: car.id,
          options: optionsWithKeys,
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
      // 与handleSaveConfig保持一致，使用categoryKey和optionKey
      // 只处理已选择的选项，允许某些分类为空
      const optionsWithKeys = Object.entries(selectedOptions).reduce((acc, [categoryId, option]) => {
        // 找到当前分类
        const category = configCategories.find(cat => cat.id === categoryId);
        if (category && option) {
          // 使用categoryKey作为键，optionKey作为值
          acc[category.categoryKey] = option.optionKey;
        }
        return acc;
      }, {} as Record<string, string>);
      
      // 确保必选的三个分类已选择
      // 查找categoryKey对应的分类ID
      const requiredCategoryKeys = ['interior-color', 'exterior-color', 'wheels'];
      const requiredCategoryIds = configCategories
        .filter(cat => requiredCategoryKeys.includes(cat.categoryKey))
        .map(cat => cat.id);
      
      // 检查是否所有必选分类都已选择
      const missingRequired = requiredCategoryIds.filter(catId => !selectedOptions[catId]);
      
      if (missingRequired.length > 0) {
        throw new Error('请选择必要的配置选项：内饰颜色、外观颜色和轮毂');
      }

      const response = await fetch('/api/configurations/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          carId: car.id,
          options: optionsWithKeys,
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

  // 获取当前选择的外观颜色
  const getCurrentColor = () => {
    const colorOption = selectedOptions["exterior-color"]
    return colorOption?.colorCode || car?.defaultColor || "#000000"
  }

  // 获取当前选择的内饰颜色
  const getInteriorColor = () => {
    const interiorOption = selectedOptions["interior-color"]
    return interiorOption?.colorCode || "#8B4513" // 默认棕色内饰
  }

  // 获取当前选择的轮毂大小
  const getWheelSize = () => {
    const wheelOption = selectedOptions["wheels"]
    // 根据选项的optionKey确定轮毂大小
    if (wheelOption?.optionKey === "21英寸") return "large"
    if (wheelOption?.optionKey === "20英寸") return "medium"
    return "small" // 默认小轮毂
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
          <CarViewer 
            carColor={getCurrentColor()} 
            interiorColor={getInteriorColor()} 
            wheelSize={getWheelSize()} 
          />
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
                  {/* 当选项为空且不是必选项时显示提示信息 */}
                  {activeTab && category.id === activeTab && !selectedOptions[activeTab] && (
                    <div className="mt-4 p-4 border border-dashed rounded-md text-center text-muted-foreground">
                      <p>此配置项为可选项，您可以选择是否配置</p>
                    </div>
                  )}
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

