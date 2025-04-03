"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { PenLine, Trash2 } from "lucide-react"
import ReviewCard from "@/components/reviews/review-card"

// 定义评价类型
interface Review {
  id: string
  carId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  date?: string
  createdAt: string
  helpful: number
  configurationId?: string
  images?: string[]
  tags: string[]
  verified: boolean
  car?: {
    id: string
    name: string
    thumbnail: string
  }
}

export default function UserReviews() {
  const { toast } = useToast()
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userReviews, setUserReviews] = useState<Review[]>([])

  // 获取用户评价
  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/user/reviews")
        
        if (!response.ok) {
          throw new Error("获取评价失败")
        }
        
        const data = await response.json()
        setUserReviews(data.reviews)
      } catch (error) {
        console.error("获取评价失败:", error)
        toast({
          title: "获取评价失败",
          description: "加载评价时出现错误，请稍后重试",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserReviews()
  }, [])

  // 处理删除评价
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch("/api/user/reviews", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId: reviewToDelete }),
      })

      if (!response.ok) {
        throw new Error("删除评价失败")
      }

      setUserReviews(userReviews.filter((review) => review.id !== reviewToDelete))

      toast({
        title: "评价已删除",
        description: "您的评价已成功删除",
      })
    } catch (error) {
      console.error("删除评价失败:", error)
      toast({
        title: "删除失败",
        description: "删除评价时出现错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setReviewToDelete(null)
    }
  }

  return (
    <DashboardLayout userType="user">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">我的评价</h2>
          <p className="text-muted-foreground">管理您发布的车型评价</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>我的评价</CardTitle>
            <CardDescription>您已发布的车型评价</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">全部评价</TabsTrigger>
                  <TabsTrigger value="recent">最近发布</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  {userReviews.length > 0 ? (
                    <div className="space-y-4">
                      {userReviews.map((review) => (
                        <div key={review.id}>
                          <ReviewCard 
                            review={{...review, date: review.date || review.createdAt}} 
                            detailed 
                            onReviewDeleted={(reviewId) => {
                              setUserReviews(userReviews.filter((r) => r.id !== reviewId))
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">您还没有发布任何评价</p>
                      <Link href="/cars">
                        <Button>浏览车型并评价</Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="recent" className="mt-4">
                  {userReviews.length > 0 ? (
                    <div className="space-y-4">
                      {userReviews
                        .slice(0, 5)
                        .map((review) => (
                          <div key={review.id}>
                            <ReviewCard 
                              review={{...review, date: review.date || review.createdAt}} 
                              detailed 
                              onReviewDeleted={(reviewId) => {
                                setUserReviews(userReviews.filter((r) => r.id !== reviewId))
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">您还没有发布任何评价</p>
                      <Link href="/cars">
                        <Button>浏览车型并评价</Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

