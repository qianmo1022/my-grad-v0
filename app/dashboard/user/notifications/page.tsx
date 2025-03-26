"use client"

import type React from "react"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, ShoppingCart, MessageSquare, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

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

// 模拟通知数据
const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "system",
    title: "系统维护通知",
    message: "我们将于2024年3月15日凌晨2:00-4:00进行系统维护，期间可能无法访问部分功能。",
    date: "2024-03-10",
    read: true,
    icon: <Info className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "notif-002",
    type: "order",
    title: "订单状态更新",
    message: "您的订单 #ORD-002 已开始处理，预计3-5个工作日内完成配置。",
    date: "2024-03-05",
    read: false,
    link: "/dashboard/user/orders",
    icon: <ShoppingCart className="h-5 w-5 text-green-500" />,
  },
  {
    id: "notif-003",
    type: "review",
    title: "评价获得回复",
    message: '商家已回复您对"豪华轿车"的评价：感谢您的反馈，我们非常重视您的意见...',
    date: "2024-03-01",
    read: false,
    link: "/dashboard/user/reviews",
    icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
  },
  {
    id: "notif-004",
    type: "promotion",
    title: "限时优惠活动",
    message: "春季特惠：所有豪华轿车系列配置升级享8折优惠，活动截止到2024年3月31日。",
    date: "2024-02-28",
    read: true,
    link: "/cars/luxury-sedan",
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
  },
  {
    id: "notif-005",
    type: "system",
    title: "账户安全提醒",
    message: "我们检测到您的账户在新设备上登录，如非本人操作，请立即修改密码。",
    date: "2024-02-25",
    read: true,
    icon: <Info className="h-5 w-5 text-blue-500" />,
  },
  {
    id: "notif-006",
    type: "order",
    title: "订单已完成",
    message: "您的订单 #ORD-001 已完成，感谢您的购买！请前往订单详情页查看更多信息。",
    date: "2024-02-20",
    read: true,
    link: "/dashboard/user/orders",
    icon: <ShoppingCart className="h-5 w-5 text-green-500" />,
  },
  {
    id: "notif-007",
    type: "review",
    title: "您的评价很受欢迎",
    message: '您对"跑车系列"的评价已获得25个有帮助标记，感谢您的分享！',
    date: "2024-02-15",
    read: true,
    link: "/dashboard/user/reviews",
    icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  // 标记通知为已读
  const markAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  // 标记所有通知为已读
  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
  }

  // 获取未读通知���量
  const getUnreadCount = (type?: NotificationType) => {
    return notifications.filter((notif) => !notif.read && (type ? notif.type === type : true)).length
  }

  // 根据类型筛选通知
  const getFilteredNotifications = (type?: NotificationType) => {
    return notifications.filter((notif) => (type ? notif.type === type : true))
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
            <Button variant="outline" onClick={markAllAsRead} disabled={getUnreadCount() === 0}>
              全部标为已读
            </Button>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="all">
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

              {["all", "system", "order", "review"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
                  {getFilteredNotifications(tab === "all" ? undefined : (tab as NotificationType)).length > 0 ? (
                    getFilteredNotifications(tab === "all" ? undefined : (tab as NotificationType)).map(
                      (notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "flex gap-4 p-4 rounded-lg transition-colors",
                            notification.read ? "bg-card" : "bg-muted/50",
                            "border",
                          )}
                          onClick={() => markAsRead(notification.id)}
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
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

