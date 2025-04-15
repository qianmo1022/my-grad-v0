# 项目核心模块 PlantUML 图表

本文档包含项目中三个核心模块（用户认证模块、车辆配置模块和订单管理模块）的 PlantUML 图表，包括功能结构图、类图和时序图。

## 1. 用户认证模块

### 1.1 功能结构图

```plantuml
@startuml 用户认证模块功能结构图

left to right direction

package "用户认证模块" {
  [用户注册] as Register
  [用户登录] as Login
  [身份验证] as Auth
  [会话管理] as Session
  [权限控制] as Permission
  [密码管理] as Password
}

Register --> Auth
Login --> Auth
Auth --> Session
Session --> Permission
Auth --> Password

@enduml
```

### 1.2 类图

```plantuml
@startuml 用户认证模块类图

package "用户认证模块" {
  class User {
    +id: String
    +email: String
    +password: String
    +firstName: String
    +lastName: String
    +createdAt: DateTime
    +updatedAt: DateTime
  }
  
  class Dealer {
    +id: String
    +email: String
    +password: String
    +name: String
    +businessId: String
    +phone: String
    +logo: String
    +businessName: String
    +address: String
    +city: String
    +province: String
    +postalCode: String
    +businessHours: String
    +description: String
    +createdAt: DateTime
    +updatedAt: DateTime
  }
  
  class AuthService {
    +authorize(credentials): User|Dealer|null
    +createSession(user): Session
    +validateSession(token): boolean
    +getSession(token): Session
  }
  
  class Session {
    +token: String
    +userId: String
    +expires: DateTime
    +userType: String
  }
}

User "1" -- "*" Session : has >
Dealer "1" -- "*" Session : has >
AuthService -- User : authenticates >
AuthService -- Dealer : authenticates >
AuthService -- Session : manages >

@enduml
```

### 1.3 时序图

```plantuml
@startuml 用户认证模块时序图

actor 用户
participant "登录页面" as LoginPage
participant "认证API" as AuthAPI
participant "认证服务" as AuthService
participant "数据库" as DB

用户 -> LoginPage : 输入邮箱和密码
LoginPage -> AuthAPI : 提交登录请求
AuthAPI -> AuthService : 调用authorize方法
AuthService -> DB : 查询用户信息
DB --> AuthService : 返回用户数据
AuthService -> AuthService : 验证密码

alt 认证成功
  AuthService -> AuthService : 创建JWT令牌
  AuthService --> AuthAPI : 返回认证成功和令牌
  AuthAPI --> LoginPage : 返回认证成功和用户信息
  LoginPage --> 用户 : 显示登录成功，重定向到首页
else 认证失败
  AuthService --> AuthAPI : 返回认证失败
  AuthAPI --> LoginPage : 返回认证失败
  LoginPage --> 用户 : 显示错误信息
end

@enduml
```

## 2. 车辆配置模块

### 2.1 功能结构图

```plantuml
@startuml 车辆配置模块功能结构图

left to right direction

package "车辆配置模块" {
  [车型选择] as CarSelection
  [外观配置] as ExteriorConfig
  [内饰配置] as InteriorConfig
  [轮毂配置] as WheelConfig
  [选装配置] as OptionalConfig
  [价格计算] as PriceCalculation
  [配置保存] as ConfigSave
  [配置预览] as ConfigPreview
  [推荐配置] as RecommendConfig
}

CarSelection --> ExteriorConfig
CarSelection --> InteriorConfig
CarSelection --> WheelConfig
CarSelection --> OptionalConfig
ExteriorConfig --> PriceCalculation
InteriorConfig --> PriceCalculation
WheelConfig --> PriceCalculation
OptionalConfig --> PriceCalculation
PriceCalculation --> ConfigSave
PriceCalculation --> ConfigPreview
RecommendConfig --> OptionalConfig

@enduml
```

### 2.2 类图

```plantuml
@startuml 车辆配置模块类图

package "车辆配置模块" {
  class Car {
    +id: String
    +name: String
    +basePrice: Float
    +description: String
    +thumbnail: String
    +defaultColor: String
    +status: String
    +createdAt: DateTime
    +updatedAt: DateTime
  }
  
  class CarConfigCategory {
    +id: String
    +categoryKey: String
    +name: String
    +description: String
    +createdAt: DateTime
    +updatedAt: DateTime
  }
  
  class CarConfigOption {
    +id: String
    +optionKey: String
    +name: String
    +description: String
    +price: Float
    +thumbnail: String
    +colorCode: String
    +createdAt: DateTime
    +updatedAt: DateTime
    +carId: String
    +categoryId: String
  }
  
  class SavedConfiguration {
    +id: String
    +options: Json
    +timestamp: DateTime
    +createdAt: DateTime
    +updatedAt: DateTime
    +userId: String
    +carId: String
    +totalPrice: Float
  }
  
  class Configurator {
    +carId: String
    +selectedOptions: Map<String, ConfigOption>
    +totalPrice: Float
    +selectOption(categoryId, option): void
    +calculatePrice(): Float
    +saveConfiguration(): SavedConfiguration
    +loadConfiguration(configId): void
  }
}

Car "1" -- "*" CarConfigOption : has >
CarConfigCategory "1" -- "*" CarConfigOption : contains >
Car "1" -- "*" SavedConfiguration : has >
Configurator -- Car : configures >
Configurator -- CarConfigOption : selects >
Configurator -- SavedConfiguration : creates >

@enduml
```

### 2.3 时序图

```plantuml
@startuml 车辆配置模块时序图

actor 用户
participant "配置页面" as ConfigPage
participant "配置器组件" as Configurator
participant "配置API" as ConfigAPI
participant "数据库" as DB

用户 -> ConfigPage : 访问车辆配置页面
ConfigPage -> ConfigAPI : 获取车辆信息
ConfigAPI -> DB : 查询车辆数据
DB --> ConfigAPI : 返回车辆数据
ConfigAPI --> ConfigPage : 返回车辆信息

ConfigPage -> ConfigAPI : 获取配置选项
ConfigAPI -> DB : 查询配置选项
DB --> ConfigAPI : 返回配置选项
ConfigAPI --> ConfigPage : 返回配置选项

ConfigPage -> Configurator : 初始化配置器
Configurator -> Configurator : 设置默认选项

loop 用户选择配置
  用户 -> ConfigPage : 选择配置选项
  ConfigPage -> Configurator : 更新选择的选项
  Configurator -> Configurator : 计算总价
  Configurator --> ConfigPage : 更新UI显示
  ConfigPage --> 用户 : 显示更新后的配置和价格
end

用户 -> ConfigPage : 保存配置
ConfigPage -> Configurator : 请求保存配置
Configurator -> ConfigAPI : 发送保存请求
ConfigAPI -> DB : 存储配置信息
DB --> ConfigAPI : 返回保存结果
ConfigAPI --> Configurator : 返回保存结果
Configurator --> ConfigPage : 显示保存成功
ConfigPage --> 用户 : 显示保存成功消息

@enduml
```

## 3. 订单管理模块

### 3.1 功能结构图

```plantuml
@startuml 订单管理模块功能结构图

left to right direction

package "订单管理模块" {
  [订单创建] as OrderCreate
  [订单查询] as OrderQuery
  [订单状态管理] as OrderStatus
  [订单支付] as OrderPayment
  [订单通知] as OrderNotification
  [订单统计] as OrderStatistics
  [客户管理] as CustomerManagement
}

OrderCreate --> OrderStatus
OrderCreate --> OrderPayment
OrderCreate --> OrderNotification
OrderQuery --> OrderStatus
OrderStatus --> OrderNotification
OrderPayment --> OrderStatus
OrderStatus --> OrderStatistics
OrderStatistics --> CustomerManagement

@enduml
```

### 3.2 类图

```plantuml
@startuml 订单管理模块类图

package "订单管理模块" {
  class Order {
    +id: String
    +amount: Float
    +status: String
    +createdAt: DateTime
    +updatedAt: DateTime
    +userId: String
    +dealerId: String
    +carId: String
    +configuration: Json
    +customerId: String
  }
  
  class Customer {
    +id: String
    +name: String
    +email: String
    +phone: String
    +status: String
    +totalSpent: Float
    +lastOrderDate: DateTime
    +createdAt: DateTime
    +updatedAt: DateTime
    +dealerId: String
  }
  
  class Notification {
    +id: String
    +type: NotificationType
    +title: String
    +message: String
    +read: Boolean
    +link: String
    +createdAt: DateTime
    +updatedAt: DateTime
    +userId: String
  }
  
  enum NotificationType {
    SYSTEM
    ORDER
    REVIEW
    PROMOTION
  }
  
  class OrderService {
    +createOrder(configId, userId, dealerId): Order
    +getOrders(userId): Order[]
    +updateOrderStatus(orderId, status): Order
    +notifyOrderStatusChange(order): void
  }
}

Order "*" -- "1" Customer : belongs to >
Order -- Notification : triggers >
OrderService -- Order : manages >
OrderService -- Notification : creates >
Notification -- NotificationType : has type >

@enduml
```

### 3.3 时序图

```plantuml
@startuml 订单管理模块时序图

actor 用户
participant "结账页面" as CheckoutPage
participant "订单API" as OrderAPI
participant "订单服务" as OrderService
participant "通知服务" as NotificationService
participant "数据库" as DB

用户 -> CheckoutPage : 提交订单
CheckoutPage -> OrderAPI : 创建订单请求
OrderAPI -> OrderService : 调用创建订单方法
OrderService -> DB : 保存订单信息
DB --> OrderService : 返回订单数据

OrderService -> NotificationService : 创建订单通知
NotificationService -> DB : 保存用户通知
NotificationService -> DB : 保存经销商通知

OrderService --> OrderAPI : 返回订单信息
OrderAPI --> CheckoutPage : 返回订单创建结果
CheckoutPage --> 用户 : 显示订单创建成功

== 订单状态更新 ==

actor 经销商
participant "订单管理页面" as OrderManagePage

经销商 -> OrderManagePage : 更新订单状态
OrderManagePage -> OrderAPI : 发送状态更新请求
OrderAPI -> OrderService : 调用更新状态方法
OrderService -> DB : 更新订单状态
DB --> OrderService : 返回更新结果

OrderService -> NotificationService : 创建状态变更通知
NotificationService -> DB : 保存状态变更通知

OrderService --> OrderAPI : 返回更新结果
OrderAPI --> OrderManagePage : 返回状态更新结果
OrderManagePage --> 经销商 : 显示状态更新成功

@enduml
```