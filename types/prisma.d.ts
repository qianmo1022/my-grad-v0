import { PrismaClient } from '@prisma/client'

// 为Customer模型定义类型
interface CustomerModel {
  findMany: (args: any) => Promise<any[]>
  findUnique: (args: any) => Promise<any | null>
  create: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
  delete: (args: any) => Promise<any>
  count: (args: any) => Promise<number>
}

// 为SalesData模型定义类型
interface SalesDataModel {
  findMany: (args: any) => Promise<any[]>
  findUnique: (args: any) => Promise<any | null>
  create: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
  delete: (args: any) => Promise<any>
  count: (args: any) => Promise<number>
}

// 扩展PrismaClient类型
declare global {
  namespace PrismaClient {
    interface PrismaClient {
      customer: CustomerModel
      salesData: SalesDataModel
    }
  }
}

// 扩展Dealer模型类型
declare module '@prisma/client' {
  interface Dealer {
    businessName?: string
    logo?: string
    address?: string
    city?: string
    province?: string
    postalCode?: string
    businessHours?: string
    description?: string
  }
} 