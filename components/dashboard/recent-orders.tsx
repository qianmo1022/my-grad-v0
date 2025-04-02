"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Order {
  id: string;
  car: string;
  date: string;
  amount: string;
  status: "pending" | "processing" | "completed" | "cancelled";
}

type ActionType = "cancel" | "accept" | "complete";

interface RecentOrdersProps {
  orders: Order[];
  userType: "user" | "dealer";
}

export default function RecentOrders({ orders, userType }: RecentOrdersProps) {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 处理订单状态更新
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    setIsLoading(true);
    try {
      // 这里应该调用实际的API
      const endpoint =
        userType === "user"
          ? `/api/user/orders/${orderId}/status`
          : `/api/dealer/orders/${orderId}/status`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("更新订单状态失败");
      }

      // 模拟成功响应
      toast({
        title: "操作成功",
        description: getSuccessMessage(newStatus),
      });

      // 在实际应用中，这里应该刷新订单列表
      // 由于这是演示，我们可以通过页面刷新来模拟
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("更新订单状态错误:", error);
      toast({
        title: "操作失败",
        description: "无法更新订单状态，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  // 获取成功消息
  const getSuccessMessage = (status: Order["status"]) => {
    switch (status) {
      case "cancelled":
        return "订单已成功取消";
      case "processing":
        return "订单已接受，正在处理中";
      case "completed":
        return "订单已完成";
      default:
        return "订单状态已更新";
    }
  };

  // 打开确认对话框
  const openConfirmDialog = (order: Order, action: ActionType) => {
    setSelectedOrder(order);
    setActionType(action);
    setIsDialogOpen(true);
  };

  // 确认操作
  const confirmAction = () => {
    if (!selectedOrder || !actionType) return;

    let newStatus: Order["status"];
    switch (actionType) {
      case "cancel":
        newStatus = "cancelled";
        break;
      case "accept":
        newStatus = "processing";
        break;
      case "complete":
        newStatus = "completed";
        break;
      default:
        return;
    }

    handleUpdateOrderStatus(selectedOrder.id, newStatus);
  };

  // 获取对话框标题
  const getDialogTitle = () => {
    if (!actionType) return "";

    switch (actionType) {
      case "cancel":
        return "确认取消订单";
      case "accept":
        return "确认接受订单";
      case "complete":
        return "确认完成订单";
      default:
        return "确认操作";
    }
  };

  // 获取对话框描述
  const getDialogDescription = () => {
    if (!selectedOrder || !actionType) return "";

    switch (actionType) {
      case "cancel":
        return `您确定要取消订单 ${selectedOrder.id} 吗？此操作无法撤销。`;
      case "accept":
        return `您确定要接受订单 ${selectedOrder.id} 吗？接受后将开始处理该订单。`;
      case "complete":
        return `您确定要将订单 ${selectedOrder.id} 标记为已完成吗？`;
      default:
        return "请确认您的操作";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近订单</CardTitle>
        <CardDescription>
          {userType === "user" ? "您最近的订单记录" : "最近收到的客户订单"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单编号</TableHead>
              <TableHead>车型</TableHead>
              <TableHead>日期</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.car}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "bg-opacity-10 border-0",
                      order.status === "pending" &&
                        "bg-yellow-500 text-yellow-700",
                      order.status === "processing" &&
                        "bg-blue-500 text-blue-700",
                      order.status === "completed" &&
                        "bg-green-500 text-green-700",
                      order.status === "cancelled" && "bg-red-500 text-red-700"
                    )}
                  >
                    {order.status === "pending" && "待处理"}
                    {order.status === "processing" && "处理中"}
                    {order.status === "completed" && "已完成"}
                    {order.status === "cancelled" && "已取消"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* 用户操作按钮 */}
                    {userType === "user" && (
                      <>
                        {(order.status === "pending" ||
                          order.status === "processing") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => openConfirmDialog(order, "cancel")}
                          >
                            取消订单
                          </Button>
                        )}
                      </>
                    )}

                    {/* 商家操作按钮 */}
                    {userType === "dealer" && (
                      <>
                        {order.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-500 hover:bg-blue-50"
                            onClick={() => openConfirmDialog(order, "accept")}
                          >
                            接受订单
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-500 hover:bg-green-50"
                            onClick={() => openConfirmDialog(order, "complete")}
                          >
                            完成订单
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>{" "}
      {/* 确认对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>{getDialogDescription()}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button onClick={confirmAction} disabled={isLoading}>
              {isLoading ? "处理中..." : "确认"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
