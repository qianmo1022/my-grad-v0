import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Order {
  id: string
  car: string
  date: string
  amount: string
  status: "pending" | "processing" | "completed" | "cancelled"
}

interface RecentOrdersProps {
  orders: Order[]
  userType: "user" | "dealer"
}

export default function RecentOrders({ orders, userType }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近订单</CardTitle>
        <CardDescription>{userType === "user" ? "您最近的订单记录" : "最近收到的客户订单"}</CardDescription>
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
                      order.status === "pending" && "bg-yellow-500 text-yellow-700",
                      order.status === "processing" && "bg-blue-500 text-blue-700",
                      order.status === "completed" && "bg-green-500 text-green-700",
                      order.status === "cancelled" && "bg-red-500 text-red-700",
                    )}
                  >
                    {order.status === "pending" && "待处理"}
                    {order.status === "processing" && "处理中"}
                    {order.status === "completed" && "已完成"}
                    {order.status === "cancelled" && "已取消"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    查看详情
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

