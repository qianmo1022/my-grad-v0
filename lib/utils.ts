import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化数字，添加千位分隔符
export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN')
}

// 格式化金额，添加人民币符号和千位分隔符
export function formatCurrency(value: number): string {
  return `¥${value.toLocaleString('zh-CN')}`
}

// 格式化百分比
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}
