"use client"

import { useState, useEffect } from "react"
import { PlusCircle, MinusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface Feature {
  id?: string
  featureKey: string
  name: string
  score: number
}

interface CarFeaturesFormProps {
  carId?: string
  onComplete: () => void
  initialFeatures?: Feature[]
}

export default function CarFeaturesForm({ carId, onComplete, initialFeatures = [] }: CarFeaturesFormProps) {
  const { toast } = useToast()
  const [features, setFeatures] = useState<Feature[]>(initialFeatures.length > 0 ? initialFeatures : [
    { featureKey: "acceleration", name: "加速性能", score: 3 },
    { featureKey: "handling", name: "操控性", score: 3 },
    { featureKey: "comfort", name: "舒适性", score: 3 },
    { featureKey: "technology", name: "科技配置", score: 3 }
  ])
  const [isSaving, setIsSaving] = useState(false)

  // 如果有carId且初始特性为空，则获取特性数据
  useEffect(() => {
    if (carId && initialFeatures.length === 0) {
      fetchFeatures()
    }
  }, [carId, initialFeatures])

  // 获取车型特性
  const fetchFeatures = async () => {
    try {
      const response = await fetch(`/api/dealer/cars/${carId}/features`)
      if (!response.ok) {
        throw new Error("获取车型特性失败")
      }
      const data = await response.json()
      if (data.length > 0) {
        setFeatures(data)
      }
    } catch (error) {
      console.error("获取车型特性错误:", error)
      toast({
        title: "数据加载失败",
        description: "无法加载车型特性，请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 添加新特性
  const addFeature = () => {
    setFeatures([...features, { featureKey: "", name: "", score: 3 }])
  }

  // 删除特性
  const removeFeature = (index: number) => {
    const newFeatures = [...features]
    newFeatures.splice(index, 1)
    setFeatures(newFeatures)
  }

  // 更新特性值
  const updateFeature = (index: number, field: keyof Feature, value: string | number) => {
    const newFeatures = [...features]
    
    // 如果更新的是featureKey，自动生成唯一标识符
    if (field === 'featureKey' && typeof value === 'string') {
      newFeatures[index] = { ...newFeatures[index], [field]: value.toLowerCase().replace(/\s+/g, '-') }
    } else {
      newFeatures[index] = { ...newFeatures[index], [field]: value }
    }
    
    setFeatures(newFeatures)
  }

  // 保存特性
  const saveFeatures = async () => {
    // 验证输入
    for (const feature of features) {
      if (!feature.featureKey || !feature.name) {
        toast({
          title: "验证失败",
          description: "特性标识和名称不能为空",
          variant: "destructive",
        })
        return
      }
    }

    setIsSaving(true)
    try {
      // 如果是新车型（没有carId），保存到sessionStorage
      if (!carId) {
        // 存储特性数据到sessionStorage，以便在创建车型后使用
        sessionStorage.setItem('pendingCarFeatures', JSON.stringify(features))
        
        toast({
          title: "特性已准备好",
          description: "车型特性已保存，将在车型创建后应用",
        })
        
        onComplete()
        return
      }
      
      // 以下是有carId的情况，直接更新已有车型的特性
      const response = await fetch(`/api/dealer/cars/${carId}/features`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(features),
      })

      if (!response.ok) {
        throw new Error("保存车型特性失败")
      }

      toast({
        title: "保存成功",
        description: "车型特性已保存",
      })
      
      onComplete()
    } catch (error) {
      console.error("保存车型特性错误:", error)
      toast({
        title: "保存失败",
        description: "保存车型特性时发生错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {features.map((feature, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor={`feature-key-${index}`}>特性标识</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id={`feature-key-${index}`}
                    value={feature.featureKey}
                    onChange={(e) => updateFeature(index, "featureKey", e.target.value)}
                    placeholder="例如: acceleration"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeFeature(index)}
                    className="shrink-0"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  特性的唯一标识符，如"acceleration"
                </p>
              </div>
              <div>
                <Label htmlFor={`feature-name-${index}`}>特性名称</Label>
                <Input
                  id={`feature-name-${index}`}
                  value={feature.name}
                  onChange={(e) => updateFeature(index, "name", e.target.value)}
                  placeholder="例如: 加速性能"
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  特性的显示名称，如"加速性能"
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor={`feature-score-${index}`}>评分 ({feature.score})</Label>
                  <span className="text-sm text-muted-foreground">1-5分</span>
                </div>
                <Slider
                  id={`feature-score-${index}`}
                  min={1}
                  max={5}
                  step={1}
                  value={[feature.score]}
                  onValueChange={(value) => updateFeature(index, "score", value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>一般</span>
                  <span>出色</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={addFeature}>
          <PlusCircle className="mr-2 h-4 w-4" />
          添加特性
        </Button>
        <Button onClick={saveFeatures} disabled={isSaving || features.length === 0}>
          {isSaving ? "保存中..." : "保存特性"}
        </Button>
      </div>
    </div>
  )
} 