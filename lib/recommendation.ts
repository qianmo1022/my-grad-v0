import { type CarModel, type ConfigOption, getCarById, getCarConfigOptions } from "./car-data"

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

  // 综合评分
  const baseScore = totalWeight > 0 ? totalScore / totalWeight : 0
  return baseScore + browsingFactor + configFactor
}

// 获取推荐车型
export function getRecommendedCars(limit = 3): CarModel[] {
  const userData = getUserData()
  const allCars = ["luxury-sedan", "city-suv", "sports-car"]

  // 计算每个车型的匹配分数
  const carScores = allCars.map((carId) => {
    const car = getCarById(carId)
    if (!car) return { carId, score: 0 }

    return {
      carId,
      car,
      score: calculateCarMatchScore(carId, userData),
    }
  })

  // 按分数排序并返回前N个
  return carScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.car!)
    .filter(Boolean)
}

// 获取配置选项的匹配分数
function calculateOptionMatchScore(categoryId: string, optionId: string, userData: UserData): number {
  // 检查用户之前是否选择过此选项
  const previousSelections = userData.savedConfigurations.filter(
    (config) => config.options[categoryId] === optionId,
  ).length

  // 根据之前的选择计算基础分数
  let score = previousSelections * 0.5

  // 根据类别添加额外分数
  if (categoryId === "exterior-color") {
    // 颜色偏好
    if (optionId === "red" && userData.preferences.some((p) => p.id === "exterior" && p.value > 3)) {
      score += 0.5
    }
  } else if (categoryId === "wheels") {
    // 轮毂偏好
    if (optionId === "sport" && userData.preferences.some((p) => p.id === "handling" && p.value > 3)) {
      score += 0.5
    }
  } else if (categoryId === "interior") {
    // 内饰偏好
    if (optionId.includes("leather") && userData.preferences.some((p) => p.id === "interior" && p.value > 3)) {
      score += 0.5
    }
  } else if (categoryId === "tech-package") {
    // 科技套件偏好
    if (optionId.includes("advanced") && userData.preferences.some((p) => p.id === "infotainment" && p.value > 3)) {
      score += 0.5
    }
  } else if (categoryId === "performance") {
    // 性能套件偏好
    if (optionId.includes("sport") && userData.preferences.some((p) => p.id === "acceleration" && p.value > 3)) {
      score += 0.5
    }
  }

  return score
}

// 获取推荐配置选项
export function getRecommendedOptions(carId: string, categoryId: string): ConfigOption[] {
  const userData = getUserData()
  const configCategories = getCarConfigOptions(carId)
  const category = configCategories.find((cat) => cat.id === categoryId)

  if (!category) return []

  // 计算每个选项的匹配分数
  const optionScores = category.options.map((option) => {
    return {
      option,
      score: calculateOptionMatchScore(categoryId, option.id, userData),
    }
  })

  // 按分数排序
  return optionScores.sort((a, b) => b.score - a.score).map((item) => item.option)
}

