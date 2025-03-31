"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight } from "lucide-react"
import ReviewCard from "./review-card"
import { getCarReviews, getCarAverageRating, getRatingDistribution } from "@/lib/reviews"

interface ReviewListProps {
  carId: string
  limit?: number
  showViewAll?: boolean
}

export default function ReviewList({ carId, limit, showViewAll = true }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<string>("recent")
  const [filterRating, setFilterRating] = useState<string>("all")

  // 获取评价数据
  const allReviews = getCarReviews(carId)
  const { average, count } = getCarAverageRating(carId)
  const ratingDistribution = getRatingDistribution(carId)

  // 根据筛选条件过滤评价
  let filteredReviews = [...allReviews]

  if (filterRating !== "all") {
    const rating = Number.parseInt(filterRating)
    filteredReviews = filteredReviews.filter((review) => review.rating === rating)
  }

  // 根据排序条件排序评价
  if (sortBy === "recent") {
    filteredReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } else if (sortBy === "helpful") {
    filteredReviews.sort((a, b) => b.helpful - a.helpful)
  } else if (sortBy === "highest") {
    filteredReviews.sort((a, b) => b.rating - a.rating)
  } else if (sortBy === "lowest") {
    filteredReviews.sort((a, b) => a.rating - b.rating)
  }

  // 限制显示数量
  const displayReviews = limit ? filteredReviews.slice(0, limit) : filteredReviews

  // 计算各星级评价的百分比
  const calculatePercentage = (count: number) => {
    return allReviews.length > 0 ? Math.round((count / allReviews.length) * 100) : 0
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>用户评价</CardTitle>
            <CardDescription>{count > 0 ? `${count}条评价，平均${average}星` : "暂无评价"}</CardDescription>
          </div>

          {count > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">最新评价</SelectItem>
                  <SelectItem value="helpful">最有帮助</SelectItem>
                  <SelectItem value="highest">最高评分</SelectItem>
                  <SelectItem value="lowest">最低评分</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="筛选评分" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有评分</SelectItem>
                  <SelectItem value="5">5星</SelectItem>
                  <SelectItem value="4">4星</SelectItem>
                  <SelectItem value="3">3星</SelectItem>
                  <SelectItem value="2">2星</SelectItem>
                  <SelectItem value="1">1星</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {count > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">{average}</div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={cn(
                            "h-5 w-5",
                            i < Math.round(average) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300",
                          )}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ratingDistribution.map((count, index) => {
                      const starRating = index + 1
                      const percentage = calculatePercentage(count)

                      return (
                        <div key={starRating} className="flex items-center gap-2">
                          <div className="w-8 text-sm">{starRating}星</div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                          </div>
                          <div className="w-8 text-sm text-right">{percentage}%</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">所有评价</TabsTrigger>
                    <TabsTrigger value="verified">已验证购买</TabsTrigger>
                    <TabsTrigger value="with-images">带图评价</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4 space-y-4">
                    {displayReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </TabsContent>

                  <TabsContent value="verified" className="mt-4 space-y-4">
                    {displayReviews
                      .filter((review) => review.verified)
                      .map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                  </TabsContent>

                  <TabsContent value="with-images" className="mt-4 space-y-4">
                    {displayReviews
                      .filter((review) => review.images && review.images.length > 0)
                      .map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {showViewAll && limit && allReviews.length > limit && (
              <div className="flex justify-center mt-6">
                <Link href={`/cars/${carId}/reviews`}>
                  <Button variant="outline">
                    查看全部{allReviews.length}条评价
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">暂无评价，成为第一个评价此车型的用户！</p>
            <Link href={`/cars/${carId}/reviews/new`}>
              <Button>写评价</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

