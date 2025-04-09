"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Save, Upload, Trash2, Building, MapPin, Clock, Phone, Mail, User } from "lucide-react"

interface DealerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessId: string;
  businessName: string;
  logo: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  businessHours: string;
  description: string;
}

export default function DealerSettings() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // 商家个人信息
  const [profile, setProfile] = useState<DealerProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    businessId: "",
    businessName: "",
    logo: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    businessHours: "",
    description: "",
  })
  
  // 密码修改表单
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  
  // 通知设置
  const [notifications, setNotifications] = useState({
    orderNotifications: true,
    marketingEmails: false,
    systemNotifications: true,
    smsNotifications: true,
  })

  // 获取商家信息
  useEffect(() => {
    async function fetchDealerProfile() {
      if (!session?.user?.id) return
      
      try {
        setIsLoading(true)
        
        // 调用API获取商家信息
        const response = await fetch('/api/dealer/profile')
        if (!response.ok) {
          throw new Error('获取商家信息失败')
        }
        
        const data = await response.json()
        setProfile(data.profile)
        setIsLoading(false)
      } catch (error) {
        console.error('获取商家信息失败:', error)
        toast({
          title: "数据加载失败",
          description: "无法加载商家信息，请稍后重试",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchDealerProfile()
  }, [session, toast])

  // 处理个人信息更新
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 处理密码修改
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 处理通知设置更改
  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  // 保存个人信息
  const saveProfile = async () => {
    try {
      setIsSaving(true)
      
      // 调用API更新商家信息
      const response = await fetch('/api/dealer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存个人信息失败')
      }
      
      toast({
        title: "保存成功",
        description: "您的个人信息已更新",
      })
      setIsSaving(false)
    } catch (error) {
      console.error('保存个人信息失败:', error)
      toast({
        title: "保存失败",
        description: "无法更新您的个人信息，请稍后重试",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  // 更改密码
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 表单验证
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "新密码和确认密码不一致",
        variant: "destructive",
      })
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "密码太短",
        description: "密码长度必须至少为8个字符",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSaving(true)
      
      // 调用API修改密码
      const response = await fetch('/api/dealer/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '密码更改失败')
      }
      
      // 重置表单
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      
      toast({
        title: "密码已更新",
        description: "您的密码已成功更改",
      })
      setIsSaving(false)
    } catch (error) {
      console.error('密码更改失败:', error)
      toast({
        title: "密码更改失败",
        description: "无法更改您的密码，请确认当前密码是否正确",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  // 保存通知设置
  const saveNotificationSettings = async () => {
    try {
      setIsSaving(true)
      
      // 模拟API调用 - 实际开发中应调用API
      // await fetch('/api/dealer/notification-settings', {
      //   method: 'PUT',
      //   body: JSON.stringify(notifications),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "设置已保存",
        description: "您的通知设置已更新",
      })
      setIsSaving(false)
    } catch (error) {
      console.error('保存通知设置失败:', error)
      toast({
        title: "保存失败",
        description: "无法更新您的通知设置，请稍后重试",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  // Logo上传处理
  const handleLogoUpload = () => {
    // 实际开发中应实现上传逻辑
    toast({
      title: "上传功能",
      description: "Logo上传功能尚未实现，这里是logo上传功能的占位",
    })
  }

  return (
    <DashboardLayout userType="dealer">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">商家设置</h2>
          <p className="text-muted-foreground">管理您的商家账户和设置</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">加载商家信息中...</p>
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="profile">个人信息</TabsTrigger>
              <TabsTrigger value="shop">商店信息</TabsTrigger>
              <TabsTrigger value="security">安全设置</TabsTrigger>
            </TabsList>
            
            {/* 个人信息设置 */}
            <TabsContent value="profile" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>个人信息</CardTitle>
                  <CardDescription>
                    管理您的个人信息和联系方式
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                    <div className="flex flex-col items-center space-y-2">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.logo} alt={profile.name} />
                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleLogoUpload}>
                          <Upload className="h-4 w-4 mr-2" />
                          上传
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">姓名</Label>
                          <div className="flex">
                            <User className="w-4 h-4 text-muted-foreground mr-2 mt-2.5" />
                            <Input
                              id="name"
                              name="name"
                              value={profile.name}
                              onChange={handleProfileChange}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">电子邮箱</Label>
                          <div className="flex">
                            <Mail className="w-4 h-4 text-muted-foreground mr-2 mt-2.5" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={profile.email}
                              onChange={handleProfileChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">联系电话</Label>
                          <div className="flex">
                            <Phone className="w-4 h-4 text-muted-foreground mr-2 mt-2.5" />
                            <Input
                              id="phone"
                              name="phone"
                              value={profile.phone}
                              onChange={handleProfileChange}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="businessId">商家ID</Label>
                          <div className="flex">
                            <Building className="w-4 h-4 text-muted-foreground mr-2 mt-2.5" />
                            <Input
                              id="businessId"
                              name="businessId"
                              value={profile.businessId}
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={saveProfile} disabled={isSaving}>
                    {isSaving ? "保存中..." : "保存更改"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* 商店信息设置 */}
            <TabsContent value="shop" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>商店信息</CardTitle>
                  <CardDescription>
                    更新您的商店信息和营业时间
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">商店名称</Label>
                    <div className="flex">
                      <Building className="w-4 h-4 text-muted-foreground mr-2 mt-2.5" />
                      <Input
                        id="businessName"
                        name="businessName"
                        value={profile.businessName}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address">详细地址</Label>
                      <div className="flex">
                        <MapPin className="w-4 h-4 text-muted-foreground mr-2 mt-2.5" />
                        <Input
                          id="address"
                          name="address"
                          value={profile.address}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">城市</Label>
                      <Input
                        id="city"
                        name="city"
                        value={profile.city}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="province">省份</Label>
                      <Input
                        id="province"
                        name="province"
                        value={profile.province}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">邮政编码</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={profile.postalCode}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessHours">营业时间</Label>
                    <div className="flex">
                      <Clock className="w-4 h-4 text-muted-foreground mr-2 mt-2.5" />
                      <Input
                        id="businessHours"
                        name="businessHours"
                        value={profile.businessHours}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">商店简介</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={profile.description}
                      onChange={handleProfileChange}
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={saveProfile} disabled={isSaving}>
                    {isSaving ? "保存中..." : "保存更改"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* 安全设置 */}
            <TabsContent value="security" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* 修改密码 */}
                <Card>
                  <CardHeader>
                    <CardTitle>修改密码</CardTitle>
                    <CardDescription>
                      更新您的登录密码
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={changePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">当前密码</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">新密码</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">确认新密码</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={isSaving} className="mt-2 w-full">
                        {isSaving ? "更改中..." : "更改密码"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                
                {/* 通知设置 */}
                <Card>
                  <CardHeader>
                    <CardTitle>通知设置</CardTitle>
                    <CardDescription>
                      管理您接收的通知类型
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="orderNotifications">订单通知</Label>
                          <p className="text-sm text-muted-foreground">
                            接收新订单和订单状态更新的通知
                          </p>
                        </div>
                        <Switch
                          id="orderNotifications"
                          checked={notifications.orderNotifications}
                          onCheckedChange={() => handleNotificationChange('orderNotifications')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="marketingEmails">营销邮件</Label>
                          <p className="text-sm text-muted-foreground">
                            接收促销和营销相关的电子邮件
                          </p>
                        </div>
                        <Switch
                          id="marketingEmails"
                          checked={notifications.marketingEmails}
                          onCheckedChange={() => handleNotificationChange('marketingEmails')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="systemNotifications">系统通知</Label>
                          <p className="text-sm text-muted-foreground">
                            接收系统更新和重要公告
                          </p>
                        </div>
                        <Switch
                          id="systemNotifications"
                          checked={notifications.systemNotifications}
                          onCheckedChange={() => handleNotificationChange('systemNotifications')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="smsNotifications">短信通知</Label>
                          <p className="text-sm text-muted-foreground">
                            通过短信接收紧急通知
                          </p>
                        </div>
                        <Switch
                          id="smsNotifications"
                          checked={notifications.smsNotifications}
                          onCheckedChange={() => handleNotificationChange('smsNotifications')}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={saveNotificationSettings} 
                      disabled={isSaving}
                      className="w-full"
                    >
                      {isSaving ? "保存中..." : "保存设置"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}