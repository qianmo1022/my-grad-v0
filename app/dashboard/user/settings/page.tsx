"use client"

import type React from "react"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Upload } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 个人信息表单状态
  const [profileForm, setProfileForm] = useState({
    name: "张先生",
    email: "zhang@example.com",
    phone: "13800138000",
    address: "上海市浦东新区张江高科技园区",
  })

  // 通知设置状态
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    systemNotifications: true,
    reviewReplies: true,
  })

  // 处理个人信息表单变更
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  // 处理通知设置变更
  const handleNotificationChange = (key: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // 处理个人信息保存
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 模拟API请求
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "个人信息已更新",
        description: "您的个人信息已成功保存",
      })
    }, 1000)
  }

  // 处理密码更新
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 模拟API请求
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "密码已更新",
        description: "您的密码已成功更新",
      })

      // 重置表单
      const form = e.target as HTMLFormElement
      form.reset()
    }, 1000)
  }

  // 处理通知设置保存
  const handleNotificationSave = () => {
    setIsSubmitting(true)

    // 模拟API请求
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "通知设置已更新",
        description: "您的通知偏好设置已成功保存",
      })
    }, 1000)
  }

  return (
    <DashboardLayout userType="user">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">个人设置</h2>
          <p className="text-muted-foreground">管理您的账户信息、密码和通知偏好</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="profile">个人信息</TabsTrigger>
            <TabsTrigger value="security">安全设置</TabsTrigger>
            <TabsTrigger value="notifications">通知设置</TabsTrigger>
          </TabsList>

          {/* 个人信息设置 */}
          <TabsContent value="profile" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>个人资料</CardTitle>
                <CardDescription>更新您的个人信息和联系方式</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="张先生" />
                        <AvatarFallback>张</AvatarFallback>
                      </Avatar>

                      <Button type="button" variant="outline" size="sm" className="gap-2">
                        <Upload className="h-4 w-4" />
                        更换头像
                      </Button>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">姓名</Label>
                          <Input id="name" name="name" value={profileForm.name} onChange={handleProfileChange} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">电子邮箱</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">手机号码</Label>
                          <Input id="phone" name="phone" value={profileForm.phone} onChange={handleProfileChange} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">地址</Label>
                        <Input id="address" name="address" value={profileForm.address} onChange={handleProfileChange} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "保存中..." : "保存更改"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 安全设置 */}
          <TabsContent value="security" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>修改密码</CardTitle>
                <CardDescription>更新您的账户密码</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">当前密码</Label>
                    <Input id="current-password" name="currentPassword" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">新密码</Label>
                    <Input id="new-password" name="newPassword" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">确认新密码</Label>
                    <Input id="confirm-password" name="confirmPassword" type="password" />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "更新中..." : "更新密码"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>账户安全</CardTitle>
                <CardDescription>管理您的账户安全设置</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">两步验证</div>
                    <div className="text-sm text-muted-foreground">使用手机验证码增强账户安全</div>
                  </div>
                  <Button variant="outline">设置</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">登录设备管理</div>
                    <div className="text-sm text-muted-foreground">查看和管理已登录的设备</div>
                  </div>
                  <Button variant="outline">查看</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">账户活动日志</div>
                    <div className="text-sm text-muted-foreground">查看您的账户活动历史</div>
                  </div>
                  <Button variant="outline">查看</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>通知偏好</CardTitle>
                <CardDescription>管理您接收的通知类型和方式</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">电子邮件通知</div>
                    <div className="text-sm text-muted-foreground">接收电子邮件通知</div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationChange("emailNotifications")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">订单更新</div>
                    <div className="text-sm text-muted-foreground">接收订单状态变更通知</div>
                  </div>
                  <Switch
                    checked={notificationSettings.orderUpdates}
                    onCheckedChange={() => handleNotificationChange("orderUpdates")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">促销活动</div>
                    <div className="text-sm text-muted-foreground">接收优惠和促销信息</div>
                  </div>
                  <Switch
                    checked={notificationSettings.promotions}
                    onCheckedChange={() => handleNotificationChange("promotions")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">系统通知</div>
                    <div className="text-sm text-muted-foreground">接收系统维护和更新通知</div>
                  </div>
                  <Switch
                    checked={notificationSettings.systemNotifications}
                    onCheckedChange={() => handleNotificationChange("systemNotifications")}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">评价回复</div>
                    <div className="text-sm text-muted-foreground">接收评价回复和互动通知</div>
                  </div>
                  <Switch
                    checked={notificationSettings.reviewReplies}
                    onCheckedChange={() => handleNotificationChange("reviewReplies")}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button onClick={handleNotificationSave} disabled={isSubmitting}>
                  {isSubmitting ? "保存中..." : "保存设置"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

