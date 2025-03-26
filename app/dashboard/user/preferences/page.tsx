"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { preferenceCategories, getUserData, updateUserPreferences, type UserPreference } from "@/lib/recommendation"

export default function UserPreferences() {
  const { toast } = useToast()
  const userData = getUserData()

  // 初始化偏好状态
  const [preferences, setPreferences] = useState<Record<string, number>>(() => {
    const prefs: Record<string, number> = {}
    userData.preferences.forEach((pref) => {
      prefs[pref.id] = pref.value
    })
    return prefs
  })

  // 处理偏好变更
  const handlePreferenceChange = (id: string, value: number[]) => {
    setPreferences((prev) => ({
      ...prev,
      [id]: value[0],
    }))
  }

  // 保存偏好
  const handleSave = () => {
    const updatedPreferences: UserPreference[] = []

    // 遍历所有偏好类别和选项
    preferenceCategories.forEach((category) => {
      category.options.forEach((option) => {
        // 如果用户设置了该偏好
        if (preferences[option.id] !== undefined) {
          updatedPreferences.push({
            id: option.id,
            name: option.name,
            value: preferences[option.id],
          })
        }
      })
    })

    // 更新用户偏好
    updateUserPreferences(updatedPreferences)

    toast({
      title: "偏好已保存",
      description: "您的偏好设置已成功保存，我们将根据您的偏好为您推荐车型和配置。",
    })
  }

  return (
    <DashboardLayout userType="user">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">偏好设置</h2>
          <p className="text-muted-foreground">设置您的偏好，我们将为您推荐最适合的车型和配置。</p>
        </div>

        {preferenceCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {category.options.map((option) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor={option.id} className="text-sm font-medium">
                      {option.name}
                    </label>
                    <span className="text-sm text-muted-foreground">{preferences[option.id] || 0}/5</span>
                  </div>
                  <Slider
                    id={option.id}
                    min={0}
                    max={5}
                    step={1}
                    value={[preferences[option.id] || 0]}
                    onValueChange={(value) => handlePreferenceChange(option.id, value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button onClick={handleSave}>保存偏好</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

