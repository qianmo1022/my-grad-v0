import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// 导出客户数据为CSV
export async function GET(request: Request) {
  try {
    // 获取会话，验证商家身份
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }
    
    const dealerId = session.user.id
    
    // 查询参数
    const url = new URL(request.url)
    const searchTerm = url.searchParams.get('search') || ''
    const statusFilter = url.searchParams.get('status') || 'all'

    // 构建查询条件
    let whereCondition: any = { dealerId }

    if (searchTerm) {
      whereCondition.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm } },
      ]
    }

    if (statusFilter !== 'all') {
      whereCondition.status = statusFilter
    }

    // 查询客户数据
    const customers = await prisma.customer.findMany({
      where: whereCondition,
      include: {
        orders: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastOrderDate: 'desc' },
    })

    // 格式化数据为CSV
    const headers = ['姓名', '邮箱', '电话', '订单数', '消费总额', '最近订单', '状态']
    
    const rows = customers.map(customer => {
      const totalOrders = customer.orders.length
      const lastOrder = customer.lastOrderDate 
        ? new Date(customer.lastOrderDate).toISOString().split('T')[0]
        : '-'
      
      return [
        customer.name,
        customer.email,
        customer.phone || '',
        totalOrders.toString(),
        customer.totalSpent.toString(),
        lastOrder,
        customer.status === 'active' ? '活跃' : '非活跃'
      ]
    })
    
    // 生成CSV内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    // 设置响应头，使浏览器下载文件
    const headers_response = new Headers()
    headers_response.set('Content-Type', 'text/csv; charset=utf-8')
    headers_response.set('Content-Disposition', 'attachment; filename=customers.csv')
    
    return new NextResponse(csvContent, {
      status: 200,
      headers: headers_response
    })
  } catch (error) {
    console.error('导出客户数据失败:', error)
    return NextResponse.json(
      { error: '导出客户数据失败' },
      { status: 500 }
    )
  }
}