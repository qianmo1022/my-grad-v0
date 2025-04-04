"use client"

import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ReviewCard from "@/components/reviews/review-card"
import { type Review, getReviewById } from "@/lib/reviews"

export default function ReviewDetailPage() {
  const params = useParams()
  const reviewId = params.reviewId as string
  const { toast } = useToast()
  
  const [review, setReview] = useState<Review | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 获取评价详情
  useEffect(() => {
    const fetchReviewDetail = async () => {
      try {
        setIsLoading(true)
        
        // 获取评价详情
        const response = await fetch(`/api/user/reviews/${reviewId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            return notFound()
          }
          throw new Error("获取评价详情失败")
        }
        
        const data = await response.json()
        setReview(data) // API直接返回评价对象，不是嵌套在review字段中
      } catch (error) {
        console.error("获取评价详情失败:", error)
        toast({
          title: "获取评价详情失败",
          description: "加载评价详情时出现错误，请稍后重试",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (reviewId) {
      fetchReviewDetail()
    }
  }, [reviewId, toast])

  // 处理评价删除后的回调
  const handleReviewDeleted = () => {
    // 评价被删除后返回评价列表页面
    window.location.href = "/dashboard/user/reviews"
  }

  return (
    <DashboardLayout userType="user">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/user/reviews" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="mr-1 h-4 w-4" />
              返回评价列表
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">评价详情</h2>
            <p className="text-muted-foreground">查看评价的详细信息</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">加载评价详情中...</span>
          </div>
        ) : review ? (
          <Card>
            <CardHeader>
              <CardTitle>评价详情</CardTitle>
              <CardDescription>
                {review.car?.name ? `对${review.car.name}的评价` : "评价详情"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewCard 
                review={review} 
                detailed 
                onReviewDeleted={handleReviewDeleted}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">未找到评价信息</p>
              <Link href="/dashboard/user/reviews">
                <Button>返回评价列表</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}