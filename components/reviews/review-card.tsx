"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, Check, Calendar, ImageIcon, PenLine, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Review, markReviewAsHelpful, deleteReview } from "@/lib/reviews"
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

interface ReviewCardProps {
  review: Review
  detailed?: boolean
  onReviewDeleted?: (reviewId: string) => void
}

export default function ReviewCard({ review, detailed = false, onReviewDeleted }: ReviewCardProps) {
  const { toast } = useToast()
  const [helpfulCount, setHelpfulCount] = useState(review.helpful)
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  // 格式化日期
  const formattedDate = review.date

  // 处理标记为有帮助
  const handleMarkHelpful = async () => {
    if (!hasMarkedHelpful) {
      try {
        const response = await fetch("/api/reviews/helpful", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviewId: review.id }),
        });

        if (!response.ok) {
          throw new Error("标记评价为有帮助失败");
        }

        const data = await response.json();
        setHelpfulCount(data.helpfulCount);
        setHasMarkedHelpful(true);
        
        toast({
          title: "已标记为有帮助",
          description: "感谢您的反馈",
        });
      } catch (error) {
        console.error("标记评价为有帮助失败:", error);
        toast({
          title: "操作失败",
          description: "标记评价为有帮助时出现错误",
          variant: "destructive",
        });
      }
    }
  }
  
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

      // 通知父组件评价已被删除
      if (onReviewDeleted) {
        onReviewDeleted(reviewToDelete)
      }

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
    <Card className="overflow-hidden">
      <CardContent className={cn("p-4", detailed && "p-6")}>
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.userAvatar || ""} alt={review.userName} />
            <AvatarFallback>{review.userName}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{review.userName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formattedDate}
                  </div>
                  {review.verified && (
                    <div className="flex items-center text-green-600">
                      <Check className="mr-1 h-3 w-3" />
                      已验证购买
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300",
                      )}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold mt-3">{review.title}</h4>
            <p className={cn("text-muted-foreground mt-2", !detailed && "line-clamp-3")}>{review.content}</p>

            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {review.images.map((image, index) => (
                  <div key={index} className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Review image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {review.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 px-4 py-2 flex justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className={cn(hasMarkedHelpful && "text-primary")}
            onClick={handleMarkHelpful}
            disabled={hasMarkedHelpful}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            有帮助 ({helpfulCount})
          </Button>

          {review.images && review.images.length > 0 && !detailed && (
            <Button variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4 mr-1" />
              查看图片 ({review.images.length})
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
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
      </CardFooter>
    </Card>
  )
}

