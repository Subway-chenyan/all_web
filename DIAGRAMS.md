# System Architecture Diagrams - Chinese Freelance Marketplace

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WebApp[Web Application]
        MobileApp[Mobile App]
        AdminPanel[Admin Panel]
    end

    subgraph "CDN & Load Balancer"
        CDN[Content Delivery Network]
        LB[Load Balancer]
    end

    subgraph "Web Servers"
        WS1[Web Server 1<br/>Django]
        WS2[Web Server 2<br/>Django]
        WS3[Web Server 3<br/>Django]
    end

    subgraph "Application Services"
        API[REST API<br/>Django REST Framework]
        Auth[Authentication Service<br/>JWT]
        Payment[Payment Service<br/>Alipay/WeChat Pay]
        Search[Search Service<br/>Elasticsearch]
        Notification[Notification Service<br/>WebSocket]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Primary)]
        DB1[(PostgreSQL<br/>Read Replica 1)]
        DB2[(PostgreSQL<br/>Read Replica 2)]

        Cache[(Redis<br/>Cache)]
        MQ[(Redis<br/>Message Queue)]

        ES[(Elasticsearch<br/>Search)]
        Storage[(S3/Alibaba Cloud<br/>File Storage)]
    end

    subgraph "Background Workers"
        CW1[Celery Worker 1]
        CW2[Celery Worker 2]
        CB[Celery Beat<br/>Scheduler]
    end

    subgraph "External Services"
        Email[Email Service]
        SMS[SMS Service]
        PaymentGW[Payment Gateways]
    end

    WebApp --> CDN
    MobileApp --> CDN
    AdminPanel --> CDN
    CDN --> LB
    LB --> WS1
    LB --> WS2
    LB --> WS3

    WS1 --> API
    WS2 --> API
    WS3 --> API

    API --> Auth
    API --> Payment
    API --> Search
    API --> Notification

    API --> DB
    API --> DB1
    API --> DB2
    API --> Cache
    API --> MQ
    API --> Storage

    Search --> ES
    Notification --> MQ

    MQ --> CW1
    MQ --> CW2
    CB --> MQ

    CW1 --> Email
    CW2 --> SMS
    Payment --> PaymentGW
```

## 2. Database Schema Relationships

```mermaid
erDiagram
    User ||--o{ Service : creates
    User ||--o{ Order : places
    User ||--|| FreelancerProfile : has
    User ||--|| ClientProfile : has
    User ||--o{ Review : writes
    User ||--o{ Message : sends
    User ||--|| Wallet : owns

    Service ||--o{ Order : generates
    Service }|--|| Category : belongs_to
    Service ||--o{ Review : receives
    Service ||--o{ ServicePackage : has
    Service }o--o{ Skill : requires

    Category ||--o{ Skill : contains
    Category ||--o{ Service : includes

    Order ||--o| OrderDelivery : has
    Order ||--o{ OrderRevision : has
    Order ||--|| Review : has
    Order ||--o{ Transaction : creates

    Message }o--o{ Conversation : part_of
    Conversation ||--o{ Message : contains

    User {
        int id PK
        string username
        string email
        string user_type
        string phone
        boolean is_verified
        datetime created_at
    }

    FreelancerProfile {
        int id PK
        int user_id FK
        text bio
        decimal hourly_rate
        decimal rating
        int response_rate
        string location
    }

    ClientProfile {
        int id PK
        int user_id FK
        string company_name
        string industry
        string location
    }

    Service {
        int id PK
        int freelancer_id FK
        string title
        string title_zh
        text description
        int category_id FK
        decimal basic_price
        string status
        decimal rating
        int views_count
        datetime created_at
    }

    Category {
        int id PK
        string name
        string name_zh
        int parent_id FK
        boolean is_active
    }

    Skill {
        int id PK
        string name
        string name_zh
        int category_id FK
    }

    Order {
        int id PK
        string order_number
        int client_id FK
        int freelancer_id FK
        int service_id FK
        decimal total_amount
        string status
        string payment_status
        datetime delivery_deadline
        datetime created_at
    }

    Review {
        int id PK
        int order_id FK
        int client_id FK
        int freelancer_id FK
        int rating
        text comment
        datetime created_at
    }

    Message {
        int id PK
        int conversation_id FK
        int sender_id FK
        string message_type
        text content
        boolean is_read
        datetime created_at
    }

    Transaction {
        int id PK
        string transaction_id
        int user_id FK
        int order_id FK
        string type
        decimal amount
        decimal balance_after
        string status
        datetime created_at
    }
```

## 3. API Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant LoadBalancer
    participant WebServer
    participant API
    participant Auth
    participant Cache
    participant Database
    participant Redis

    Client->>LoadBalancer: HTTP Request
    LoadBalancer->>WebServer: Forward Request

    WebServer->>API: Django View
    API->>Auth: JWT Validation
    Auth-->>API: User Context

    alt Cache Hit
        API->>Cache: Check Cache
        Cache-->>API: Cached Data
    else Cache Miss
        API->>Database: Query Data
        Database-->>API: Query Results
        API->>Cache: Store in Cache
    end

    API->>Redis: Session/Rate Limiting
    Redis-->>API: Rate Limit Status

    API-->>WebServer: Response Data
    WebServer-->>LoadBalancer: HTTP Response
    LoadBalancer-->>Client: Response
```

## 4. Order Processing Flow

```mermaid
flowchart TD
    A[Client Orders Service] --> B{Payment Status}
    B -->|Success| C[Create Order]
    B -->|Failed| D[Payment Error]

    C --> E[Freeze Client Funds]
    E --> F[Notify Freelancer]
    F --> G[Freelancer Accepts]
    G --> H[Order in Progress]

    H --> I[Freelancer Delivers]
    I --> J{Client Review}
    J -->|Accept| K[Complete Order]
    J -->|Request Revision| L[Create Revision Request]

    L --> M[Freelancer Revises]
    M --> I

    K --> N[Release Funds to Freelancer]
    N --> O[Request Reviews]
    O --> P[Order Completed]

    D --> Q[Retry Payment]
    Q --> A
```

## 5. Caching Strategy

```mermaid
graph LR
    subgraph "Cache Layers"
        L1[L1 Cache<br/>Application Memory]
        L2[L2 Cache<br/>Redis]
        L3[L3 Cache<br/>Database Query Cache]
    end

    subgraph "Cache Types"
        SC[Service Catalog]
        UP[User Profiles]
        ST[Search Results]
        SS[Session Storage]
        RL[Rate Limiting]
    end

    subgraph "Cache Invalidation"
        TTL[Time-based Expiration]
        Event[Event-driven Invalidation]
        Manual[Manual Clear]
    end

    Request[API Request] --> L1
    L1 -->|Miss| L2
    L2 -->|Miss| L3
    L3 -->|Miss| Database

    SC --> L2
    UP --> L1
    ST --> L2
    SS --> L2
    RL --> L2

    L2 --> TTL
    L2 --> Event
    L1 --> Manual
```

## 6. Microservices Communication

```mermaid
graph TB
    subgraph "API Gateway"
        Gateway[Nginx + API Gateway]
    end

    subgraph "Core Services"
        UserService[User Service]
        ServiceService[Service Service]
        OrderService[Order Service]
        PaymentService[Payment Service]
        MessageService[Message Service]
        NotificationService[Notification Service]
    end

    subgraph "Supporting Services"
        SearchService[Search Service]
        FileService[File Service]
        EmailService[Email Service]
        SMSService[SMS Service]
    end

    subgraph "Data Stores"
        UserDB[(User DB)]
        ServiceDB[(Service DB)]
        OrderDB[(Order DB)]
        SearchDB[(Elasticsearch)]
        FileStorage[(File Storage)]
    end

    subgraph "Message Queue"
        Queue[Redis/RabbitMQ]
    end

    Gateway --> UserService
    Gateway --> ServiceService
    Gateway --> OrderService
    Gateway --> PaymentService
    Gateway --> MessageService
    Gateway --> NotificationService

    UserService --> UserDB
    ServiceService --> ServiceDB
    OrderService --> OrderDB
    SearchService --> SearchDB
    FileService --> FileStorage

    UserService --> Queue
    OrderService --> Queue
    PaymentService --> Queue
    NotificationService --> Queue

    NotificationService --> EmailService
    NotificationService --> SMSService

    ServiceService --> SearchService
    MessageService --> FileService
```

## 7. Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Web Tier"
            LB1[Load Balancer 1]
            LB2[Load Balancer 2]

            WS1[Web Server 1]
            WS2[Web Server 2]
            WS3[Web Server 3]
            WS4[Web Server 4]
        end

        subgraph "Application Tier"
            API1[API Server 1]
            API2[API Server 2]
            API3[API Server 3]

            Worker1[Celery Worker 1]
            Worker2[Celery Worker 2]
            Worker3[Celery Worker 3]

            Beat[Celery Beat]
        end

        subgraph "Data Tier"
            DB_Master[(PostgreSQL Master)]
            DB_Slave1[(PostgreSQL Slave 1)]
            DB_Slave2[(PostgreSQL Slave 2)]

            Redis_Master[(Redis Master)]
            Redis_Slave[(Redis Slave)]

            ES1[(Elasticsearch 1)]
            ES2[(Elasticsearch 2)]
            ES3[(Elasticsearch 3)]
        end

        subgraph "Storage"
            S3[S3 Bucket]
            CDN[CDN]
        end
    end

    subgraph "Monitoring"
        Monitoring[Monitoring Stack]
        Logging[Logging Stack]
        Alerting[Alerting System]
    end

    LB1 --> WS1
    LB1 --> WS2
    LB2 --> WS3
    LB2 --> WS4

    WS1 --> API1
    WS2 --> API2
    WS3 --> API3

    API1 --> DB_Master
    API2 --> DB_Slave1
    API3 --> DB_Slave2

    API1 --> Redis_Master
    API2 --> Redis_Slave

    API1 --> ES1
    API2 --> ES2
    API3 --> ES3

    WS1 --> S3
    CDN --> S3

    Worker1 --> DB_Master
    Worker2 --> DB_Master
    Worker3 --> DB_Master

    Beat --> Worker1
    Beat --> Worker2
    Beat --> Worker3
```

## 8. Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            WAF[Web Application Firewall]
            DDoS[DDoS Protection]
            SSL[SSL/TLS Encryption]
        end

        subgraph "Application Security"
            Auth[Authentication]
            AuthZ[Authorization]
            RateLimit[Rate Limiting]
            Validation[Input Validation]
        end

        subgraph "Data Security"
            Encryption[Data Encryption]
            Backup[Secure Backups]
            Audit[Audit Logging]
        end

        subgraph "Infrastructure Security"
            IAM[Identity & Access Management]
            VPC[Virtual Private Cloud]
            SG[Security Groups]
        end
    end

    subgraph "Threat Protection"
        AntiBot[Anti-Bot Protection]
        AntiSpam[Anti-Spam Filters]
        Monitoring[Security Monitoring]
        Incident[Incident Response]
    end

    User[User Request] --> WAF
    WAF --> DDoS
    DDoS --> SSL
    SSL --> Auth
    Auth --> AuthZ
    AuthZ --> RateLimit
    RateLimit --> Validation
    Validation --> Application[Application Logic]
    Application --> Encryption
    Encryption --> Database[(Database)]

    Application --> Audit
    Audit --> Monitoring
    Monitoring --> Incident
```

These diagrams provide a comprehensive visual representation of the system architecture, showing how different components interact and how data flows through the system. The architecture is designed to be scalable, secure, and maintainable while supporting the specific requirements of a Chinese freelance marketplace platform.