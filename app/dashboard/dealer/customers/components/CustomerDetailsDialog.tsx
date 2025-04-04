"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MailIcon, PhoneIcon, UserIcon } from "lucide-react";

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderNumber: number;
  totalSpent: string;
  lastOrder: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  orders: OrderHistory[];
}

interface OrderHistory {
  id: string;
  car: string;
  carImage?: string;
  date: string;
  amount: number;
  formattedAmount: string;
  status: string;
}

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerDetail | null;
  onViewAllOrders?: () => void;
}

export default function CustomerDetailsDialog({
  open,
  onOpenChange,
  customer,
  onViewAllOrders,
}: CustomerDetailsDialogProps) {
  if (!customer) return null;
  
  // 确保orders是一个数组
  const orders = Array.isArray(customer.orders) ? customer.orders : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>客户详情</DialogTitle>
          <DialogDescription>查看客户的详细信息和统计数据</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 客户基本信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl">
                    {customer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{customer.name}</h3>
                  <Badge
                    variant={customer.status === "active" ? "default" : "secondary"}
                  >
                    {customer.status === "active" ? "活跃" : "非活跃"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center text-sm">
                    <PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>创建于 {customer.createdAt}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>更新于 {customer.updatedAt}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 客户统计数据卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>消费统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">订单总数</p>
                  <p className="text-2xl font-bold">{customer.orderNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">消费总额</p>
                  <p className="text-2xl font-bold">{customer.totalSpent}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">最近订单</p>
                <p>{customer.lastOrder || "暂无订单"}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onViewAllOrders}
                disabled={!onViewAllOrders || customer.orderNumber === 0}
              >
                查看所有订单
              </Button>
            </CardFooter>
          </Card>

          {/* 最近订单列表 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>最近订单</CardTitle>
              <CardDescription>显示最近的 3 笔订单</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => {
                    // 确保每个订单字段格式正确
                    const orderId = typeof order.id === 'string' ? order.id : `order-${Math.random().toString(36).substr(2, 9)}`;
                    const carName = typeof order.car === 'string' ? order.car : '未知车型';
                    const orderDate = typeof order.date === 'string' ? order.date : '未知日期';
                    const formattedAmount = typeof order.formattedAmount === 'string' ? order.formattedAmount : 
                                            (typeof order.amount === 'number' ? `¥${order.amount}` : '¥0');
                    const orderStatus = typeof order.status === 'string' ? order.status : 'pending';
                    
                    return (
                      <div
                        key={orderId}
                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                            {order.carImage ? (
                              <img
                                src={order.carImage}
                                alt={carName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{carName}</p>
                            <p className="text-sm text-muted-foreground">
                              {orderDate}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formattedAmount}</p>
                          <Badge
                            variant={
                              orderStatus === "completed"
                                ? "default"
                                : "secondary"
                            }
                            className="mt-1"
                          >
                            {orderStatus === "pending"
                              ? "待处理"
                              : orderStatus === "processing"
                              ? "处理中"
                              : "已完成"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground">该客户暂无订单记录</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 