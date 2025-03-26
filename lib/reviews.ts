import { getUserData } from "./recommendation"

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

// 模拟评价数据
const mockReviews: Review[] = [
  {
    id: "review-001",
    carId: "luxury-sedan",
    userId: "user-001",
    userName: "张先生",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "豪华轿车的极致体验",
    content:
      "这款豪华轿车的驾驶体验非常出色，内饰做工精细，科技配置丰富。特别是高级音响系统，音质非常震撼。座椅舒适度也很高，长途驾驶不会感到疲劳。总体来说，这是一款值得推荐的豪华轿车。",
    date: "2024-01-15",
    helpful: 24,
    configurationId: "cfg-001",
    tags: ["舒适度高", "科技配置丰富", "内饰精致"],
    verified: true,
  },
  {
    id: "review-002",
    carId: "luxury-sedan",
    userId: "user-002",
    userName: "李女士",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    title: "性价比不错的豪华选择",
    content:
      "作为一款豪华轿车，它的性价比还是不错的。驾驶感受平稳，内饰用料考究。不过在某些细节上还有提升空间，比如后排空间可以再宽敞一些。总的来说，这是一款值得考虑的豪华轿车。",
    date: "2024-01-28",
    helpful: 15,
    tags: ["性价比高", "驾驶平稳", "细节待改进"],
    verified: true,
  },
  {
    id: "review-003",
    carId: "sports-car",
    userId: "user-003",
    userName: "王先生",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "极致性能的完美体现",
    content:
      "这款跑车的性能简直令人惊叹！加速迅猛，操控精准，每次驾驶都充满激情。外观设计也非常吸引眼球，经常会收到路人的赞美。虽然价格不菲，但对于追求驾驶乐趣的人来说，绝对值得。",
    date: "2024-02-05",
    helpful: 32,
    images: ["/placeholder.svg?height=200&width=300", "/placeholder.svg?height=200&width=300"],
    tags: ["性能强劲", "外观惊艳", "操控精准"],
    verified: true,
  },
  {
    id: "review-004",
    carId: "city-suv",
    userId: "user-004",
    userName: "赵女士",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    title: "适合家庭的实用SUV",
    content:
      "这款城市SUV非常适合家庭使用，空间宽敞，后备箱容量大，日常购物和短途旅行都很方便。油耗也比较经济，是一款性价比不错的家用车。不过隔音效果可以再提升一些。",
    date: "2024-02-10",
    helpful: 18,
    tags: ["空间大", "经济实用", "适合家庭"],
    verified: true,
  },
  {
    id: "review-005",
    carId: "city-suv",
    userId: "user-005",
    userName: "钱先生",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 3,
    title: "中规中矩的城市SUV",
    content:
      "作为一款城市SUV，它的表现中规中矩。优点是操控灵活，在城市中穿梭自如；缺点是动力略显不足，高速超车时有些吃力。内饰设计比较保守，科技感不够强。总体来说，是一款实用但不出彩的车型。",
    date: "2024-02-15",
    helpful: 10,
    tags: ["操控灵活", "动力一般", "设计保守"],
    verified: false,
  },
  {
    id: "review-006",
    carId: "luxury-sedan",
    userId: "user-006",
    userName: "孙先生",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "商务人士的最佳选择",
    content:
      "作为一名经常需要接待客户的商务人士，这款豪华轿车给我提供了极大的帮助。宽敞的后排空间和舒适的座椅让客户感到尊贵，高级的音响系统和隔音效果也为商务谈话创造了良好的环境。",
    date: "2024-02-20",
    helpful: 22,
    tags: ["商务适用", "舒适度高", "隔音出色"],
    verified: true,
  },
]

// 获取特定车型的所有评价
export function getCarReviews(carId: string): Review[] {
  return mockReviews.filter((review) => review.carId === carId)
}

// 获取特定用户的所有评价
export function getUserReviews(userId: string): Review[] {
  return mockReviews.filter((review) => review.userId === userId)
}

// 获取特定评价
export function getReviewById(reviewId: string): Review | undefined {
  return mockReviews.find((review) => review.id === reviewId)
}

// 添加新评价
export function addReview(
  review: Omit<Review, "id" | "date" | "helpful" | "userId" | "userName" | "userAvatar">,
): Review {
  const userData = getUserData()

  const newReview: Review = {
    id: `review-${Date.now()}`,
    userId: userData.id,
    userName: "张先生", // 在实际应用中应从用户数据获取
    userAvatar: "/placeholder.svg?height=40&width=40", // 在实际应用中应从用户数据获取
    date: new Date().toISOString().split("T")[0],
    helpful: 0,
    ...review,
  }

  mockReviews.unshift(newReview)
  return newReview
}

// 标记评价为有帮助
export function markReviewAsHelpful(reviewId: string): void {
  const review = mockReviews.find((r) => r.id === reviewId)
  if (review) {
    review.helpful += 1
  }
}

// 删除评价
export function deleteReview(reviewId: string): boolean {
  const index = mockReviews.findIndex((r) => r.id === reviewId)
  if (index !== -1) {
    mockReviews.splice(index, 1)
    return true
  }
  return false
}

// 计算车型的平均评分
export function getCarAverageRating(carId: string): { average: number; count: number } {
  const reviews = getCarReviews(carId)
  if (reviews.length === 0) {
    return { average: 0, count: 0 }
  }

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return {
    average: Number.parseFloat((sum / reviews.length).toFixed(1)),
    count: reviews.length,
  }
}

// 获取评价标签统计
export function getReviewTagStats(carId: string): { tag: string; count: number }[] {
  const reviews = getCarReviews(carId)
  const tagCounts: Record<string, number> = {}

  reviews.forEach((review) => {
    review.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

// 获取评分分布
export function getRatingDistribution(carId: string): number[] {
  const reviews = getCarReviews(carId)
  const distribution = [0, 0, 0, 0, 0] // 对应1-5星的数量

  reviews.forEach((review) => {
    distribution[review.rating - 1] += 1
  })

  return distribution
}

