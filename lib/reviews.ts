// 不再需要从recommendation导入getUserData

// 评价数据类型
export interface Review {
  id: string
  carId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number // 1-5星
  title: string
  content: string
  date: string
  helpful: number // 有帮助数量
  configurationId?: string // 关联的配置ID（可选）
  images?: string[] // 评价图片（可选）
  tags: string[] // 评价标签，如"性能好"、"舒适度高"等
  verified: boolean // 是否是已验证购买
}

// 获取特定车型的所有评价
export async function getCarReviews(carId: string): Promise<Review[]> {
  try {
    // 使用绝对URL或确保URL格式正确
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const response = await fetch(`${baseUrl}/api/cars/${carId}/reviews`)
    
    // 无论响应是否成功，都先尝试解析响应内容
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      // 如果API返回了错误信息，则使用该信息
      if (data && data.error) {
        throw new Error(data.error)
      } else {
        throw new Error(`获取车型评价失败: ${response.statusText}`)
      }
    }
    
    return data.reviews || []
  } catch (error) {
    console.error("获取车型评价失败:", error)
    return []
  }
}

// 获取特定用户的所有评价
export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const response = await fetch(`/api/user/reviews`)
    
    // 无论响应是否成功，都先尝试解析响应内容
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      // 如果API返回了错误信息，则使用该信息
      if (data && data.error) {
        throw new Error(data.error)
      } else {
        throw new Error(`获取用户评价失败: ${response.statusText}`)
      }
    }
    
    return data.reviews || []
  } catch (error) {
    console.error("获取用户评价失败:", error)
    return []
  }
}

// 获取特定评价
export async function getReviewById(reviewId: string): Promise<Review | undefined> {
  try {
    // 由于没有直接获取单个评论的API，我们先获取用户的所有评论，然后筛选
    const userReviews = await getUserReviews("current")
    return userReviews.find((review) => review.id === reviewId)
  } catch (error) {
    console.error("获取评价详情失败:", error)
    return undefined
  }
}

// 添加新评价
export async function addReview(
  review: Omit<Review, "id" | "date" | "helpful" | "userId" | "userName" | "userAvatar">
): Promise<Review> {
  try {
    const response = await fetch(`/api/user/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carId: review.carId,
        title: review.title,
        content: review.content,
        rating: review.rating,
        tags: review.tags || [],
        configurationId: review.configurationId,
        images: review.images || []
      }),
    })

    // 无论响应是否成功，都先尝试解析响应内容
    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      // 如果API返回了错误信息，则使用该信息
      if (responseData && responseData.error) {
        throw new Error(responseData.error)
      } else {
        throw new Error(`添加评价失败: ${response.statusText}`)
      }
    }

    // 使用已解析的响应数据
    const newReviewData = responseData
    
    // 构造完整的评论对象
    // 注意：后端API应该通过session返回完整的用户信息
    return {
      id: newReviewData.id,
      userId: newReviewData.userId || "", // 应由后端通过session提供
      userName: newReviewData.userName || "用户", // 应由后端通过session提供
      userAvatar: newReviewData.userAvatar || "/placeholder.svg?height=40&width=40",
      date: newReviewData.date || new Date().toISOString().split("T")[0],
      helpful: 0,
      carId: review.carId,
      rating: review.rating,
      title: review.title,
      content: review.content,
      tags: review.tags || [],
      verified: newReviewData.verified || false,
      configurationId: review.configurationId,
      images: review.images || []
    }
  } catch (error) {
    console.error("添加评价失败:", error)
    throw error
  }
}

// 标记评价为有帮助
export async function markReviewAsHelpful(reviewId: string): Promise<void> {
  try {
    // 由于没有直接的API端点，这里可以实现一个本地状态管理
    // 在实际应用中，应该有一个API端点来处理这个操作
    console.log(`标记评价 ${reviewId} 为有帮助`)
    // 这里应该调用API，例如：
    // await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' })
  } catch (error) {
    console.error("标记评价为有帮助失败:", error)
  }
}

// 删除评价
export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    // 由于没有直接的API端点，这里可以实现一个本地状态管理
    // 在实际应用中，应该有一个API端点来处理这个操作
    console.log(`删除评价 ${reviewId}`)
    // 这里应该调用API，例如：
    // const response = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
    // return response.ok
    return true
  } catch (error) {
    console.error("删除评价失败:", error)
    return false
  }
}

// 计算车型的平均评分
export async function getCarAverageRating(carId: string): Promise<{ average: number; count: number }> {
  try {
    // 使用绝对URL或确保URL格式正确
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const response = await fetch(`${baseUrl}/api/cars/${carId}/reviews`)
    
    // 无论响应是否成功，都先尝试解析响应内容
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      // 如果API返回了错误信息，则使用该信息
      if (data && data.error) {
        throw new Error(data.error)
      } else {
        throw new Error(`获取车型评分失败: ${response.statusText}`)
      }
    }
    
    return {
      average: Number.parseFloat(data.stats?.average || "0"),
      count: data.stats?.count || 0,
    }
  } catch (error) {
    console.error("获取车型平均评分失败:", error)
    return { average: 0, count: 0 }
  }
}

// 获取评价标签统计
export async function getReviewTagStats(carId: string): Promise<{ tag: string; count: number }[]> {
  try {
    const reviews = await getCarReviews(carId)
    const tagCounts: Record<string, number> = {}

    reviews.forEach((review) => {
      review.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error("获取评价标签统计失败:", error)
    return []
  }
}

// 获取评分分布
export async function getRatingDistribution(carId: string): Promise<number[]> {
  try {
    // 使用绝对URL或确保URL格式正确
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const response = await fetch(`${baseUrl}/api/cars/${carId}/reviews`)
    
    // 无论响应是否成功，都先尝试解析响应内容
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      // 如果API返回了错误信息，则使用该信息
      if (data && data.error) {
        throw new Error(data.error)
      } else {
        throw new Error(`获取评分分布失败: ${response.statusText}`)
      }
    }
    
    return data.stats?.distribution || [0, 0, 0, 0, 0]
  } catch (error) {
    console.error("获取评分分布失败:", error)
    return [0, 0, 0, 0, 0] // 对应1-5星的数量
  }
}

