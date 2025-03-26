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
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "user"
  const [activeTab, setActiveTab] = useState<string>(type)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("") 
  const { toast } = useToast()
  
  // 用户登录表单状态
  const [userForm, setUserForm] = useState({
    email: "",
    password: ""
  })
  
  // 商家登录表单状态
  const [dealerForm, setDealerForm] = useState({
    email: "",
    password: ""
  })
  
  // 处理用户表单输入变化
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setUserForm(prev => ({
      ...prev,
      [id === "user-email" ? "email" : "password"]: value
    }))
  }
  
  // 处理商家表单输入变化
  const handleDealerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setDealerForm(prev => ({
      ...prev,
      [id === "dealer-email" ? "email" : "password"]: value
    }))
  }
  
  // 处理登录表单提交
  const handleSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const formData = type === "user" ? userForm : dealerForm
      
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        type: type
      })
      
      if (result?.error) {
        setError("邮箱或密码错误")
        toast({
          variant: "destructive",
          title: "登录失败",
          description: "邮箱或密码错误，请重试"
        })
      } else {
        toast({
          title: "登录成功",
          description: "欢迎回来！"
        })
        
        // 根据用户类型重定向到不同的仪表板
        if (type === "user") {
          router.push("/dashboard/user")
        } else {
          router.push("/dashboard/dealer")
        }
      }
    } catch (error) {
      console.error("登录错误:", error)
      setError("登录失败，请稍后再试")
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "服务器错误，请稍后再试"
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
          <CardTitle className="text-2xl font-bold text-center">登录账户</CardTitle>
          <CardDescription className="text-center">选择您的账户类型并输入登录信息</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="user">用户登录</TabsTrigger>
              <TabsTrigger value="dealer">商家登录</TabsTrigger>
            </TabsList>
            <TabsContent value="user">
              {error && <p className="text-sm text-destructive mb-4">{error}</p>}
              <form className="space-y-4" onSubmit={(e) => handleSubmit(e, "user")}>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="user-password">密码</Label>
                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                      忘记密码?
                    </Link>
                  </div>
                  <Input 
                    id="user-password" 
                    type="password" 
                    placeholder="您的密码" 
                    value={userForm.password}
                    onChange={handleUserChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    "登录"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="dealer">
              {error && <p className="text-sm text-destructive mb-4">{error}</p>}
              <form className="space-y-4" onSubmit={(e) => handleSubmit(e, "dealer")}>
                <div className="space-y-2">
                  <Label htmlFor="dealer-email">商家邮箱</Label>
                  <Input 
                    id="dealer-email" 
                    type="email" 
                    placeholder="商家邮箱地址" 
                    value={dealerForm.email}
                    onChange={handleDealerChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dealer-password">密码</Label>
                    <Link href="/auth/forgot-password?type=dealer" className="text-sm text-primary hover:underline">
                      忘记密码?
                    </Link>
                  </div>
                  <Input 
                    id="dealer-password" 
                    type="password" 
                    placeholder="商家密码" 
                    value={dealerForm.password}
                    onChange={handleDealerChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登录中...
                    </>
                  ) : (
                    "商家登录"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            还没有账户?{" "}
            <Link
              href={activeTab === "user" ? "/auth/register?type=user" : "/auth/register?type=dealer"}
              className="text-primary hover:underline"
            >
              立即注册
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

