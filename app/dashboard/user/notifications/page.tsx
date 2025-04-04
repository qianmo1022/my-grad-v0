"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, ShoppingCart, MessageSquare, AlertCircle, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

// 通知类型
type NotificationType = "system" | "order" | "review" | "promotion"

// 通知数据接口
interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  date: string
  read: boolean
  link?: string
  icon?: React.ReactNode
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // 获取通知图标
  const getNotificationIcon = (type: NotificationType) => {
    switch(type) {
      case "system":
        return <Info className="h-5 w-5 text-blue-500" />
      case "order":
        return <ShoppingCart className="h-5 w-5 text-green-500" />
      case "review":
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      case "promotion":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  // 从API获取通知
  const fetchNotifications = async (type?: string, unreadOnly?: boolean) => {
    try {
      setIsLoading(true)
      
      // 构建查询参数
      const params = new URLSearchParams()
      if (type && type !== 'all') {
        params.append('type', type)
      }
      if (unreadOnly) {
        params.append('unread', 'true')
      }
      
      const queryString = params.toString()
      const url = `/api/user/notifications${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('获取通知失败')
      }
      
      const data = await response.json()
      
      // 添加图标到通知数据
      const notificationsWithIcons = data.map((notification: Notification) => ({
        ...notification,
        icon: getNotificationIcon(notification.type)
      }))
      
      setNotifications(notificationsWithIcons)
    } catch (error) {
      console.error('获取通知失败:', error)
      toast({
        title: "获取通知失败",
        description: "无法加载通知列表，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载通知
  useEffect(() => {
    fetchNotifications()
  }, [])

  // 标记通知为已读
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/user/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationId: id
        })
      })

      if (!response.ok) {
        throw new Error('标记通知失败')
      }

      // 更新本地状态
      setNotifications(notifications.map((notif) => 
        notif.id === id ? { ...notif, read: true } : notif
      ))

      toast({
        title: "已标记为已读",
        description: "通知已更新",
      })
    } catch (error) {
      console.error('标记通知失败:', error)
      toast({
        title: "操作失败",
        description: "无法更新通知状态，请稍后重试",
        variant: "destructive"
      })
    }
  }

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/user/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          all: true
        })
      })

      if (!response.ok) {
        throw new Error('标记所有通知失败')
      }

      // 更新本地状态
      setNotifications(notifications.map((notif) => ({ ...notif, read: true })))

      toast({
        title: "全部已读",
        description: "所有通知已标记为已读",
      })
    } catch (error) {
      console.error('标记所有通知失败:', error)
      toast({
        title: "操作失败",
        description: "无法更新通知状态，请稍后重试",
        variant: "destructive"
      })
    }
  }

  // 获取未读通知数量
  const getUnreadCount = (type?: NotificationType) => {
    return notifications.filter((notif) => !notif.read && (type ? notif.type === type : true)).length
  }

  // 根据类型筛选通知
  const getFilteredNotifications = (type?: NotificationType) => {
    return notifications.filter((notif) => (type ? notif.type === type : true))
  }

  // 处理标签切换
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // 当切换标签时重新获取对应类型的通知
    if (value === 'all') {
      fetchNotifications()
    } else {
      fetchNotifications(value)
    }
  }

  return (
    <DashboardLayout userType="user">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">消息通知</h2>
          <p className="text-muted-foreground">查看您的系统通知、订单更新和其他消息</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>通知中心</CardTitle>
              <CardDescription>您有 {getUnreadCount()} 条未读通知</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={markAllAsRead} 
              disabled={getUnreadCount() === 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  加载中...
                </>
              ) : (
                "全部标为已读"
              )}
            </Button>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all" className="relative">
                  全部通知
                  {getUnreadCount() > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">{getUnreadCount()}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="system" className="relative">
                  系统通知
                  {getUnreadCount("system") > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">{getUnreadCount("system")}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="order" className="relative">
                  订单更新
                  {getUnreadCount("order") > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">{getUnreadCount("order")}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="review" className="relative">
                  评价相关
                  {getUnreadCount("review") > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">{getUnreadCount("review")}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">加载通知中...</span>
                </div>
              ) : (
                ["all", "system", "order", "review"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
                    {getFilteredNotifications(tab === "all" ? undefined : (tab as NotificationType)).length > 0 ? (
                      getFilteredNotifications(tab === "all" ? undefined : (tab as NotificationType)).map(
                        (notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              "flex gap-4 p-4 rounded-lg transition-colors",
                              notification.read ? "bg-card" : "bg-muted/50",
                              "border cursor-pointer hover:bg-muted/30",
                            )}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {notification.icon || <Bell className="h-5 w-5 text-muted-foreground" />}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className={cn("font-medium", !notification.read && "font-semibold")}>
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-muted-foreground">{notification.date}</span>
                              </div>

                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>

                              <div className="flex justify-between items-center mt-2">
                                {notification.link && (
                                  <Button variant="link" className="p-0 h-auto" asChild>
                                    <a href={notification.link}>查看详情</a>
                                  </Button>
                                )}

                                {!notification.read && (
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                    未读
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">暂无通知</p>
                      </div>
                    )}
                  </TabsContent>
                ))
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

