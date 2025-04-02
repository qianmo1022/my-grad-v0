"use client"
import DashboardLayout from "@/components/dashboard/layout"
import SavedConfigs from "@/components/dashboard/saved-configs"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function UserConfigurations() {
  const [savedConfigs, setSavedConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // 从API获取用户保存的配置
  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/configurations')
        
        if (response.ok) {
          const data = await response.json()
          setSavedConfigs(data)
        } else {
          toast({
            title: "获取配置失败",
            description: "无法加载您保存的配置，请稍后再试",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("获取配置出错:", error)
        toast({
          title: "获取配置失败",
          description: "发生错误，请稍后再试",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchConfigurations()
  }, [])

  return (
    <DashboardLayout userType="user">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">我的配置</h2>
          <p className="text-muted-foreground">查看和管理您保存的所有汽车配置方案。</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          savedConfigs.length > 0 ? (
            <SavedConfigs configs={savedConfigs} />
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">您还没有保存任何配置</p>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  )
}

