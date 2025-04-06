import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Car, Cog, CreditCard, ShieldCheck, User, Store, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import FeatureSection from "@/components/feature-section"
import HeroCarousel from "@/components/hero-carousel"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 导航栏 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6" />
            <span className="text-xl font-bold">AutoConfig Pro</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              功能特点
            </Link>
            <Link href="#showcase" className="text-sm font-medium hover:underline underline-offset-4">
              车型展示
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">
              用户评价
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                登录
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">注册</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 英雄区域 */}
        <section className="relative">
          <div className="container px-4 py-16 md:py-24 lg:py-32 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              打造专属于您的<span className="text-primary">理想座驾</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-[800px] mb-8">
              通过我们的3D可视化配置系统，轻松定制您的梦想汽车，实时查看效果，享受个性化的购车体验。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/auth/login?type=user">
                <Button size="lg" className="gap-2">
                  <User size={18} />
                  用户登录
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login?type=dealer">
                <Button size="lg" variant="outline" className="gap-2">
                  <Store size={18} />
                  商家登录
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="w-full max-w-5xl h-[300px] md:h-[400px] lg:h-[500px] relative rounded-lg overflow-hidden shadow-xl">
              <HeroCarousel />
            </div>
          </div>
        </section>

        {/* 功能特点 */}
        <section id="features" className="bg-muted/50 py-16 md:py-24">
          <div className="container px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">强大功能，尽在掌握</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureSection
                icon={<Car className="h-10 w-10 text-primary" />}
                title="车型展示"
                description="浏览各类汽车基本信息、外观设计及配置选项，找到最适合您的车型。"
              />
              <FeatureSection
                icon={<Cog className="h-10 w-10 text-primary" />}
                title="个性化配置"
                description="自定义车辆配置，从内饰到发动机，打造专属于您的独特座驾。"
              />
              <FeatureSection
                icon={<BarChart3 className="h-10 w-10 text-primary" />}
                title="实时价格计算"
                description="根据您选择的配置，系统实时计算并展示车辆总价，包括额外选项费用和税费。"
              />
              <FeatureSection
                icon={<ShieldCheck className="h-10 w-10 text-primary" />}
                title="个性化推荐"
                description="基于您的偏好和浏览历史，智能推荐符合您需求的配置选项。"
              />
              <FeatureSection
                icon={<CreditCard className="h-10 w-10 text-primary" />}
                title="支付与订单管理"
                description="便捷的线上支付功能和订单管理系统，让您轻松完成购买流程。"
              />
              <FeatureSection
                icon={<User className="h-10 w-10 text-primary" />}
                title="用户权限管理"
                description="为不同用户提供个性化设置和操作权限，确保系统安全高效运作。"
              />
            </div>
          </div>
        </section>

        {/* 车型展示 */}
        <section id="showcase" className="py-16 md:py-24">
          <div className="container px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">热门车型展示</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  id: "luxury-sedan",
                  name: "豪华轿车",
                  price: "¥350,000起",
                  image: "/et5.jpg",
                },
                {
                  id: "city-suv",
                  name: "城市SUV",
                  price: "¥280,000起",
                  image: "/Model-Y.png",
                },
                {
                  id: "sports-car",
                  name: "跑车系列",
                  price: "¥580,000起",
                  image: "/911.jpg",
                },
              ].map((car, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image src={car.image || "/placeholder.svg"} alt={car.name} fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle>{car.name}</CardTitle>
                    <CardDescription>{car.price}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href={`/configure/${car.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        开始配置
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Link href="/cars">
                <Button size="lg">
                  查看全部车型
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 用户评价 */}
        <section id="testimonials" className="bg-muted/50 py-16 md:py-24">
          <div className="container px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">用户评价</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "张先生",
                  role: "企业家",
                  comment: "这个系统让我轻松配置了我的新车，3D展示功能非常直观，让我对最终效果一目了然。",
                },
                {
                  name: "李女士",
                  role: "设计师",
                  comment: "个性化推荐功能帮我找到了最适合我的配置，省去了大量挑选时间，非常满意！",
                },
                {
                  name: "王先生",
                  role: "工程师",
                  comment: "实时价格计算功能很实用，让我能够在预算范围内做出最佳选择，整个过程非常流畅。",
                },
              ].map((testimonial, index) => (
                <Card key={index} className="bg-background">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">"{testimonial.comment}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 行动召唤 */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">准备好开始您的汽车定制之旅了吗？</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              立即注册，体验我们的3D汽车配置系统，打造专属于您的理想座驾。
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/register?type=user">
                <Button size="lg" variant="secondary" className="gap-2">
                  <User size={18} />
                  用户注册
                </Button>
              </Link>
              <Link href="/auth/register?type=dealer">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-primary/20 hover:bg-primary/30 border-primary-foreground/20"
                >
                  <Store size={18} />
                  商家注册
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t py-8 bg-background">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Car className="h-5 w-5" />
              <span className="text-lg font-semibold">AutoConfig Pro</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                关于我们
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                联系方式
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                隐私政策
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                使用条款
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AutoConfig Pro. 保留所有权利。
          </div>
        </div>
      </footer>
    </div>
  )
}

