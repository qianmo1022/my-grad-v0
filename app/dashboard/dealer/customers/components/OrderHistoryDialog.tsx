"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderHistory {
  id: string;
  car: string;
  carImage?: string;
  date: string;
  amount: number;
  formattedAmount: string;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orderNumber: number;
  totalSpent: string;
  lastOrder: string;
  status: "active" | "inactive";
}

interface OrderHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  orders: OrderHistory[];
}

export default function OrderHistoryDialog({
  open,
  onOpenChange,
  customer,
  orders: rawOrders,
}: OrderHistoryDialogProps) {
  if (!customer) return null;
  
  // 确保 orders 是一个数组并且每个订单数据格式正确
  const orders = Array.isArray(rawOrders) 
    ? rawOrders.map(order => {
        return {
          id: typeof order.id === 'string' ? order.id : `order-${Math.random().toString(36).substr(2, 9)}`,
          car: typeof order.car === 'string' ? order.car : '未知车型',
          date: typeof order.date === 'string' ? order.date : '未知日期',
          amount: typeof order.amount === 'number' ? order.amount : 0,
          formattedAmount: typeof order.formattedAmount === 'string' ? order.formattedAmount : 
                           (typeof order.amount === 'number' ? `¥${order.amount}` : '¥0'),
          status: typeof order.status === 'string' ? order.status : 'pending'
        };
      })
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>订单历史</DialogTitle>
          <DialogDescription>{customer.name} 的所有订单记录</DialogDescription>
        </DialogHeader>

        {orders.length > 0 ? (
          <div className="space-y-4">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">全部订单</TabsTrigger>
                <TabsTrigger value="pending">待处理</TabsTrigger>
                <TabsTrigger value="processing">处理中</TabsTrigger>
                <TabsTrigger value="completed">已完成</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>车型</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.car}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.formattedAmount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.status === "pending"
                              ? "待处理"
                              : order.status === "processing"
                              ? "处理中"
                              : "已完成"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="pending" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>车型</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter((order) => order.status === "pending")
                      .map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.car}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>{order.formattedAmount}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">待处理</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {orders.filter((order) => order.status === "pending").length ===
                  0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    暂无待处理订单
                  </div>
                )}
              </TabsContent>

              <TabsContent value="processing" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>车型</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter((order) => order.status === "processing")
                      .map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.car}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>{order.formattedAmount}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">处理中</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {orders.filter((order) => order.status === "processing")
                  .length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    暂无处理中订单
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>车型</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter((order) => order.status === "completed")
                      .map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.car}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>{order.formattedAmount}</TableCell>
                          <TableCell>
                            <Badge>已完成</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {orders.filter((order) => order.status === "completed").length ===
                  0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    暂无已完成订单
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">该客户暂无订单记录</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 