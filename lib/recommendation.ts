import { type CarModel, type ConfigOption } from "./car-data"

// 用户偏好类型
export interface UserPreference {
  id: string
  name: string
  value: number // 1-5 的偏好程度
}

// 用户偏好类别
export const preferenceCategories = [
  {
    id: "performance",
    name: "性能",
    description: "发动机性能、加速和操控性",
    options: [
      { id: "acceleration", name: "加速性能" },
      { id: "handling", name: "操控性" },
      { id: "topSpeed", name: "最高速度" },
    ],
  },
  {
    id: "comfort",
    name: "舒适度",
    description: "座椅舒适度、空间和乘坐体验",
    options: [
      { id: "seating", name: "座椅舒适度" },
      { id: "space", name: "空间大小" },
      { id: "noise", name: "噪音控制" },
    ],
  },
  {
    id: "technology",
    name: "科技配置",
    description: "娱乐系统、驾驶辅助和连接功能",
    options: [
      { id: "infotainment", name: "娱乐系统" },
      { id: "driverAssist", name: "驾驶辅助" },
      { id: "connectivity", name: "连接功能" },
    ],
  },
  {
    id: "design",
    name: "设计风格",
    description: "外观设计、内饰风格和个性化选项",
    options: [
      { id: "exterior", name: "外观设计" },
      { id: "interior", name: "内饰风格" },
      { id: "customization", name: "个性化选项" },
    ],
  },
  {
    id: "value",
    name: "性价比",
    description: "价格、燃油经济性和维护成本",
    options: [
      { id: "price", name: "价格" },
      { id: "fuelEconomy", name: "燃油经济性" },
      { id: "maintenance", name: "维护成本" },
    ],
  },
]

// 用户浏览历史类型
export interface BrowsingHistory {
  carId: string
  timestamp: number
  duration: number // 浏览时长（秒）
}

// 用户保存的配置类型
export interface SavedConfiguration {
  id: string
  carId: string
  options: Record<string, string> // 类别ID -> 选项ID
  timestamp: number
}

// 用户数据类型
export interface UserData {
  id: string
  preferences: UserPreference[]
  browsingHistory: BrowsingHistory[]
  savedConfigurations: SavedConfiguration[]
}

// 模拟用户数据
const mockUserData: UserData = {
  id: "user-001",
  preferences: [
    { id: "acceleration", name: "加速性能", value: 4 },
    { id: "handling", name: "操控性", value: 5 },
    { id: "seating", name: "座椅舒适度", value: 3 },
    { id: "infotainment", name: "娱乐系统", value: 4 },
    { id: "exterior", name: "外观设计", value: 5 },
    { id: "price", name: "价格", value: 3 },
  ],
  browsingHistory: [
    { carId: "luxury-sedan", timestamp: Date.now() - 86400000 * 2, duration: 180 },
    { carId: "sports-car", timestamp: Date.now() - 86400000 * 1, duration: 300 },
    { carId: "city-suv", timestamp: Date.now() - 86400000 * 5, duration: 120 },
  ],
  savedConfigurations: [
    {
      id: "cfg-001",
      carId: "luxury-sedan",
      options: {
        "exterior-color": "black",
        wheels: "luxury",
        interior: "premium-leather",
        "tech-package": "advanced-tech",
      },
      timestamp: Date.now() - 86400000 * 3,
    },
    {
      id: "cfg-002",
      carId: "sports-car",
      options: {
        "exterior-color": "red",
        wheels: "sport",
        performance: "sport-performance",
        interior: "premium-sport",
      },
      timestamp: Date.now() - 86400000 * 7,
    },
  ],
}

// 车型特性评分（模拟数据）
const carFeatureScores: Record<string, Record<string, number>> = {
  "luxury-sedan": {
    acceleration: 3,
    handling: 3,
    topSpeed: 3,
    seating: 5,
    space: 4,
    noise: 5,
    infotainment: 5,
    driverAssist: 5,
    connectivity: 5,
    exterior: 4,
    interior: 5,
    customization: 4,
    price: 2,
    fuelEconomy: 3,
    maintenance: 2,
  },
  "city-suv": {
    acceleration: 2,
    handling: 3,
    topSpeed: 2,
    seating: 4,
    space: 5,
    noise: 3,
    infotainment: 4,
    driverAssist: 4,
    connectivity: 4,
    exterior: 3,
    interior: 4,
    customization: 3,
    price: 3,
    fuelEconomy: 4,
    maintenance: 3,
  },
  "sports-car": {
    acceleration: 5,
    handling: 5,
    topSpeed: 5,
    seating: 2,
    space: 1,
    noise: 2,
    infotainment: 4,
    driverAssist: 3,
    connectivity: 4,
    exterior: 5,
    interior: 4,
    customization: 5,
    price: 1,
    fuelEconomy: 2,
    maintenance: 1,
  },
}

// 判断是否在服务器端
const isServer = typeof window === 'undefined';

// 获取用户数据
export function getUserData(): UserData {
  return mockUserData
}

// 更新用户偏好
export function updateUserPreferences(preferences: UserPreference[]): UserData {
  mockUserData.preferences = preferences
  return mockUserData
}

// 添加浏览历史
export function addBrowsingHistory(carId: string, duration: number): void {
  mockUserData.browsingHistory.unshift({
    carId,
    timestamp: Date.now(),
    duration,
  })

  // 保持历史记录不超过20条
  if (mockUserData.browsingHistory.length > 20) {
    mockUserData.browsingHistory = mockUserData.browsingHistory.slice(0, 20)
  }
}

// 添加保存的配置
export function addSavedConfiguration(carId: string, options: Record<string, string>): SavedConfiguration {
  const newConfig: SavedConfiguration = {
    id: `cfg-${Date.now()}`,
    carId,
    options,
    timestamp: Date.now(),
  }

  mockUserData.savedConfigurations.unshift(newConfig)

  return newConfig
}

// 计算用户对车型的匹配分数
function calculateCarMatchScore(carId: string, userData: UserData): number {
  const carScores = carFeatureScores[carId]
  if (!carScores) return 0

  let totalScore = 0
  let totalWeight = 0

  // 基于用户偏好计算分数
  userData.preferences.forEach((pref) => {
    if (carScores[pref.id]) {
      totalScore += carScores[pref.id] * pref.value
      totalWeight += pref.value
    }
  })

  // 考虑浏览历史
  const browsingFactor = userData.browsingHistory
    .filter((history) => history.carId === carId)
    .reduce((sum, history) => {
      // 最近浏览的权重更高
      const recencyWeight = Math.max(0, 1 - (Date.now() - history.timestamp) / (86400000 * 30))
      return sum + history.duration * recencyWeight * 0.01
    }, 0)

  // 考虑保存的配置
  const configFactor = userData.savedConfigurations
    .filter((config) => config.carId === carId)
    .reduce((sum, config) => {
      // 最近保存的权重更高
      const recencyWeight = Math.max(0, 1 - (Date.now() - config.timestamp) / (86400000 * 30))
      return sum + recencyWeight * 0.5
    }, 0)

  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0
  return finalScore + browsingFactor + configFactor
}

// 获取推荐的车型
export async function getRecommendedCars(limit = 3): Promise<CarModel[]> {
  const userData = getUserData()
  
  try {
    // 客户端使用 fetch API
    if (!isServer) {
      const response = await fetch('/api/cars');
      if (!response.ok) {
        throw new Error('获取车型列表失败');
      }
      const cars = await response.json();
      
      // 计算每个车型的匹配分数
      const scoredCars = cars.map((car: CarModel) => ({
        car,
        score: calculateCarMatchScore(car.id, userData),
      }));
      
      // 按分数排序并返回前N个
      return scoredCars
        .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
        .slice(0, limit)
        .map((item: { car: CarModel }) => item.car);
    }
    
    // 模拟数据
    return [
      {
        id: "sports-car",
        name: "跑车系列",
        basePrice: 580000,
        description: "极致性能与优雅设计的完美结合",
        thumbnail: "/placeholder.svg?height=300&width=500",
        defaultColor: "#c0392b",
      },
      {
        id: "luxury-sedan",
        name: "豪华轿车",
        basePrice: 350000,
        description: "豪华舒适的驾乘体验，配备先进科技和精致内饰",
        thumbnail: "/placeholder.svg?height=300&width=500",
        defaultColor: "#1a1a1a",
      },
      {
        id: "city-suv",
        name: "城市SUV",
        basePrice: 280000,
        description: "灵活多变的城市出行选择，兼具空间和操控性",
        thumbnail: "/placeholder.svg?height=300&width=500",
        defaultColor: "#2c3e50",
      }
    ].slice(0, limit);
  } catch (error) {
    console.error('获取推荐车型失败:', error);
    return [];
  }
}

// 计算选项的匹配分数
function calculateOptionMatchScore(categoryId: string, optionId: string, userData: UserData): number {
  // 查看用户的保存配置中是否选择过此选项
  const configCount = userData.savedConfigurations.filter(
    (config) => config.options[categoryId] === optionId
  ).length

  // 简单匹配逻辑：用户之前选择过此选项的频率
  return configCount * 0.5
}

// 获取推荐的配置选项
export function getRecommendedOptions(carId: string, categoryId: string): ConfigOption[] {
  try {
    // 模拟常见的推荐选项
    const mockRecommendedOptions: Record<string, ConfigOption[]> = {
      "exterior-color": [
        {
          id: "premium-black",
          optionKey: "premium-black",
          name: "高级曜石黑",
          description: "高级金属漆，深邃黑色带有细微闪光",
          price: 12000,
          colorCode: "#0a0a0a",
          categoryId: "exterior-color"
        },
        {
          id: "metallic-silver",
          optionKey: "metallic-silver",
          name: "金属银",
          description: "明亮的金属银色漆面",
          price: 8000,
          colorCode: "#d5d5d5",
          categoryId: "exterior-color"
        }
      ],
      "interior-color": [
        {
          id: "premium-beige",
          optionKey: "premium-beige",
          name: "高级米色",
          description: "优质米色真皮内饰",
          price: 15000,
          colorCode: "#e8d4b2",
          categoryId: "interior-color"
        }
      ],
      "wheels": [
        {
          id: "premium-sport",
          optionKey: "premium-sport",
          name: "高级运动轮毂",
          description: "21寸铝合金运动轮毂",
          price: 25000,
          thumbnail: "/placeholder.svg?height=100&width=100",
          categoryId: "wheels"
        }
      ]
    };
    
    // 返回该分类的推荐选项或空数组
    return mockRecommendedOptions[categoryId] || [];
  } catch (error) {
    console.error('获取推荐配置选项失败:', error);
    return [];
  }
}

