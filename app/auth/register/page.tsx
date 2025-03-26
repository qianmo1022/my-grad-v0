"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Car, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || "user"
  const [activeTab, setActiveTab] = useState<string>(type)

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
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-first-name">姓</Label>
                    <Input id="user-first-name" placeholder="您的姓" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-last-name">名</Label>
                    <Input id="user-last-name" placeholder="您的名" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">邮箱</Label>
                  <Input id="user-email" type="email" placeholder="您的邮箱地址" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">密码</Label>
                  <Input id="user-password" type="password" placeholder="设置密码" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-confirm-password">确认密码</Label>
                  <Input id="user-confirm-password" type="password" placeholder="再次输入密码" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="user-terms" />
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
                <Button type="submit" className="w-full">
                  注册
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="dealer">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dealer-name">商家名称</Label>
                  <Input id="dealer-name" placeholder="您的商家名称" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-business-id">营业执照号</Label>
                  <Input id="dealer-business-id" placeholder="营业执照号码" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-email">商家邮箱</Label>
                  <Input id="dealer-email" type="email" placeholder="商家联系邮箱" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-phone">联系电话</Label>
                  <Input id="dealer-phone" type="tel" placeholder="商家联系电话" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-password">密码</Label>
                  <Input id="dealer-password" type="password" placeholder="设置密码" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dealer-confirm-password">确认密码</Label>
                  <Input id="dealer-confirm-password" type="password" placeholder="再次输入密码" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="dealer-terms" />
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
                <Button type="submit" className="w-full">
                  商家注册
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

