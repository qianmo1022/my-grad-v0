"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Car, ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "user"
  const [activeTab, setActiveTab] = useState<string>(type)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("") 
  const { toast } = useToast()
  
  // 用户注册表单状态
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false
  })
  
  // 商家注册表单状态
  const [dealerForm, setDealerForm] = useState({
    name: "",
    businessId: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false
  })
  
  // 处理用户表单输入变化
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target
    setUserForm(prev => ({
      ...prev,
      [id === "user-first-name" ? "firstName" : 
       id === "user-last-name" ? "lastName" : 
       id === "user-email" ? "email" : 
       id === "user-password" ? "password" : 
       id === "user-confirm-password" ? "confirmPassword" : 
       id === "user-terms" ? "terms" : id]: type === "checkbox" ? checked : value
    }))
  }
  
  // 处理商家表单输入变化
  const handleDealerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target
    setDealerForm(prev => ({
      ...prev,
      [id === "dealer-name" ? "name" : 
       id === "dealer-business-id" ? "businessId" : 
       id === "dealer-email" ? "email" : 
       id === "dealer-phone" ? "phone" : 
       id === "dealer-password" ? "password" : 
       id === "dealer-confirm-password" ? "confirmPassword" : 
       id === "dealer-terms" ? "terms" : id]: type === "checkbox" ? checked : value
    }))
  }
  
  // 处理注册表单提交
  const handleSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const formData = type === "user" ? userForm : dealerForm
      
      // 验证密码匹配
      if (formData.password !== formData.confirmPassword) {
        setError("两次输入的密码不匹配")
        toast({
          variant: "destructive",
          title: "注册失败",
          description: "两次输入的密码不匹配，请重新输入"
        })
        setIsLoading(false)
        return
      }
      
      // 验证条款同意
      if (!formData.terms) {
        setError("请同意服务条款和隐私政策")
        toast({
          variant: "destructive",
          title: "注册失败",
          description: "请同意服务条款和隐私政策"
        })
        setIsLoading(false)
        return
      }
      
      // 准备提交数据
      const submitData = type === "user" ? {
        email: userForm.email,
        password: userForm.password,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        type: "user"
      } : {
        email: dealerForm.email,
        password: dealerForm.password,
        name: dealerForm.name,
        businessId: dealerForm.businessId,
        phone: dealerForm.phone,
        type: "dealer"
      }
      
      // 发送注册请求
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '注册失败')
      }
      
      // 注册成功，自动登录
      const loginResult = await signIn("credentials", {
        redirect: false,
        email: submitData.email,
        password: submitData.password,
        type: type
      })
      
      if (loginResult?.error) {
        // 登录失败但注册成功，引导用户去登录页面
        toast({
          title: "注册成功",
          description: "请使用您的账号登录系统"
        })
        router.push(`/auth/login?type=${type}`)
      } else {
        // 注册并登录成功
        toast({
          title: "注册成功",
          description: "欢迎加入我们！"
        })
        
        // 根据用户类型重定向到不同的仪表板
        if (type === "user") {
          router.push("/dashboard/user")
        } else {
          router.push("/dashboard/dealer")
        }
      }
    } catch (error: any) {
      console.error("注册错误:", error)
      setError(error.message || "注册失败，请稍后再试")
      toast({
        variant: "destructive",
        title: "注册失败",
        description: error.message || "注册失败，请稍后再试"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </Link>

      <div className="flex items-center gap-2 mb-8">
        <Car className="h-6 w-6" />
        <span className="text-xl font-bold">AutoConfig Pro</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">创建账户</CardTitle>
          <CardDescription className="text-center">选择您的账户类型并填写注册信息</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="user">用户注册</TabsTrigger>
              <TabsTrigger value="dealer">商家注册</TabsTrigger>
            </TabsList>
            <TabsContent value="user">
              {error && <p className="text-sm text-destructive mb-4">{error}</p>}
              <form className="space-y-4" onSubmit={(e) => handleSubmit(e, "user")}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-first-name">姓</Label>
                    <Input 
                      id="user-first-name" 
                      placeholder="您的姓" 
                      value={userForm.firstName}
                      onChange={handleUserChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-last-name">名</Label>
                    <Input 
                      id="user-last-name" 
                      placeholder="您的名" 
                      value={userForm.lastName}
                      onChange={handleUserChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">邮箱</Label>
                  <Input 
                    id="user-email" 
                    type="email" 
                    placeholder="您的邮箱地址" 
                    value={userForm.email}
                    onChange={handleUserChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">密码</Label>
                  <Input 
                    id="user-password" 
                    type="password" 
                    placeholder="设置密码" 
                    value={userForm.password}
                    onChange={handleUserChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-confirm-password">确认密码</Label>
                  <Input 
                    id="user-confirm-password" 
                    type="password" 
                    placeholder="再次输入密码" 
                    value={userForm.confirmPassword}
                    onChange={handleUserChange}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="user-terms" 
                    checked={userForm.terms}
                    onCheckedChange={(checked) => 
                      setUserForm(prev => ({ ...prev, terms: checked === true }))
                    }
                  />
                  <label
                    htmlFor="user-terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    我同意
                    <Link href="/terms" className="text-primary hover:underline ml-1">
                      服务条款
                    </Link>
                    和
                    <Link href="/privacy" className="text-primary hover:underline ml-1">
                      隐私政策
                    </Link>
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      注册中...
                    </>
                  ) : (
                    "注册"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="dealer">
              {error && <p className="text-sm text-destructive mb-4">{error}</p>}
              <form className="space-y-4" onSubmit={(e) => handleSubmit(e, "dealer")}>
                <div className="space-y-2">
                  <Label htmlFor="dealer-name">商家名称</Label>
                  <Input 
                    id="dealer-name" 
                    placeholder="您的商家名称" 
                    value={dealerForm.name}
                    onChange={handleDealerChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-business-id">营业执照号</Label>
                  <Input 
                    id="dealer-business-id" 
                    placeholder="营业执照号码" 
                    value={dealerForm.businessId}
                    onChange={handleDealerChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-email">商家邮箱</Label>
                  <Input 
                    id="dealer-email" 
                    type="email" 
                    placeholder="商家联系邮箱" 
                    value={dealerForm.email}
                    onChange={handleDealerChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-phone">联系电话</Label>
                  <Input 
                    id="dealer-phone" 
                    type="tel" 
                    placeholder="商家联系电话" 
                    value={dealerForm.phone}
                    onChange={handleDealerChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-password">密码</Label>
                  <Input 
                    id="dealer-password" 
                    type="password" 
                    placeholder="设置密码" 
                    value={dealerForm.password}
                    onChange={handleDealerChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-confirm-password">确认密码</Label>
                  <Input 
                    id="dealer-confirm-password" 
                    type="password" 
                    placeholder="再次输入密码" 
                    value={dealerForm.confirmPassword}
                    onChange={handleDealerChange}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="dealer-terms" 
                    checked={dealerForm.terms}
                    onCheckedChange={(checked) => 
                      setDealerForm(prev => ({ ...prev, terms: checked === true }))
                    }
                  />
                  <label
                    htmlFor="dealer-terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    我同意
                    <Link href="/terms" className="text-primary hover:underline ml-1">
                      服务条款
                    </Link>
                    和
                    <Link href="/privacy" className="text-primary hover:underline ml-1">
                      隐私政策
                    </Link>
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      注册中...
                    </>
                  ) : (
                    "商家注册"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            已有账户?{" "}
            <Link
              href={activeTab === "user" ? "/auth/login?type=user" : "/auth/login?type=dealer"}
              className="text-primary hover:underline"
            >
              立即登录
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

