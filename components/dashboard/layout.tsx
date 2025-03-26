"use client"

import { type ReactNode, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Car,
  User,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  BarChart3,
  ShoppingCart,
  Heart,
  Bell,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: ReactNode
  userType: "user" | "dealer"
}

export default function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const [userInfo, setUserInfo] = useState({
    name: userType === "user" ? "用户" : "商家",
    email: "",
    avatar: "/placeholder.svg?height=40&width=40"
  })

  // 从会话中获取用户信息
  useEffect(() => {
    if (session?.user) {
      const name = session.user.name || (userType === "user" ? "用户" : "商家")
      setUserInfo({
        name: name,
        email: session.user.email || "",
        avatar: session.user.image || "/placeholder.svg?height=40&width=40"
      })
    }
  }, [session, userType])

  const userNavItems = [
    {
      title: "概览",
      href: "/dashboard/user",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "我的配置",
      href: "/dashboard/user/configurations",
      icon: <Car className="h-5 w-5" />,
    },
    {
      title: "我的订单",
      href: "/dashboard/user/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      title: "收藏车型",
      href: "/dashboard/user/favorites",
      icon: <Heart className="h-5 w-5" />,
    },
    {
      title: "我的评价",
      href: "/dashboard/user/reviews",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "消息通知",
      href: "/dashboard/user/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      title: "个人设置",
      href: "/dashboard/user/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const dealerNavItems = [
    {
      title: "概览",
      href: "/dashboard/dealer",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "车型管理",
      href: "/dashboard/dealer/cars",
      icon: <Car className="h-5 w-5" />,
    },
    {
      title: "订单管理",
      href: "/dashboard/dealer/orders",
      icon: <Package className="h-5 w-5" />,
    },
    {
      title: "客户管理",
      href: "/dashboard/dealer/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "销售报表",
      href: "/dashboard/dealer/reports",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "商家设置",
      href: "/dashboard/dealer/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const navItems = userType === "user" ? userNavItems : dealerNavItems

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* 移动端侧边栏 */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <div className="space-y-4 py-4">
            <div className="px-6 py-2 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Car className="h-6 w-6" />
                <span className="text-xl font-bold">AutoConfig Pro</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="px-6 py-2">
              <div className="flex items-center gap-3 mb-6">
                <Avatar>
                  <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                  <AvatarFallback>{userInfo.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{userInfo.name}</p>
                  <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="px-6 py-2">
              <Link
                href="/api/auth/signout"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="h-5 w-5" />
                退出登录
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 桌面端侧边栏 */}
      <div className="hidden lg:flex flex-col w-72 border-r bg-background">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Car className="h-6 w-6" />
            <span className="text-xl font-bold">AutoConfig Pro</span>
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <Avatar>
              <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
              <AvatarFallback>{userInfo.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{userInfo.name}</p>
              <p className="text-xs text-muted-foreground">{userInfo.email}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-5 w-5" />
            退出登录
          </Link>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex-1 flex items-center gap-2">
            <h1 className="text-lg font-semibold">{userType === "user" ? "用户面板" : "商家面板"}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              {userType === "user" ? <User className="h-5 w-5" /> : <Store className="h-5 w-5" />}
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

