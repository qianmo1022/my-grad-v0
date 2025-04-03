"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { X, Upload, Star } from "lucide-react"
import { addReview } from "@/lib/reviews"

interface ReviewFormProps {
  carId: string
  configurationId?: string
}

export default function ReviewForm({ carId, configurationId }: ReviewFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 常用标签建议
  const suggestedTags = [
    "性能强劲",
    "舒适度高",
    "外观惊艳",
    "内饰精致",
    "科技配置丰富",
    "操控精准",
    "空间大",
    "性价比高",
    "油耗经济",
    "隔音出色",
  ]

  // 处理标签添加
  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setCurrentTag("")
    }
  }

  // 处理标签删除
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // 处理图片上传（模拟）
  const handleImageUpload = () => {
    // 在实际应用中，这里应该处理真实的图片上传
    // 这里只是模拟添加一个占位图
    if (images.length < 5) {
      setImages([...images, "/placeholder.svg?height=200&width=300"])
    }
  }

  // 处理图片删除
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: "请选择评分",
        description: "请为车型选择1-5星评分",
        variant: "destructive",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "请输入标题",
        description: "请为您的评价添加一个标题",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "请输入评价内容",
        description: "请分享您对车型的详细体验",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 添加评价
      await addReview({
        carId,
        rating,
        title,
        content,
        tags,
        images: images.length > 0 ? images : undefined,
        configurationId,
        verified: true, // 模拟已验证购买
      })

      toast({
        title: "评价提交成功",
        description: "感谢您分享您的用车体验！",
      })

      // 重定向到评价列表页
      router.push(`/cars/${carId}/reviews`)
      router.refresh()
    } catch (error: any) {
      // 显示API返回的具体错误信息
      toast({
        title: "评价提交失败",
        description: error.message || "提交评价时出现错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>写评价</CardTitle>
          <CardDescription>分享您对这款车型的真实体验和感受</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 评分 */}
          <div className="space-y-2">
            <Label>您的评分</Label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">评价标题</Label>
            <Input
              id="title"
              placeholder="用一句话概括您的体验"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* 内容 */}
          <div className="space-y-2">
            <Label htmlFor="content">评价内容</Label>
            <Textarea
              id="content"
              placeholder="详细描述您的用车体验、优缺点和建议"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label>添加标签（最多5个）</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="添加标签，如'性能强劲'"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag(currentTag)
                  }
                }}
                disabled={tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddTag(currentTag)}
                disabled={!currentTag || tags.length >= 5}
              >
                添加
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {suggestedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleAddTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* 图片上传 */}
          <div className="space-y-2">
            <Label>上传图片（最多5张）</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative h-24 w-24 rounded-md overflow-hidden border">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`上传图片 ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/50 p-1 hover:bg-black/70"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="flex items-center justify-center h-24 w-24 border border-dashed rounded-md hover:bg-muted/50"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "提交中..." : "提交评价"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

