import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Car {
  id: string
  name: string
  thumbnail: string
  basePrice: string
  status: "active" | "draft" | "archived"
  sales: number
}

interface CarManagementProps {
  cars: Car[]
  isLoading?: boolean
}

export default function CarManagement({ cars = [], isLoading = false }: CarManagementProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>车型管理</CardTitle>
          <CardDescription>管理您的车型和配置选项</CardDescription>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加车型
        </Button>
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
            ) : (
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
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

