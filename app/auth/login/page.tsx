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

export default function LoginPage() {
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
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-email">邮箱</Label>
                  <Input id="user-email" type="email" placeholder="您的邮箱地址" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="user-password">密码</Label>
                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                      忘记密码?
                    </Link>
                  </div>
                  <Input id="user-password" type="password" placeholder="您的密码" />
                </div>
                <Button type="submit" className="w-full">
                  登录
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="dealer">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dealer-email">商家邮箱</Label>
                  <Input id="dealer-email" type="email" placeholder="商家邮箱地址" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dealer-password">密码</Label>
                    <Link href="/auth/forgot-password?type=dealer" className="text-sm text-primary hover:underline">
                      忘记密码?
                    </Link>
                  </div>
                  <Input id="dealer-password" type="password" placeholder="商家密码" />
                </div>
                <Button type="submit" className="w-full">
                  商家登录
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

