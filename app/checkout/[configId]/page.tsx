"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import CarImageViewer from "@/components/configurator/car-image-viewer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CreditCard, Truck, Calendar, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getCarById } from "@/lib/car-data"

// 从API获取已保存配置的函数
const getSavedConfig = async (configId: string) => {
  if (!configId) {
    throw new Error("configId不能为空");
  }
  
  try {
    const response = await fetch(`/api/configurations/${configId}`);
    
    if (!response.ok) {
      throw new Error('获取配置失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取保存的配置失败:', error);
    throw error;
  }
}

// 定义更精确的类型
interface CheckoutPageProps {
  params: Promise<{
    configId: string
  }>
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  // 使用 React.use() 解包 params
  const unwrappedParams = React.use(params)
  const configId = unwrappedParams.configId
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [savedConfig, setSavedConfig] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("delivery")
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [car, setCar] = useState<any>(null)

  useEffect(() => {
    // 定义异步函数来加载数据
    const loadData = async () => {
      try {
        // 获取已保存的配置
        const config = await getSavedConfig(configId)
        if (!config) {
          return notFound()
        }

        setSavedConfig(config)
        setIsLoading(false)
      } catch (error) {
        console.error('加载配置数据失败:', error)
        toast({
          title: "加载失败",
          description: "无法加载配置数据，请稍后再试",
          variant: "destructive"
        })
      }
    }
    
    // 调用异步函数
    loadData()
  }, [configId, toast])

  useEffect(() => {
    if (savedConfig) {
      const loadCarData = async () => {
        const carData = await getCarById(savedConfig.carId)
        setCar(carData)
      }
      loadCarData()
    }
  }, [savedConfig])

  // 处理订单提交
  const handleSubmitOrder = async () => {
    setIsSubmitting(true)

    try {
      // 收集表单数据
      const deliveryInfo = savedConfig

      // 发送API请求
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configId,
          deliveryInfo,
          paymentMethod
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "订单提交成功",
          description: "您的订单已成功提交，我们将尽快处理",
        })

        // 跳转到订单确认页面
        router.push("/dashboard/user/orders")
      } else {
        throw new Error(data.error || '提交订单失败')
      }
    } catch (error) {
      console.error('提交订单失败:', error)
      toast({
        title: "提交失败",
        description: error instanceof Error ? error.message : "提交订单时发生错误，请稍后再试",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !savedConfig) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" className="mb-2 pl-0" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <h1 className="text-3xl font-bold">加载中...</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button variant="ghost" className="pl-0" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <h1 className="text-3xl font-bold">确认订单</h1>
        <p className="text-muted-foreground">请确认您的订单信息并完成支付</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>配置信息</CardTitle>
              <CardDescription>您选择的车型和配置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative h-40 w-full md:w-64 rounded-md overflow-hidden">
                  <CarImageViewer carId={savedConfig.carId} carColor={car?.defaultColor || "#000000"} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{savedConfig.carName}</h3>
                  <p className="text-muted-foreground">{car?.description}</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">配置ID: </span>
                      {savedConfig.id}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">保存日期: </span>
                      {savedConfig.date}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>交付与支付</CardTitle>
              <CardDescription>选择交付方式和支付方式</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="delivery">交付信息</TabsTrigger>
                  <TabsTrigger value="payment">支付方式</TabsTrigger>
                </TabsList>
                <TabsContent value="delivery" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input id="name" placeholder="请输入您的姓名" defaultValue="张先生" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">联系电话</Label>
                    <Input id="phone" placeholder="请输入您的联系电话" defaultValue="13800138000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">交付地址</Label>
                    <Input id="address" placeholder="请输入交付地址" defaultValue="上海市浦东新区张江高科技园区" />
                  </div>
                  <div className="space-y-2">
                    <Label>交付方式</Label>
                    <RadioGroup defaultValue="dealership">
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value="dealership" id="dealership" />
                        <Label htmlFor="dealership" className="flex items-center gap-2 cursor-pointer">
                          <Truck className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">经销商交付</div>
                            <div className="text-sm text-muted-foreground">在您选择的经销商处提车</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value="home" id="home" />
                        <Label htmlFor="home" className="flex items-center gap-2 cursor-pointer">
                          <Truck className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">送车上门</div>
                            <div className="text-sm text-muted-foreground">我们将车辆送到您指定的地址</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>预计交付时间</Label>
                    <div className="flex items-center gap-2 border rounded-md p-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium">2-4周</div>
                        <div className="text-sm text-muted-foreground">根据您的配置和库存情况</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="payment" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>支付方式</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label htmlFor="credit-card" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">信用卡支付</div>
                            <div className="text-sm text-muted-foreground">使用信用卡支付全款</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value="financing" id="financing" />
                        <Label htmlFor="financing" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">分期付款</div>
                            <div className="text-sm text-muted-foreground">选择分期付款方案</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                        <Label htmlFor="bank-transfer" className="flex items-center gap-2 cursor-pointer">
                          <CreditCard className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">银行转账</div>
                            <div className="text-sm text-muted-foreground">通过银行转账支付</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {paymentMethod === "credit-card" && (
                    <div className="space-y-4 border rounded-md p-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">卡号</Label>
                        <Input id="card-number" placeholder="请输入信用卡号" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">有效期</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">安全码</Label>
                          <Input id="cvc" placeholder="CVC" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name-on-card">持卡人姓名</Label>
                        <Input id="name-on-card" placeholder="请输入持卡人姓名" />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "financing" && (
                    <div className="space-y-4 border rounded-md p-4">
                      <div className="space-y-2">
                        <Label>分期方案</Label>
                        <RadioGroup defaultValue="12">
                          <div className="flex items-center space-x-2 border rounded-md p-3">
                            <RadioGroupItem value="12" id="months-12" />
                            <Label htmlFor="months-12" className="flex justify-between w-full cursor-pointer">
                              <span>12期</span>
                              <span className="font-medium">
                                ¥{Math.round(savedConfig.price / 12).toLocaleString()}/月
                              </span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3">
                            <RadioGroupItem value="24" id="months-24" />
                            <Label htmlFor="months-24" className="flex justify-between w-full cursor-pointer">
                              <span>24期</span>
                              <span className="font-medium">
                                ¥{Math.round(savedConfig.price / 24).toLocaleString()}/月
                              </span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3">
                            <RadioGroupItem value="36" id="months-36" />
                            <Label htmlFor="months-36" className="flex justify-between w-full cursor-pointer">
                              <span>36期</span>
                              <span className="font-medium">
                                ¥{Math.round(savedConfig.price / 36).toLocaleString()}/月
                              </span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="down-payment">首付款</Label>
                        <Input id="down-payment" defaultValue={Math.round(savedConfig.price * 0.3).toString()} />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "bank-transfer" && (
                    <div className="space-y-4 border rounded-md p-4">
                      <div className="space-y-1">
                        <div className="font-medium">银行账户信息</div>
                        <div className="text-sm">开户行: 中国银行上海分行</div>
                        <div className="text-sm">账户名: 豪华汽车销售有限公司</div>
                        <div className="text-sm">账号: 6225 8888 8888 8888</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        请在转账备注中注明您的订单号和姓名，我们将在收到款项后处理您的订单。
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>订单摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">车型价格</span>
                <span>¥{car?.basePrice.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">配置选项</span>
                <span>¥{(savedConfig.price - (car?.basePrice || 0)).toLocaleString()}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-medium">
                <span>总价</span>
                <span>¥{savedConfig.price.toLocaleString()}</span>
              </div>

              <div className="text-sm text-muted-foreground">*价格包含增值税和购置税</div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={handleSubmitOrder} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    处理中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    确认订单
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm space-y-2">
                <div className="font-medium">订单说明</div>
                <p className="text-muted-foreground">
                  确认订单后，我们将安排生产和交付。您可以随时在"我的订单"中查看订单状态。
                </p>
                <p className="text-muted-foreground">如有任何问题，请联系我们的客服：400-888-8888</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

