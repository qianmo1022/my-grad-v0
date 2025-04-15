# 汽车3D可视化配置系统 - 完整实体关系图 (ER Diagram)

## 完整系统实体关系图

```mermaid
erDiagram
    %% 用户相关实体关系
    User ||--o{ UserPreference : "拥有"
    User ||--o{ BrowsingHistory : "产生"
    User ||--o{ SavedConfiguration : "保存"
    User ||--o{ Order : "下单"
    User ||--o{ Review : "发表"
    User ||--o{ ReviewHelpful : "标记有用"
    User ||--o{ Notification : "接收"
    
    %% 经销商相关实体关系
    Dealer ||--o{ Customer : "管理"
    Dealer ||--o{ SalesData : "拥有"
    Dealer ||--o{ Order : "处理"
    Dealer ||--o{ Car : "提供"
    
    %% 车辆相关实体关系
    Car ||--o{ CarFeature : "具有"
    Car ||--o{ CarConfigOption : "提供"
    Car ||--o{ BrowsingHistory : "被浏览"
    Car ||--o{ SavedConfiguration : "被配置"
    Car ||--o{ Order : "被订购"
    Car ||--o{ Review : "被评价"
    
    CarConfigCategory ||--o{ CarConfigOption : "包含"
    
    %% 交互相关实体关系
    Review ||--o{ ReviewHelpful : "获得"
    Customer ||--o{ Order : "关联"
```

## 分组实体关系图

### 用户相关实体

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string password
        string firstName
        string lastName
        datetime createdAt
        datetime updatedAt
    }
    
    UserPreference {
        string id PK
        string name
        int value
        datetime createdAt
        datetime updatedAt
        string userId FK
    }
    
    BrowsingHistory {
        string id PK
        datetime timestamp
        int duration
        datetime createdAt
        datetime updatedAt
        string userId FK
        string carId FK
    }
    
    SavedConfiguration {
        string id PK
        json options
        datetime timestamp
        float totalPrice
        datetime createdAt
        datetime updatedAt
        string userId FK
        string carId FK
    }
    
    Notification {
        string id PK
        enum type
        string title
        string message
        boolean read
        string link
        datetime createdAt
        datetime updatedAt
        string userId FK
    }
    
    User ||--o{ UserPreference : "拥有"
    User ||--o{ BrowsingHistory : "产生"
    User ||--o{ SavedConfiguration : "保存"
    User ||--o{ Notification : "接收"
```

### 经销商相关实体

```mermaid
erDiagram
    Dealer {
        string id PK
        string email UK
        string password
        string name
        string businessId UK
        string phone
        string logo
        string businessName
        string address
        string city
        string province
        string postalCode
        string businessHours
        string description
        datetime createdAt
        datetime updatedAt
    }
    
    Customer {
        string id PK
        string name
        string email UK
        string phone
        string status
        float totalSpent
        datetime lastOrderDate
        datetime createdAt
        datetime updatedAt
        string dealerId FK
    }
    
    SalesData {
        string id PK
        datetime date
        float revenue
        int orderCount
        string period
        datetime createdAt
        datetime updatedAt
        string dealerId FK
    }
    
    Dealer ||--o{ Customer : "管理"
    Dealer ||--o{ SalesData : "拥有"
    Dealer ||--o{ Car : "提供"
```

### 车辆相关实体

```mermaid
erDiagram
    Car {
        string id PK
        string name
        float basePrice
        string description
        string thumbnail
        string defaultColor
        string status
        datetime createdAt
        datetime updatedAt
        string dealerId FK
    }
    
    CarFeature {
        string id PK
        string featureKey
        string name
        int score
        datetime createdAt
        datetime updatedAt
        string carId FK
    }
    
    CarConfigCategory {
        string id PK
        string categoryKey
        string name
        string description
        datetime createdAt
        datetime updatedAt
    }
    
    CarConfigOption {
        string id PK
        string optionKey
        string name
        string description
        float price
        string thumbnail
        string colorCode
        datetime createdAt
        datetime updatedAt
        string carId FK
        string categoryId FK
    }
    
    Car ||--o{ CarFeature : "具有"
    Car ||--o{ CarConfigOption : "提供"
    CarConfigCategory ||--o{ CarConfigOption : "包含"
```

### 交互相关实体

```mermaid
erDiagram
    Order {
        string id PK
        float amount
        string status
        json configuration
        datetime createdAt
        datetime updatedAt
        string userId FK
        string dealerId FK
        string carId FK
        string customerId FK
    }
    
    Review {
        string id PK
        string title
        string content
        int rating
        int helpful
        boolean verified
        array images
        array tags
        string configurationId
        datetime createdAt
        datetime updatedAt
        string userId FK
        string carId FK
    }
    
    ReviewHelpful {
        string id PK
        string reviewId FK
        string userId FK
        datetime createdAt
    }
    
    User ||--o{ Order : "下单"
    User ||--o{ Review : "发表"
    User ||--o{ ReviewHelpful : "标记有用"
    
    Car ||--o{ Order : "被订购"
    Car ||--o{ Review : "被评价"
    
    Dealer ||--o{ Order : "处理"
    Customer ||--o{ Order : "关联"
    
    Review ||--o{ ReviewHelpful : "获得"
```

## 实体属性说明

### User (用户)
- **id**: UUID (主键)
- **email**: String (唯一)
- **password**: String
- **firstName**: String (可选)
- **lastName**: String (可选)
- **createdAt**: DateTime
- **updatedAt**: DateTime

### Dealer (经销商)
- **id**: UUID (主键)
- **email**: String (唯一)
- **password**: String
- **name**: String
- **businessId**: String (唯一)
- **phone**: String (可选)
- **logo**: String (可选)
- **businessName**: String (可选)
- **address**: String (可选)
- **city**: String (可选)
- **province**: String (可选)
- **postalCode**: String (可选)
- **businessHours**: String (可选)
- **description**: String (可选)
- **createdAt**: DateTime
- **updatedAt**: DateTime

### Car (汽车)
- **id**: String (主键)
- **name**: String
- **basePrice**: Float
- **description**: String
- **thumbnail**: String
- **defaultColor**: String
- **status**: String (默认: "active")
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **dealerId**: String (外键, 可选)

### CarConfigCategory (汽车配置类别)
- **id**: UUID (主键)
- **categoryKey**: String
- **name**: String
- **description**: String
- **createdAt**: DateTime
- **updatedAt**: DateTime

### CarConfigOption (汽车配置选项)
- **id**: UUID (主键)
- **optionKey**: String
- **name**: String
- **description**: String
- **price**: Float
- **thumbnail**: String (可选)
- **colorCode**: String (可选)
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **carId**: String (外键)
- **categoryId**: String (外键)

### CarFeature (汽车特性)
- **id**: UUID (主键)
- **featureKey**: String
- **name**: String
- **score**: Int
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **carId**: String (外键)

### SavedConfiguration (保存的配置)
- **id**: UUID (主键)
- **options**: Json
- **timestamp**: DateTime
- **totalPrice**: Float
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **userId**: String (外键)
- **carId**: String (外键)

### Order (订单)
- **id**: UUID (主键)
- **amount**: Float
- **status**: String
- **configuration**: Json
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **userId**: String (外键)
- **dealerId**: String (外键)
- **carId**: String (外键)
- **customerId**: String (外键, 可选)

### Customer (客户)
- **id**: UUID (主键)
- **name**: String
- **email**: String (唯一)
- **phone**: String (可选)
- **status**: String (默认: "active")
- **totalSpent**: Float (默认: 0)
- **lastOrderDate**: DateTime (可选)
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **dealerId**: String (外键)

### SalesData (销售数据)
- **id**: UUID (主键)
- **date**: DateTime
- **revenue**: Float
- **orderCount**: Int
- **period**: String
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **dealerId**: String (外键)

### UserPreference (用户偏好)
- **id**: UUID (主键)
- **name**: String
- **value**: Int
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **userId**: String (外键)

### BrowsingHistory (浏览历史)
- **id**: UUID (主键)
- **timestamp**: DateTime
- **duration**: Int
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **userId**: String (外键)
- **carId**: String (外键)

### Review (评论)
- **id**: UUID (主键)
- **title**: String
- **content**: String
- **rating**: Int
- **helpful**: Int (默认: 0)
- **verified**: Boolean (默认: false)
- **images**: String[]
- **tags**: String[]
- **configurationId**: String (可选)
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **userId**: String (外键)
- **carId**: String (外键)

### ReviewHelpful (评论有用标记)
- **id**: UUID (主键)
- **reviewId**: String (外键)
- **userId**: String (外键)
- **createdAt**: DateTime

### Notification (通知)
- **id**: UUID (主键)
- **type**: NotificationType (枚举)
- **title**: String
- **message**: String
- **read**: Boolean (默认: false)
- **link**: String (可选)
- **createdAt**: DateTime
- **updatedAt**: DateTime
- **userId**: String (外键)

### NotificationType (通知类型枚举)
- SYSTEM
- ORDER
- REVIEW
- PROMOTION