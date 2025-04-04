"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Search,
  Mail,
  Phone,
  Download,
  Filter,
  User,
  FileText,
  Edit,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CustomerDetailsDialog, OrderHistoryDialog, EditCustomerDialog } from "./components";
import * as z from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface CustomerDetail extends Customer {
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

// 客户表单验证模式
const customerFormSchema = z.object({
  name: z.string().min(2, { message: "姓名至少需要2个字符" }),
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export default function DealerCustomers() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 对话框状态
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 当前选中的客户
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(
    null
  );
  const [customerOrders, setCustomerOrders] = useState<OrderHistory[]>([]);

  // 获取客户数据
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setIsLoading(true);

        // 调用API获取客户数据
        const response = await fetch("/api/dealer/customers");
        if (!response.ok) {
          throw new Error("获取客户数据失败");
        }

        const data = await response.json();
        
        // 确保客户数据格式正确
        const formattedCustomers = data.customers.map((customer: any) => ({
          id: customer.id || '',
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          orderNumber: typeof customer.orderNumber === 'number' ? customer.orderNumber : 
                      (typeof customer.orders === 'number' ? customer.orders : 0),
          totalSpent: typeof customer.totalSpent === 'string' ? customer.totalSpent : 
                     (typeof customer.totalSpent === 'number' ? `¥${customer.totalSpent}` : '¥0'),
          lastOrder: customer.lastOrderDate || customer.lastOrder || '',
          status: customer.status || 'inactive',
        }));
        
        setCustomers(formattedCustomers);
        setFilteredCustomers(formattedCustomers);
        setIsLoading(false);
      } catch (error) {
        console.error("获取客户数据失败:", error);
        toast({
          title: "获取数据失败",
          description: "无法加载客户数据，请稍后重试",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }

    fetchCustomers();
  }, [toast]);

  // 搜索和筛选功能
  useEffect(() => {
    let result = customers;

    // 应用搜索过滤
    if (searchTerm) {
      result = result.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
      );
    }

    // 应用状态过滤
    if (statusFilter !== "all") {
      result = result.filter((customer) => customer.status === statusFilter);
    }

    setFilteredCustomers(result);
  }, [customers, searchTerm, statusFilter]);

  // 处理搜索输入
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 处理状态筛选
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  // 导出客户数据
  const exportCustomers = async () => {
    try {
      // 构建导出URL，包含当前的筛选条件
      let exportUrl = "/api/dealer/customers/export";
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (params.toString()) {
        exportUrl += `?${params.toString()}`;
      }

      // 使用window.open触发文件下载
      window.open(exportUrl, "_blank");

      toast({
        title: "导出成功",
        description: "客户数据已成功导出为CSV文件",
      });
    } catch (error) {
      console.error("导出客户数据失败:", error);
      toast({
        title: "导出失败",
        description: "无法导出客户数据，请稍后重试",
        variant: "destructive",
      });
    }
  };

  // 发送邮件给客户
  const sendEmail = (customer: Customer) => {
    toast({
      title: "发送邮件",
      description: `已打开邮件编辑器，收件人: ${customer.email}`,
    });
    // 可以打开邮件应用或使用第三方服务
    window.open(`mailto:${customer.email}`);
  };

  // 拨打电话
  const callCustomer = (customer: Customer) => {
    toast({
      title: "拨打电话",
      description: `正在拨打 ${customer.phone}`,
    });
    // 实际可以使用tel链接或集成第三方通话服务
    window.open(`tel:${customer.phone}`);
  };

  // 查看客户详情
  const viewCustomerDetails = async (customer: Customer) => {
    try {
      setSelectedCustomer(customer);
      setIsLoading(true);

      const response = await fetch(`/api/dealer/customers/${customer.id}`);
      if (!response.ok) {
        throw new Error("获取客户详情失败");
      }

      const rawData = await response.json();
      
      // 确保数据格式正确
      const data: CustomerDetail = {
        id: rawData.id || '',
        name: rawData.name || '',
        email: rawData.email || '',
        phone: rawData.phone || '',
        orderNumber: typeof rawData.orderNumber === 'number' ? rawData.orderNumber : 
                    (Array.isArray(rawData.orders) ? rawData.orders.length : 0),
        totalSpent: typeof rawData.totalSpent === 'string' ? rawData.totalSpent : 
                   (typeof rawData.totalSpent === 'number' ? `¥${rawData.totalSpent}` : '¥0'),
        lastOrder: rawData.lastOrderDate || '',
        status: rawData.status || 'inactive',
        createdAt: typeof rawData.createdAt === 'string' ? rawData.createdAt : '未知',
        updatedAt: typeof rawData.updatedAt === 'string' ? rawData.updatedAt : '未知',
        orders: Array.isArray(rawData.orders) ? rawData.orders.map((order: any) => ({
          id: order.id || `order-${Math.random().toString(36).substr(2, 9)}`,
          car: order.car || '未知车型',
          date: order.date || '未知日期',
          amount: typeof order.amount === 'number' ? order.amount : 0,
          formattedAmount: order.formattedAmount || `¥${order.amount || 0}`,
          status: order.status || 'pending'
        })) : []
      };
      
      setCustomerDetail(data);
      setDetailsOpen(true);
    } catch (error) {
      console.error("获取客户详情失败:", error);
      toast({
        title: "获取详情失败",
        description: "无法加载客户详情，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 查看订单历史
  const viewOrderHistory = async (customer: Customer) => {
    try {
      // 创建一个符合新接口定义的customer对象
      const updatedCustomer: Customer = {
        ...customer,
        // 确保字段名称与新的接口一致
        orderNumber: customer.orderNumber
      };
      
      setSelectedCustomer(updatedCustomer);
      setIsLoading(true);

      const response = await fetch(
        `/api/dealer/customers/${customer.id}/orders`
      );
      if (!response.ok) {
        throw new Error("获取订单历史失败");
      }

      const rawData = await response.json();
      
      // 确保返回的数据是格式正确的数组
      let orders: OrderHistory[] = [];
      
      if (Array.isArray(rawData)) {
        // 处理订单数据，保证格式正确
        orders = rawData.map((order: any) => {
          return {
            id: typeof order.id === 'string' ? order.id : `order-${Math.random().toString(36).substr(2, 9)}`,
            car: typeof order.car === 'string' ? order.car : '未知车型',
            date: typeof order.date === 'string' ? order.date : '未知日期',
            amount: typeof order.amount === 'number' ? order.amount : 0,
            formattedAmount: typeof order.formattedAmount === 'string' ? order.formattedAmount : `¥${order.amount || 0}`,
            status: typeof order.status === 'string' ? order.status : 'pending'
          };
        });
      }
      
      setCustomerOrders(orders);
      setOrderHistoryOpen(true);
    } catch (error) {
      console.error("获取订单历史失败:", error);
      toast({
        title: "获取订单失败",
        description: "无法加载客户订单历史，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 编辑客户信息
  const editCustomer = (customer: Customer) => {
    // 创建一个符合新接口定义的customer对象
    const updatedCustomer: Customer = {
      ...customer,
      // 确保字段名称与新的接口一致
      orderNumber: customer.orderNumber
    };
    
    setSelectedCustomer(updatedCustomer);
    setEditOpen(true);
  };

  // 提交编辑表单
  const handleSaveCustomer = async (values: z.infer<typeof customerFormSchema>) => {
    if (!selectedCustomer) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/dealer/customers/${selectedCustomer.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "更新客户信息失败");
      }

      const data = await response.json();

      // 更新本地客户列表
      setCustomers((prevCustomers) =>
        prevCustomers.map((c) =>
          c.id === selectedCustomer.id
            ? {
                ...c,
                name: values.name,
                email: values.email,
                phone: values.phone || "",
                status: values.status,
              }
            : c
        )
      );

      toast({
        title: "更新成功",
        description: "客户信息已成功更新",
      });

      setEditOpen(false);
    } catch (error) {
      console.error("更新客户信息失败:", error);
      toast({
        title: "更新失败",
        description:
          error instanceof Error
            ? error.message
            : "无法更新客户信息，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 查看所有订单按钮点击处理
  const handleViewAllOrders = () => {
    if (customerDetail) {
      // 使用客户详情中的客户信息和订单数据
      setSelectedCustomer(customerDetail);
      // 直接使用客户详情中已加载的订单数据，而不是之前加载的订单数据
      setCustomerOrders(customerDetail.orders);
      setOrderHistoryOpen(true);
    }
  };

  return (
    <DashboardLayout userType="dealer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">客户管理</h2>
            <p className="text-muted-foreground">管理和查看您的所有客户信息</p>
          </div>
          <Button onClick={exportCustomers}>
            <Download className="h-4 w-4 mr-2" />
            导出客户数据
          </Button>
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索客户名称、邮箱或电话..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>客户状态</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusFilter("all")}>
                所有客户
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("active")}>
                活跃客户
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusFilter("inactive")}>
                非活跃客户
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>客户列表</CardTitle>
            <CardDescription>
              当前共有 {filteredCustomers.length} 位客户{" "}
              {statusFilter !== "all" &&
                `(${statusFilter === "active" ? "活跃" : "非活跃"})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">加载客户数据中...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">客户姓名</TableHead>
                    <TableHead>订单数</TableHead>
                    <TableHead>消费总额</TableHead>
                    <TableHead>最近订单</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {customer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{customer.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.orderNumber}</TableCell>
                      <TableCell>{customer.totalSpent}</TableCell>
                      <TableCell>{customer.lastOrder}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {customer.status === "active" ? "活跃" : "非活跃"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => sendEmail(customer)}
                            title="发送邮件"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => callCustomer(customer)}
                            title="拨打电话"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => viewCustomerDetails(customer)}
                            >
                              <User className="h-4 w-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => viewOrderHistory(customer)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              查看订单历史
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => editCustomer(customer)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              编辑客户信息
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 客户详情对话框 */}
      <CustomerDetailsDialog 
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        customer={customerDetail}
        onViewAllOrders={handleViewAllOrders}
      />

      {/* 订单历史对话框 */}
      <OrderHistoryDialog
        open={orderHistoryOpen}
        onOpenChange={setOrderHistoryOpen}
        customer={selectedCustomer}
        orders={customerOrders}
      />

      {/* 编辑客户信息对话框 */}
      <EditCustomerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
        isSubmitting={isSubmitting}
      />
    </DashboardLayout>
  );
}
