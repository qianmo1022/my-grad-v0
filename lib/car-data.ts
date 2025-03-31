// 汽车数据类型定义
export interface CarModel {
  id: string
  name: string
  basePrice: number
  description: string
  thumbnail: string
  defaultColor: string
}

export interface ConfigCategory {
  id: string
  name: string
  description: string
  options: ConfigOption[]
}

export interface ConfigOption {
  id: string
  name: string
  description: string
  price: number
  thumbnail?: string
  colorCode?: string
}

// 模拟汽车数据
export const carModels: CarModel[] = [
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
  },
  {
    id: "sports-car",
    name: "跑车系列",
    basePrice: 580000,
    description: "极致性能与优雅设计的完美结合",
    thumbnail: "/placeholder.svg?height=300&width=500",
    defaultColor: "#c0392b",
  },
]

// 获取特定车型的配置选项
export function getCarConfigOptions(carId: string): ConfigCategory[] {
  // 所有车型共享的颜色选项
  const colorOptions: ConfigCategory = {
    id: "exterior-color",
    name: "外观颜色",
    description: "选择您喜欢的车身颜色",
    options: [
      { id: "black", name: "曜石黑", description: "经典永恒的黑色", price: 0, colorCode: "#1a1a1a" },
      { id: "white", name: "珍珠白", description: "纯净优雅的白色", price: 0, colorCode: "#f5f5f5" },
      { id: "silver", name: "流星银", description: "现代感十足的银色", price: 0, colorCode: "#c0c0c0" },
      { id: "blue", name: "深海蓝", description: "神秘深邃的蓝色", price: 5000, colorCode: "#0f3460" },
      { id: "red", name: "熔岩红", description: "热情奔放的红色", price: 8000, colorCode: "#c0392b" },
    ],
  }

  // 所有车型共享的轮毂选项
  const wheelOptions: ConfigCategory = {
    id: "wheels",
    name: "轮毂样式",
    description: "选择适合您风格的轮毂",
    options: [
      {
        id: "standard",
        name: "标准轮毂",
        description: "17寸铝合金轮毂",
        price: 0,
        thumbnail: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "sport",
        name: "运动轮毂",
        description: "19寸运动轮毂",
        price: 12000,
        thumbnail: "/placeholder.svg?height=100&width=100",
      },
      {
        id: "luxury",
        name: "豪华轮毂",
        description: "20寸多辐豪华轮毂",
        price: 18000,
        thumbnail: "/placeholder.svg?height=100&width=100",
      },
    ],
  }

  // 根据车型ID返回特定的配置选项
  switch (carId) {
    case "luxury-sedan":
      return [
        colorOptions,
        wheelOptions,
        {
          id: "interior",
          name: "内饰选择",
          description: "选择豪华内饰材质和颜色",
          options: [
            {
              id: "standard-interior",
              name: "标准内饰",
              description: "高级织物座椅",
              price: 0,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "leather",
              name: "真皮内饰",
              description: "Nappa真皮座椅",
              price: 25000,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "premium-leather",
              name: "高级真皮内饰",
              description: "顶级真皮座椅带按摩功能",
              price: 45000,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
          ],
        },
        {
          id: "tech-package",
          name: "科技套件",
          description: "先进的技术配置",
          options: [
            {
              id: "standard-tech",
              name: "标准科技套件",
              description: "基础导航和音响系统",
              price: 0,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "advanced-tech",
              name: "高级科技套件",
              description: "高级导航、环绕音响和增强驾驶辅助",
              price: 35000,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "premium-tech",
              name: "顶级科技套件",
              description: "全套高级驾驶辅助系统和顶级音响",
              price: 60000,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
          ],
        },
      ]
    case "city-suv":
      return [
        colorOptions,
        wheelOptions,
        {
          id: "interior",
          name: "内饰选择",
          description: "选择舒适内饰材质和颜色",
          options: [
            {
              id: "standard-interior",
              name: "标准内饰",
              description: "高级织物座椅",
              price: 0,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "leather",
              name: "真皮内饰",
              description: "真皮座椅",
              price: 18000,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
          ],
        },
        {
          id: "roof",
          name: "车顶选项",
          description: "选择车顶样式",
          options: [
            {
              id: "standard-roof",
              name: "标准车顶",
              description: "标准车顶",
              price: 0,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "panoramic",
              name: "全景天窗",
              description: "大型全景天窗",
              price: 22000,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
          ],
        },
      ]
    case "sports-car":
      return [
        colorOptions,
        wheelOptions,
        {
          id: "performance",
          name: "性能套件",
          description: "提升驾驶性能",
          options: [
            {
              id: "standard-performance",
              name: "标准性能",
              description: "标准发动机和悬挂",
              price: 0,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "sport-performance",
              name: "运动性能套件",
              description: "运动调校发动机和悬挂",
              price: 45000,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "track-performance",
              name: "赛道性能套件",
              description: "赛道级发动机和悬挂调校",
              price: 85000,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
          ],
        },
        {
          id: "interior",
          name: "内饰选择",
          description: "选择运动内饰材质和颜色",
          options: [
            {
              id: "sport-interior",
              name: "运动内饰",
              description: "运动座椅和方向盘",
              price: 0,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
            {
              id: "premium-sport",
              name: "高级运动内饰",
              description: "碳纤维装饰和Alcantara材质",
              price: 38000,
              thumbnail: "/placeholder.svg?height=100&width=100",
            },
          ],
        },
      ]
    default:
      return [colorOptions, wheelOptions]
  }
}

// 获取特定车型信息
export async function getCarById(carId: string): Promise<CarModel | undefined> {
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 100))
  return carModels.find(car => car.id === carId)
}

