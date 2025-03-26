"use client"

import { useState } from "react"
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
import { getUserReviews, deleteReview } from "@/lib/reviews"

export default function UserReviews() {
  const { toast } = useToast()
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userReviews, setUserReviews] = useState(getUserReviews("user-001"))

  // 处理删除评价
  const handleDeleteReview = () => {
    if (!reviewToDelete) return

    setIsDeleting(true)

    try {
      const success = deleteReview(reviewToDelete)

      if (success) {
        setUserReviews(userReviews.filter((review) => review.id !== reviewToDelete))

        toast({
          title: "评价已删除",
          description: "您的评价已成功删除",
        })
      } else {
        toast({
          title: "删除失败",
          description: "删除评价时出现错误，请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
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
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">全部评价</TabsTrigger>
                <TabsTrigger value="recent">最近发布</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {userReviews.length > 0 ? (
                  <div className="space-y-4">
                    {userReviews.map((review) => (
                      <div key={review.id} className="relative">
                        <ReviewCard review={review} detailed />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <Link href={`/cars/${review.carId}/reviews/edit/${review.id}`}>
                            <Button size="sm" variant="outline">
                              <PenLine className="h-4 w-4 mr-1" />
                              编辑
                            </Button>
                          </Link>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => setReviewToDelete(review.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                删除
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>确认删除评价</DialogTitle>
                                <DialogDescription>您确定要删除这条评价吗？此操作无法撤销。</DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setReviewToDelete(null)}>
                                  取消
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteReview} disabled={isDeleting}>
                                  {isDeleting ? "删除中..." : "确认删除"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
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
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 5)
                      .map((review) => (
                        <div key={review.id} className="relative">
                          <ReviewCard review={review} detailed />
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Link href={`/cars/${review.carId}/reviews/edit/${review.id}`}>
                              <Button size="sm" variant="outline">
                                <PenLine className="h-4 w-4 mr-1" />
                                编辑
                              </Button>
                            </Link>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() => setReviewToDelete(review.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  删除
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>确认删除评价</DialogTitle>
                                  <DialogDescription>您确定要删除这条评价吗？此操作无法撤销。</DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setReviewToDelete(null)}>
                                    取消
                                  </Button>
                                  <Button variant="destructive" onClick={handleDeleteReview} disabled={isDeleting}>
                                    {isDeleting ? "删除中..." : "确认删除"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

