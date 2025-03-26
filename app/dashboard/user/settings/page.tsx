"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
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
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 个人信息表单状态
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  // 通知设置状态
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    systemNotifications: true,
    reviewReplies: true,
  })

  // 获取用户信息
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        
        // 即使session未完全加载也尝试请求用户数据
        const response = await fetch('/api/user')
        
        if (response.ok) {
          const userData = await response.json()
          
          // 更新表单状态
          setProfileForm({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
          })
        } else {
          console.error('获取用户数据失败')
          
          // 如果有session信息，使用session中的基本信息
          if (session?.user) {
            setProfileForm(prev => ({
              ...prev,
              email: session.user.email || "",
              // 可以从session.user.name提取firstName和lastName，如果name格式是"firstName lastName"
              firstName: session.user.name?.split(' ')[0] || "",
              lastName: session.user.name?.split(' ')[1] || "",
            }))
          }
          
          toast({
            title: "获取用户信息失败",
            description: "无法加载您的详细个人信息，已显示基本信息",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('获取用户数据错误:', error)
        
        // 如果有session信息，使用session中的基本信息
        if (session?.user) {
          setProfileForm(prev => ({
            ...prev,
            email: session.user.email || "",
            // 可以从session.user.name提取firstName和lastName，如果name格式是"firstName lastName"
            firstName: session.user.name?.split(' ')[0] || "",
            lastName: session.user.name?.split(' ')[1] || "",
          }))
        }
        
        toast({
          title: "获取用户信息失败",
          description: "无法加载您的详细个人信息，已显示基本信息",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [session, toast])

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
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
        }),
      })

      if (response.ok) {
        toast({
          title: "个人信息已更新",
          description: "您的个人信息已成功保存",
        })
      } else {
        toast({
          title: "更新失败",
          description: "保存个人信息时出现错误，请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('更新用户信息错误:', error)
      toast({
        title: "更新失败",
        description: "保存个人信息时出现错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理密码更新
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string
    
    // 验证密码
    if (newPassword !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "新密码和确认密码不一致，请重新输入",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }
    
    try {
      // 这里应该调用更新密码的API
      // 目前模拟API请求，后续可以实现真实的API调用
      // const response = await fetch('/api/user/password', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ currentPassword, newPassword }),
      // })
      
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "密码已更新",
        description: "您的密码已成功更新",
      })
      
      // 重置表单
      form.reset()
    } catch (error) {
      console.error('更新密码错误:', error)
      toast({
        title: "更新失败",
        description: "更新密码时出现错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理通知设置保存
  const handleNotificationSave = async () => {
    setIsSubmitting(true)
    
    try {
      // 这里应该调用更新通知设置的API
      // 目前模拟API请求，后续可以实现真实的API调用
      // const response = await fetch('/api/user/notifications', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(notificationSettings),
      // })
      
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "通知设置已更新",
        description: "您的通知偏好设置已成功保存",
      })
    } catch (error) {
      console.error('更新通知设置错误:', error)
      toast({
        title: "更新失败",
        description: "保存通知设置时出现错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <p className="text-muted-foreground">加载用户信息中...</p>
                  </div>
                ) : (
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src="/placeholder.svg?height=96&width=96" alt={`${profileForm.firstName} ${profileForm.lastName}`} />
                          <AvatarFallback>{profileForm.firstName ? profileForm.firstName.charAt(0) : "U"}</AvatarFallback>
                        </Avatar>

                        <Button type="button" variant="outline" size="sm" className="gap-2">
                          <Upload className="h-4 w-4" />
                          更换头像
                        </Button>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">姓</Label>
                            <Input id="firstName" name="firstName" value={profileForm.firstName} onChange={handleProfileChange} />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lastName">名</Label>
                            <Input id="lastName" name="lastName" value={profileForm.lastName} onChange={handleProfileChange} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">电子邮箱</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "保存中..." : "保存更改"}
                      </Button>
                    </div>
                  </form>
                )}
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

