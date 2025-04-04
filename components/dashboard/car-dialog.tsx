"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// 车型表单验证模式
const carFormSchema = z.object({
  name: z.string().min(2, { message: "车型名称至少需要2个字符" }),
  basePrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "请输入有效的价格",
  }),
  thumbnail: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]),
});

export interface Car {
  id: string;
  name: string;
  thumbnail: string;
  basePrice: string;
  status: "active" | "draft" | "archived";
  sales: number;
}

interface CarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: Car | null;
  onSuccess: () => void;
}

export default function CarDialog({
  open,
  onOpenChange,
  car,
  onSuccess,
}: CarDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!car;

  // 表单定义
  const form = useForm<z.infer<typeof carFormSchema>>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      name: "",
      basePrice: "",
      thumbnail: "/placeholder.svg",
      status: "draft" as const,
    },
  });

  // 当选中车型变化时，更新表单默认值
  useEffect(() => {
    if (car && open) {
      form.reset({
        name: car.name,
        basePrice: car.basePrice.replace(/[^0-9]/g, ""), // 移除非数字字符
        thumbnail: car.thumbnail,
        status: car.status,
      });
    } else if (!car && open) {
      // 添加新车型时重置表单
      form.reset({
        name: "",
        basePrice: "",
        thumbnail: "/placeholder.svg",
        status: "draft",
      });
    }
  }, [car, open, form]);

  // 提交表单
  const onSubmit = async (values: z.infer<typeof carFormSchema>) => {
    try {
      setIsSubmitting(true);
      
      // 构建请求数据
      const carData = {
        ...values,
        basePrice: Number(values.basePrice),
      };

      // 根据是编辑还是新增选择不同的API端点和方法
      const url = isEditing ? `/api/dealer/cars/${car?.id}` : '/api/dealer/cars';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
      });

      if (!response.ok) {
        throw new Error('操作失败');
      }

      // 成功提示
      toast({
        title: isEditing ? "车型已更新" : "车型已添加",
        description: isEditing ? "车型信息已成功更新" : "新车型已成功添加到系统",
      });

      // 关闭对话框并刷新数据
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('车型操作失败:', error);
      toast({
        title: "操作失败",
        description: `${isEditing ? '更新' : '添加'}车型时发生错误，请重试`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "编辑车型" : "添加新车型"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "更新车型信息和状态" : "添加新车型到您的产品目录"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>车型名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入车型名称" {...field} />
                  </FormControl>
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
                    <Input 
                      placeholder="输入基础价格" 
                      type="number" 
                      min="0" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>输入不含千分位分隔符的价格数字</FormDescription>
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
                    <Input 
                      placeholder="输入图片URL" 
                      {...field} 
                      value={field.value || "/placeholder.svg"}
                    />
                  </FormControl>
                  <FormDescription>输入车型图片的URL地址</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>状态</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择车型状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">已上线</SelectItem>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="archived">已归档</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    已上线的车型将显示在客户可见的页面中
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : isEditing ? "更新车型" : "添加车型"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}