"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, Mail, Phone, Download, Filter } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  orders: number
  totalSpent: string
  lastOrder: string
  status: "active" | "inactive"
}

export default function DealerCustomers() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // 获取客户数据
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setIsLoading(true)
        
        // 调用API获取客户数据
        const response = await fetch('/api/dealer/customers')
        if (!response.ok) {
          throw new Error('获取客户数据失败')
        }
        
        const data = await response.json()
        setCustomers(data.customers)
        setFilteredCustomers(data.customers)
        setIsLoading(false)
      } catch (error) {
        console.error("获取客户数据失败:", error)
        toast({
          title: "获取数据失败",
          description: "无法加载客户数据，请稍后重试",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [toast])

  // 搜索和筛选功能
  useEffect(() => {
    let result = customers
    
    // 应用搜索过滤
    if (searchTerm) {
      result = result.filter(
        customer => 
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
      )
    }
    
    // 应用状态过滤
    if (statusFilter !== "all") {
      result = result.filter(customer => customer.status === statusFilter)
    }
    
    setFilteredCustomers(result)
  }, [customers, searchTerm, statusFilter])

  // 处理搜索输入
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // 处理状态筛选
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
  }

  // 导出客户数据
  const exportCustomers = () => {
    toast({
      title: "导出成功",
      description: "客户数据已成功导出为CSV文件",
    })
    // 实际导出功能可以使用API或前端库
  }

  // 发送邮件给客户
  const sendEmail = (customer: Customer) => {
    toast({
      title: "发送邮件",
      description: `已打开邮件编辑器，收件人: ${customer.email}`,
    })
    // 可以打开邮件应用或使用第三方服务
    window.open(`mailto:${customer.email}`)
  }

  // 拨打电话
  const callCustomer = (customer: Customer) => {
    toast({
      title: "拨打电话",
      description: `正在拨打 ${customer.phone}`,
    })
    // 实际可以使用tel链接或集成第三方通话服务
    window.open(`tel:${customer.phone}`)
  }

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
              当前共有 {filteredCustomers.length} 位客户 {statusFilter !== "all" && `(${statusFilter === "active" ? "活跃" : "非活跃"})`}
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
                            <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{customer.name}</div>
                            <div className="text-xs text-muted-foreground">{customer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.orders}</TableCell>
                      <TableCell>{customer.totalSpent}</TableCell>
                      <TableCell>{customer.lastOrder}</TableCell>
                      <TableCell>
                        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                          {customer.status === "active" ? "活跃" : "非活跃"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => sendEmail(customer)} title="发送邮件">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => callCustomer(customer)} title="拨打电话">
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
                            <DropdownMenuItem>查看详情</DropdownMenuItem>
                            <DropdownMenuItem>查看订单历史</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>编辑客户信息</DropdownMenuItem>
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
    </DashboardLayout>
  )
} 