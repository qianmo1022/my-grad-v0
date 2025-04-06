"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ChevronLeft, Save, XCircle, PlusCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard/layout"
import CarFeaturesForm from "@/components/dashboard/dealer/car-features-form"
import CarOptionsForm from "@/components/dashboard/dealer/car-options-form"

// 表单验证schema
const carFormSchema = z.object({
  name: z.string().min(2, { message: "车型名称至少需要2个字符" }),
  basePrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "请输入有效的价格",
  }),
  description: z.string().min(10, { message: "描述至少需要10个字符" }),
  thumbnail: z.string().url({ message: "请输入有效的图片URL" }),
  defaultColor: z.string().min(1, { message: "请输入默认颜色" }),
});

export default function NewCarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  const [isFormComplete, setIsFormComplete] = useState({
    basic: false,
    features: false,
    options: false,
  });

  // 创建表单
  const form = useForm<z.infer<typeof carFormSchema>>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      name: "",
      basePrice: "",
      description: "",
      thumbnail: "",
      defaultColor: "",
    },
  });

  // 当基本信息表单完成时
  const onBasicInfoComplete = (values: z.infer<typeof carFormSchema>) => {
    setIsFormComplete(prev => ({ ...prev, basic: true }));
    setCurrentTab("features");
    
    // 将默认颜色保存到sessionStorage，以便在配置选项步骤中使用
    const defaultColor = values.defaultColor;
    sessionStorage.setItem('defaultCarColor', defaultColor);
    
    toast({
      title: "基本信息已保存",
      description: "请继续完成车型特性设置",
    });
  };

  // 当车型特性完成时
  const onFeaturesComplete = () => {
    setIsFormComplete(prev => ({ ...prev, features: true }));
    setCurrentTab("options");
    toast({
      title: "车型特性已保存",
      description: "请继续完成配置选项设置",
    });
  };

  // 提交整个表单
  const onSubmit = async () => {
    if (!isFormComplete.basic || !isFormComplete.features || !isFormComplete.options) {
      toast({
        title: "表单未完成",
        description: "请先完成所有必要的信息设置",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 创建车型的API调用
      const response = await fetch("/api/dealer/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form.getValues(),
          basePrice: parseFloat(form.getValues().basePrice),
          status: "draft" // 新建车型默认为草稿状态
        }),
      });

      if (!response.ok) {
        throw new Error("创建车型失败");
      }

      const data = await response.json();
      const carId = data.car.id;
      let hasErrors = false;

      // 应用车型特性
      const pendingFeaturesStr = sessionStorage.getItem('pendingCarFeatures');
      if (pendingFeaturesStr) {
        try {
          const features = JSON.parse(pendingFeaturesStr);
          
          // 保存特性
          const featuresResponse = await fetch(`/api/dealer/cars/${carId}/features`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(features),
          });
          
          if (!featuresResponse.ok) {
            console.error("应用车型特性失败");
            hasErrors = true;
          }
          
          // 清除特性临时数据
          sessionStorage.removeItem('pendingCarFeatures');
        } catch (featuresError) {
          console.error("处理车型特性时出错:", featuresError);
          hasErrors = true;
        }
      }

      // 应用配置选项
      const pendingConfigStr = sessionStorage.getItem('pendingCarConfig');
      if (pendingConfigStr) {
        try {
          const pendingConfig = JSON.parse(pendingConfigStr);
          
          // 将配置选项应用到新车型
          if (pendingConfig.options && pendingConfig.options.length > 0) {
            const options = pendingConfig.options.map((option: any) => {
              // 确保每个选项都有正确的carId和categoryId
              if (!option.categoryId && pendingConfig.categories) {
                // 如果没有categoryId，尝试从categories中找到对应的分类
                const categoryKey = option.categoryKey || option.optionKey.split('-')[0];
                const category = pendingConfig.categories.find(
                  (c: any) => c.categoryKey === categoryKey
                );
                if (category) {
                  return {
                    ...option,
                    carId: carId,
                    categoryId: category.id
                  };
                }
              }
              
              return {
                ...option,
                carId: carId,
              };
            });
            
            // 保存配置选项
            const optionsResponse = await fetch(`/api/dealer/cars/${carId}/config-options`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(options),
            });
            
            if (!optionsResponse.ok) {
              console.error("应用配置选项失败");
              hasErrors = true;
            }
          }
          
          // 清除配置临时数据
          sessionStorage.removeItem('pendingCarConfig');
        } catch (configError) {
          console.error("处理配置选项时出错:", configError);
          hasErrors = true;
        }
      }

      if (hasErrors) {
        toast({
          title: "部分操作失败",
          description: "车型已创建，但部分配置应用失败，请稍后在编辑页面中完成配置",
          variant: "destructive",
        });
      } else {
        toast({
          title: "车型创建成功",
          description: "新车型已成功创建为草稿状态",
        });
      }

      // 跳转到车型列表页
      router.push("/dashboard/dealer/cars");
    } catch (error) {
      console.error("创建车型错误:", error);
      toast({
        title: "创建失败",
        description: "创建车型时发生错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout userType="dealer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/dashboard/dealer/cars">
              <Button variant="ghost" className="pl-0">
                <ChevronLeft className="mr-2 h-4 w-4" />
                返回车型列表
              </Button>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">添加新车型</h2>
            <p className="text-muted-foreground">创建新的车型并设置相关配置</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/dealer/cars")}>
              <XCircle className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button 
              onClick={onSubmit} 
              disabled={isSubmitting || !isFormComplete.basic || !isFormComplete.features || !isFormComplete.options}
            >
              {isSubmitting ? "保存中..." : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  保存为草稿
                </>
              )}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>车型信息</CardTitle>
            <CardDescription>请完成以下所有设置后保存车型</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex gap-4 mb-2">
                <div className={`flex items-center ${isFormComplete.basic ? 'text-green-600' : ''}`}>
                  {isFormComplete.basic ? <Check size={16} className="mr-1" /> : <span className="font-medium mr-1">1.</span>}
                  基本信息
                </div>
                <div className={`flex items-center ${isFormComplete.features ? 'text-green-600' : ''}`}>
                  {isFormComplete.features ? <Check size={16} className="mr-1" /> : <span className="font-medium mr-1">2.</span>}
                  车型特性
                </div>
                <div className={`flex items-center ${isFormComplete.options ? 'text-green-600' : ''}`}>
                  {isFormComplete.options ? <Check size={16} className="mr-1" /> : <span className="font-medium mr-1">3.</span>}
                  配置选项
                </div>
              </div>
              <Separator />
            </div>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="features" disabled={!isFormComplete.basic}>车型特性</TabsTrigger>
                <TabsTrigger value="options" disabled={!isFormComplete.features}>配置选项</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic">
                <div className="space-y-6 py-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onBasicInfoComplete)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>车型名称</FormLabel>
                            <FormControl>
                              <Input placeholder="输入车型名称" {...field} />
                            </FormControl>
                            <FormDescription>
                              车型的完整名称，例如"奔驰 S600"
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="basePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>基础价格</FormLabel>
                            <FormControl>
                              <Input placeholder="输入基础价格" {...field} />
                            </FormControl>
                            <FormDescription>
                              不含任何选装配置的基础价格
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>车型描述</FormLabel>
                            <FormControl>
                              <Textarea placeholder="输入车型描述" {...field} rows={4} />
                            </FormControl>
                            <FormDescription>
                              简要描述车型的特点和亮点
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="thumbnail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>缩略图URL</FormLabel>
                            <FormControl>
                              <Input placeholder="输入缩略图URL" {...field} />
                            </FormControl>
                            <FormDescription>
                              车型的主要展示图片URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="defaultColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>默认颜色</FormLabel>
                            <FormControl>
                              <Input placeholder="输入默认颜色" {...field} />
                            </FormControl>
                            <FormDescription>
                              默认展示的车身颜色
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        下一步: 添加车型特性
                        <PlusCircle className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>
              
              <TabsContent value="features">
                <div className="space-y-6 py-4">
                  <h3 className="text-lg font-medium">添加车型特性</h3>
                  <p className="text-muted-foreground">为车型添加性能、操控、舒适度等特性评分</p>
                  
                  <CarFeaturesForm 
                    onComplete={onFeaturesComplete}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="options">
                <div className="space-y-6 py-4">
                  <h3 className="text-lg font-medium">添加配置选项</h3>
                  <p className="text-muted-foreground">为车型添加颜色、轮毂、内饰等配置选项</p>
                  
                  <CarOptionsForm 
                    onComplete={() => setIsFormComplete(prev => ({ ...prev, options: true }))}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between bg-muted/20">
            <p className="text-sm text-muted-foreground">完成所有设置后，车型将保存为草稿状态</p>
            <p className="text-sm text-muted-foreground">审核通过后才能上线显示</p>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}