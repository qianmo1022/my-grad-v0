"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import CarDialog, { Car } from "./car-dialog"
import Link from "next/link"
interface CarManagementProps {
  cars: Car[]
  isLoading?: boolean
  onDataChange?: () => void
}

export default function CarManagement({ cars = [], isLoading = false, onDataChange }: CarManagementProps) {
  const { toast } = useToast()
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 打开添加车型对话框
  const handleAddCar = () => {
    setSelectedCar(null) // 确保没有选中的车型
    setIsDialogOpen(true)
  }

  // 打开编辑车型对话框
  const handleEditCar = (car: Car) => {
    setSelectedCar(car)
    setIsDialogOpen(true)
  }

  // 打开删除确认对话框
  const handleDeleteClick = (car: Car) => {
    setSelectedCar(car)
    setIsDeleteDialogOpen(true)
  }

  // 删除车型
  const handleDeleteCar = async () => {
    if (!selectedCar) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/dealer/cars/${selectedCar.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      toast({
        title: "车型已删除",
        description: "车型已成功从系统中删除",
      })

      // 刷新数据
      if (onDataChange) {
        onDataChange()
      }
    } catch (error) {
      console.error('删除车型失败:', error)
      toast({
        title: "删除失败",
        description: "删除车型时发生错误，请重试",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // 对话框操作成功后的回调
  const handleDialogSuccess = () => {
    if (onDataChange) {
      onDataChange()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>车型管理</CardTitle>
          <CardDescription>管理您的车型和配置选项</CardDescription>
        </div>
        <Link href="/dashboard/dealer/cars/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            添加车型
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>车型</TableHead>
              <TableHead>基础价格</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>销量</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {[...Array(4)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-16 rounded" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : cars.length > 0 ? (
              cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-16 rounded overflow-hidden">
                        <Image src={car.thumbnail || "/placeholder.svg"} alt={car.name || ""} fill className="object-cover" />
                      </div>
                      <span className="font-medium">{car.name || ""}</span>
                    </div>
                  </TableCell>
                  <TableCell>{car.basePrice || "¥0"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        car.status === "active"
                          ? "bg-green-500 bg-opacity-10 text-green-700 border-0"
                          : car.status === "draft"
                            ? "bg-yellow-500 bg-opacity-10 text-yellow-700 border-0"
                            : "bg-gray-500 bg-opacity-10 text-gray-700 border-0"
                      }
                    >
                      {car.status === "active" && "已上线"}
                      {car.status === "draft" && "草稿"}
                      {car.status === "archived" && "已归档"}
                    </Badge>
                  </TableCell>
                  <TableCell>{car.sales || 0}台</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCar(car)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(car)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  暂无车型数据，点击"添加车型"按钮创建新车型
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* 添加/编辑车型对话框 */}
      <CarDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        car={selectedCar}
        onSuccess={handleDialogSuccess}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除车型</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除车型 {selectedCar?.name} 吗？此操作无法撤销，相关的配置和数据也将被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCar} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

