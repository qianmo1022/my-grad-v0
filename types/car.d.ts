// 车型状态类型定义
export type CarStatus = 'active' | 'draft' | 'archived';

// 扩展Prisma的Car模型类型
declare module '@prisma/client' {
  interface Car {
    status: string; // active, draft, archived
  }
}