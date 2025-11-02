# 数据库架构说明

## 概述

本文档详细描述了中国版Fiverr兼职平台的数据库架构设计。数据库基于PostgreSQL构建，采用UUID主键，支持软删除，包含完整的时间戳和索引策略。

## 技术特点

- **主键类型**: UUID (v4)
- **软删除**: 所有表支持软删除功能
- **时间戳**: 创建时间和更新时间自动管理
- **索引策略**: 针对查询性能优化的复合索引
- **数据完整性**: 外键约束和数据验证
- **本地化**: 支持中文内容存储和显示

## 基础模型结构

### BaseModel 抽象类

所有数据表都继承自以下基础模型：

```python
class BaseModel(UUIDModel, TimeStampedModel, SoftDeleteModel):
    """组合基础模型，包含UUID、时间戳和软删除功能"""
    pass
```

**字段说明**:
- `id`: UUID主键
- `created_at`: 创建时间 (自动设置)
- `updated_at`: 更新时间 (自动更新)
- `is_deleted`: 软删除标记
- `deleted_at`: 删除时间

---

## 1. 用户系统 (accounts)

### 1.1 用户表 (accounts_user)

**表名**: `accounts_user`
**描述**: 扩展的用户模型，支持多种用户类型和中文市场特性

```sql
CREATE TABLE accounts_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('client', 'freelancer', 'admin')),
    user_status VARCHAR(30) DEFAULT 'active' CHECK (user_status IN ('active', 'inactive', 'suspended', 'pending_verification')),
    phone_number VARCHAR(11) UNIQUE,  -- 中国手机号
    wechat_id VARCHAR(50) UNIQUE,     -- 微信号
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_identity_verified BOOLEAN DEFAULT FALSE,
    profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
    last_login_ip INET,
    last_login_location VARCHAR(100),
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    marketing_emails_enabled BOOLEAN DEFAULT FALSE,
    password VARCHAR(128) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    is_staff BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_accounts_user_user_type_status ON accounts_user(user_type, user_status);
CREATE INDEX idx_accounts_user_created_at_status ON accounts_user(created_at, user_status);
CREATE INDEX idx_accounts_user_email_type ON accounts_user(email, user_type);
CREATE INDEX idx_accounts_user_phone_number ON accounts_user(phone_number);
CREATE INDEX idx_accounts_user_wechat_id ON accounts_user(wechat_id);
```

**关键字段**:
- `user_type`: 用户类型 (客户/自由职业者/管理员)
- `phone_number`: 中国手机号码，支持正则验证
- `wechat_id`: 微信号，支持社交登录
- `profile_completion_percentage`: 个人资料完成度

### 1.2 用户资料表 (accounts_user_profile)

**表名**: `accounts_user_profile`
**描述**: 用户详细资料信息

```sql
CREATE TABLE accounts_user_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    bio TEXT,
    avatar VARCHAR(100),  -- 文件路径
    country VARCHAR(50) DEFAULT 'China',
    province VARCHAR(50),  -- 中国省份
    city VARCHAR(100),
    address VARCHAR(500),
    postal_code VARCHAR(20),
    preferred_language VARCHAR(10) DEFAULT 'zh-hans',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    hourly_rate DECIMAL(10,2) CHECK (hourly_rate >= 0),
    years_of_experience INTEGER CHECK (years_of_experience >= 0),
    company_name VARCHAR(200),
    company_registration_number VARCHAR(100),
    company_website VARCHAR(200),
    linkedin_url VARCHAR(200),
    github_url VARCHAR(200),
    portfolio_url VARCHAR(200),
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'unlisted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- 索引
CREATE INDEX idx_accounts_user_profile_user_visibility ON accounts_user_profile(user_id, profile_visibility);
CREATE INDEX idx_accounts_user_profile_location ON accounts_user_profile(province, city);
CREATE INDEX idx_accounts_user_profile_hourly_rate ON accounts_user_profile(hourly_rate);
```

### 1.3 技能表 (accounts_skill)

**表名**: `accounts_skill`
**描述**: 技能分类和描述

```sql
CREATE TABLE accounts_skill (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_accounts_skill_name ON accounts_skill(name);
CREATE INDEX idx_accounts_skill_category ON accounts_skill(category);
```

### 1.4 用户技能关联表 (accounts_user_skill)

**表名**: `accounts_user_skill`
**描述**: 用户与技能的多对多关系

```sql
CREATE TABLE accounts_user_skill (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES accounts_skill(id) ON DELETE CASCADE,
    proficiency_level INTEGER NOT NULL DEFAULT 3 CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    years_experience DECIMAL(4,1) CHECK (years_experience >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, skill_id)
);

-- 索引
CREATE INDEX idx_accounts_user_skill_skill_proficiency ON accounts_user_skill(skill_id, proficiency_level);
CREATE INDEX idx_accounts_user_skill_user_proficiency ON accounts_user_skill(user_id, proficiency_level);
```

### 1.5 教育经历表 (accounts_education)

**表名**: `accounts_education`
**描述**: 用户教育背景

```sql
CREATE TABLE accounts_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    institution_name VARCHAR(200) NOT NULL,
    degree VARCHAR(100) NOT NULL,
    field_of_study VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    gpa DECIMAL(3,2) CHECK (gpa >= 0 AND gpa <= 4.0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_accounts_education_user_current ON accounts_education(user_id, is_current);
CREATE INDEX idx_accounts_education_institution ON accounts_education(institution_name);
CREATE INDEX idx_accounts_education_degree ON accounts_education(degree);
```

### 1.6 工作经历表 (accounts_work_experience)

**表名**: `accounts_work_experience`
**描述**: 用户工作经历

```sql
CREATE TABLE accounts_work_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    company_location VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_accounts_work_experience_user_current ON accounts_work_experience(user_id, is_current);
CREATE INDEX idx_accounts_work_experience_company ON accounts_work_experience(company_name);
CREATE INDEX idx_accounts_work_experience_title ON accounts_work_experience(job_title);
```

### 1.7 作品集表 (accounts_portfolio)

**表名**: `accounts_portfolio`
**描述**: 自由职业者作品集

```sql
CREATE TABLE accounts_portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(100),  -- 文件路径
    file VARCHAR(100),    -- 文件路径
    url VARCHAR(200),
    project_url VARCHAR(200),
    completion_date DATE,
    technologies_used TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_accounts_portfolio_user_featured ON accounts_portfolio(user_id, is_featured);
CREATE INDEX idx_accounts_portfolio_user_public ON accounts_portfolio(user_id, is_public);
CREATE INDEX idx_accounts_portfolio_title ON accounts_portfolio(title);
```

---

## 2. 服务系统 (gigs)

### 2.1 分类表 (gigs_category)

**表名**: `gigs_category`
**描述**: 服务分类，支持层级结构

```sql
CREATE TABLE gigs_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    parent_id UUID REFERENCES gigs_category(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_gigs_category_name ON gigs_category(name);
CREATE INDEX idx_gigs_category_parent_active ON gigs_category(parent_id, is_active);
```

### 2.2 服务表 (gigs_gig)

**表名**: `gigs_gig`
**描述**: 主要的服务/任务模型

```sql
CREATE TABLE gigs_gig (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    freelancer_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES gigs_category(id) ON DELETE PROTECT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'rejected', 'suspended')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    tags TEXT,
    searchable_text TEXT,
    thumbnail VARCHAR(100),
    gallery_images JSONB DEFAULT '[]',
    view_count INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    review_count INTEGER DEFAULT 0,
    slug VARCHAR(200) UNIQUE NOT NULL,
    meta_description VARCHAR(160),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_gigs_gig_freelancer_status ON gigs_gig(freelancer_id, status);
CREATE INDEX idx_gigs_gig_category_status ON gigs_gig(category_id, status);
CREATE INDEX idx_gigs_gig_status_featured ON gigs_gig(status, is_featured);
CREATE INDEX idx_gigs_gig_rating_count ON gigs_gig(average_rating, review_count);
CREATE INDEX idx_gigs_gig_view_count ON gigs_gig(view_count);
CREATE INDEX idx_gigs_gig_order_count ON gigs_gig(order_count);
CREATE INDEX idx_gigs_gig_slug ON gigs_gig(slug);
```

### 2.3 服务套餐表 (gigs_gig_package)

**表名**: `gigs_gig_package`
**描述**: 服务套餐（基础、标准、高级）

```sql
CREATE TABLE gigs_gig_package (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs_gig(id) ON DELETE CASCADE,
    package_type VARCHAR(20) NOT NULL CHECK (package_type IN ('basic', 'standard', 'premium')),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    delivery_days INTEGER NOT NULL CHECK (delivery_days >= 1),
    revisions INTEGER DEFAULT 0 CHECK (revisions >= 0),
    features JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(gig_id, package_type)
);

-- 索引
CREATE INDEX idx_gigs_gig_package_gig_type ON gigs_gig_package(gig_id, package_type);
CREATE INDEX idx_gigs_gig_package_price ON gigs_gig_package(price);
CREATE INDEX idx_gigs_gig_package_delivery ON gigs_gig_package(delivery_days);
```

### 2.4 服务需求表 (gigs_gig_requirement)

**表名**: `gigs_gig_requirement`
**描述**: 客户需要提供的需求信息

```sql
CREATE TABLE gigs_gig_requirement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs_gig(id) ON DELETE CASCADE,
    requirement_text TEXT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    input_type VARCHAR(20) DEFAULT 'text' CHECK (input_type IN ('text', 'textarea', 'file', 'checkbox', 'number')),
    options JSONB DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_gigs_gig_requirement_gig_order ON gigs_gig_requirement(gig_id, sort_order);
```

### 2.5 服务收藏表 (gigs_gig_favorite)

**表名**: `gigs_gig_favorite`
**描述**: 用户收藏的服务

```sql
CREATE TABLE gigs_gig_favorite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    gig_id UUID NOT NULL REFERENCES gigs_gig(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, gig_id)
);

-- 索引
CREATE INDEX idx_gigs_gig_favorite_user ON gigs_gig_favorite(user_id);
CREATE INDEX idx_gigs_gig_favorite_gig ON gigs_gig_favorite(gig_id);
```

---

## 3. 订单系统 (orders)

### 3.1 订单表 (orders_order)

**表名**: `orders_order`
**描述**: 主要订单模型

```sql
CREATE TABLE orders_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE PROTECT,
    freelancer_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE PROTECT,
    gig_id UUID NOT NULL REFERENCES gigs_gig(id) ON DELETE PROTECT,
    gig_package_id UUID NOT NULL REFERENCES gigs_gig_package(id) ON DELETE PROTECT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    client_requirements TEXT,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    extras_price DECIMAL(10,2) DEFAULT 0 CHECK (extras_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    platform_fee DECIMAL(10,2) DEFAULT 0 CHECK (platform_fee >= 0),
    freelancer_earnings DECIMAL(10,2) DEFAULT 0 CHECK (freelancer_earnings >= 0),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'requirements_provided', 'in_progress', 'delivered', 'revision_requested', 'completed', 'cancelled', 'refunded', 'disputed')),
    priority VARCHAR(20) DEFAULT 'standard' CHECK (priority IN ('low', 'standard', 'high', 'urgent')),
    delivery_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_delivery TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    preferred_communication_method VARCHAR(20) DEFAULT 'platform' CHECK (preferred_communication_method IN ('platform', 'email', 'wechat')),
    client_email VARCHAR(254) NOT NULL,
    client_phone VARCHAR(20),
    cancellation_reason TEXT,
    cancelled_by_id UUID REFERENCES accounts_user(id) ON DELETE SET NULL,
    cancellation_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_orders_order_number ON orders_order(order_number);
CREATE INDEX idx_orders_order_client_status ON orders_order(client_id, status);
CREATE INDEX idx_orders_order_freelancer_status ON orders_order(freelancer_id, status);
CREATE INDEX idx_orders_order_gig_status ON orders_order(gig_id, status);
CREATE INDEX idx_orders_order_status_created ON orders_order(status, created_at);
CREATE INDEX idx_orders_order_deadline ON orders_order(delivery_deadline);
CREATE INDEX idx_orders_order_estimated_delivery ON orders_order(estimated_delivery);
CREATE INDEX idx_orders_order_total_price ON orders_order(total_price);
CREATE INDEX idx_orders_order_priority ON orders_order(priority);
```

### 3.2 订单状态历史表 (orders_order_status_history)

**表名**: `orders_order_status_history`
**描述**: 订单状态变更历史

```sql
CREATE TABLE orders_order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders_order(id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by_id UUID REFERENCES accounts_user(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_orders_order_status_history_order_created ON orders_order_status_history(order_id, created_at);
CREATE INDEX idx_orders_order_status_history_new_status_created ON orders_order_status_history(new_status, created_at);
```

### 3.3 订单需求表 (orders_order_requirement)

**表名**: `orders_order_requirement`
**描述**: 订单的具体需求

```sql
CREATE TABLE orders_order_requirement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders_order(id) ON DELETE CASCADE,
    requirement_text TEXT NOT NULL,
    response TEXT,
    is_provided BOOLEAN DEFAULT FALSE,
    provided_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_orders_order_requirement_order_provided ON orders_order_requirement(order_id, is_provided);
```

### 3.4 交付表 (orders_delivery)

**表名**: `orders_delivery`
**描述**: 订单交付文件

```sql
CREATE TABLE orders_delivery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders_order(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    message TEXT,
    files JSONB DEFAULT '[]',
    file_count INTEGER DEFAULT 0,
    is_final_delivery BOOLEAN DEFAULT FALSE,
    is_accepted BOOLEAN,
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT,
    revision_number INTEGER DEFAULT 1,
    previous_delivery_id UUID REFERENCES orders_delivery(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_orders_delivery_order_final ON orders_delivery(order_id, is_final_delivery);
CREATE INDEX idx_orders_delivery_order_accepted ON orders_delivery(order_id, is_accepted);
CREATE INDEX idx_orders_delivery_created_at ON orders_delivery(created_at);
```

---

## 4. 消息系统 (messaging)

### 4.1 对话表 (messaging_conversation)

**表名**: `messaging_conversation`
**描述**: 用户间的对话

```sql
CREATE TABLE messaging_conversation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    conversation_type VARCHAR(20) DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'order', 'gig_inquiry', 'support')),
    subject VARCHAR(200),
    order_id UUID REFERENCES orders_order(id) ON DELETE SET NULL,
    gig_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived_by_participant1 BOOLEAN DEFAULT FALSE,
    is_archived_by_participant2 BOOLEAN DEFAULT FALSE,
    last_message_id UUID REFERENCES messaging_message(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE,
    participant1_unread_count INTEGER DEFAULT 0,
    participant2_unread_count INTEGER DEFAULT 0,
    is_blocked_by_participant1 BOOLEAN DEFAULT FALSE,
    is_blocked_by_participant2 BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_messaging_conversation_participant1_active ON messaging_conversation(participant1_id, is_active);
CREATE INDEX idx_messaging_conversation_participant2_active ON messaging_conversation(participant2_id, is_active);
CREATE INDEX idx_messaging_conversation_type ON messaging_conversation(conversation_type);
CREATE INDEX idx_messaging_conversation_order ON messaging_conversation(order_id);
CREATE INDEX idx_messaging_conversation_gig_id ON messaging_conversation(gig_id);
CREATE INDEX idx_messaging_conversation_last_message_at ON messaging_conversation(last_message_at);
CREATE INDEX idx_messaging_conversation_p1_unread ON messaging_conversation(participant1_unread_count);
CREATE INDEX idx_messaging_conversation_p2_unread ON messaging_conversation(participant2_unread_count);
```

### 4.2 消息表 (messaging_message)

**表名**: `messaging_message`
**描述**: 对话中的具体消息

```sql
CREATE TABLE messaging_message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES messaging_conversation(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'system', 'order_update', 'gig_recommendation')),
    content TEXT,
    attachments JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
    reply_to_id UUID REFERENCES messaging_message(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_messaging_message_conversation_created ON messaging_message(conversation_id, created_at);
CREATE INDEX idx_messaging_message_sender ON messaging_message(sender_id);
CREATE INDEX idx_messaging_message_recipient ON messaging_message(recipient_id);
CREATE INDEX idx_messaging_message_type ON messaging_message(message_type);
CREATE INDEX idx_messaging_message_is_read ON messaging_message(is_read);
CREATE INDEX idx_messaging_message_reply_to ON messaging_message(reply_to_id);
CREATE INDEX idx_messaging_message_created_at ON messaging_message(created_at);
```

### 4.3 消息附件表 (messaging_message_attachment)

**表名**: `messaging_message_attachment`
**描述**: 消息的文件附件

```sql
CREATE TABLE messaging_message_attachment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messaging_message(id) ON DELETE CASCADE,
    file VARCHAR(100) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    duration INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_messaging_message_attachment_message ON messaging_message_attachment(message_id);
CREATE INDEX idx_messaging_message_attachment_file_type ON messaging_message_attachment(file_type);
```

---

## 5. 评价系统 (reviews)

### 5.1 评价表 (reviews_review)

**表名**: `reviews_review`
**描述**: 用户评价和评分

```sql
CREATE TABLE reviews_review (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders_order(id) ON DELETE CASCADE,
    gig_id UUID REFERENCES gigs_gig(id) ON DELETE CASCADE,
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('freelancer', 'client', 'gig')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'hidden', 'flagged', 'removed')),
    is_visible BOOLEAN DEFAULT FALSE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    title VARCHAR(200),
    content TEXT,
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    response_helpful_count INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason VARCHAR(200),
    moderated_by_id UUID REFERENCES accounts_user(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(reviewer_id, order_id, review_type)
);

-- 索引
CREATE INDEX idx_reviews_review_reviewer_status ON reviews_review(reviewer_id, status);
CREATE INDEX idx_reviews_review_reviewee_status ON reviews_review(reviewee_id, status);
CREATE INDEX idx_reviews_review_order ON reviews_review(order_id);
CREATE INDEX idx_reviews_review_gig ON reviews_review(gig_id);
CREATE INDEX idx_reviews_review_type_status ON reviews_review(review_type, status);
CREATE INDEX idx_reviews_review_rating ON reviews_review(rating);
CREATE INDEX idx_reviews_review_is_visible ON reviews_review(is_visible);
CREATE INDEX idx_reviews_review_is_flagged ON reviews_review(is_flagged);
CREATE INDEX idx_reviews_review_created_at ON reviews_review(created_at);
```

### 5.2 用户评分汇总表 (reviews_user_rating)

**表名**: `reviews_user_rating`
**描述**: 用户评分汇总统计

```sql
CREATE TABLE reviews_user_rating (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    overall_rating DECIMAL(3,2) DEFAULT 0 CHECK (overall_rating >= 0 AND overall_rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    communication_rating DECIMAL(3,2) DEFAULT 0 CHECK (communication_rating >= 0 AND communication_rating <= 5),
    quality_rating DECIMAL(3,2) DEFAULT 0 CHECK (quality_rating >= 0 AND quality_rating <= 5),
    delivery_rating DECIMAL(3,2) DEFAULT 0 CHECK (delivery_rating >= 0 AND delivery_rating <= 5),
    value_rating DECIMAL(3,2) DEFAULT 0 CHECK (value_rating >= 0 AND value_rating <= 5),
    five_star_count INTEGER DEFAULT 0,
    four_star_count INTEGER DEFAULT 0,
    three_star_count INTEGER DEFAULT 0,
    two_star_count INTEGER DEFAULT 0,
    one_star_count INTEGER DEFAULT 0,
    reputation_score DECIMAL(5,2) DEFAULT 0 CHECK (reputation_score >= 0),
    rank_percentile DECIMAL(5,2) DEFAULT 0 CHECK (rank_percentile >= 0 AND rank_percentile <= 100),
    last_review_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- 索引
CREATE INDEX idx_reviews_user_rating_user ON reviews_user_rating(user_id);
CREATE INDEX idx_reviews_user_rating_overall ON reviews_user_rating(overall_rating);
CREATE INDEX idx_reviews_user_rating_total_reviews ON reviews_user_rating(total_reviews);
CREATE INDEX idx_reviews_user_rating_reputation ON reviews_user_rating(reputation_score);
CREATE INDEX idx_reviews_user_rating_percentile ON reviews_user_rating(rank_percentile);
```

---

## 6. 支付系统 (payments)

### 6.1 钱包表 (payments_wallet)

**表名**: `payments_wallet`
**描述**: 用户钱包账户

```sql
CREATE TABLE payments_wallet (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    balance DECIMAL(12,2) DEFAULT 0 CHECK (balance >= 0),
    frozen_balance DECIMAL(12,2) DEFAULT 0 CHECK (frozen_balance >= 0),
    total_earned DECIMAL(12,2) DEFAULT 0 CHECK (total_earned >= 0),
    total_spent DECIMAL(12,2) DEFAULT 0 CHECK (total_spent >= 0),
    withdrawal_method VARCHAR(20) DEFAULT 'alipay' CHECK (withdrawal_method IN ('alipay', 'wechat', 'bank_transfer')),
    withdrawal_account VARCHAR(100),
    withdrawal_account_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- 索引
CREATE INDEX idx_payments_wallet_user ON payments_wallet(user_id);
CREATE INDEX idx_payments_wallet_balance ON payments_wallet(balance);
CREATE INDEX idx_payments_wallet_frozen_balance ON payments_wallet(frozen_balance);
```

### 6.2 交易表 (payments_transaction)

**表名**: `payments_transaction`
**描述**: 所有交易记录

```sql
CREATE TABLE payments_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'payment', 'refund', 'payout', 'fee', 'bonus', 'penalty')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed')),
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'CNY',
    fee DECIMAL(10,2) DEFAULT 0 CHECK (fee >= 0),
    net_amount DECIMAL(12,2) NOT NULL CHECK (net_amount >= 0),
    order_id UUID REFERENCES orders_order(id) ON DELETE SET NULL,
    payment_method_id UUID REFERENCES payments_payment_method(id) ON DELETE SET NULL,
    provider VARCHAR(20) CHECK (provider IN ('alipay', 'wechat', 'unionpay', 'wallet', 'stripe')),
    provider_transaction_id VARCHAR(100),
    provider_response JSONB DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    description TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_payments_transaction_transaction_id ON payments_transaction(transaction_id);
CREATE INDEX idx_payments_transaction_user_type ON payments_transaction(user_id, transaction_type);
CREATE INDEX idx_payments_transaction_user_status ON payments_transaction(user_id, status);
CREATE INDEX idx_payments_transaction_status_created ON payments_transaction(status, created_at);
CREATE INDEX idx_payments_transaction_provider ON payments_transaction(provider);
CREATE INDEX idx_payments_transaction_provider_transaction_id ON payments_transaction(provider_transaction_id);
CREATE INDEX idx_payments_transaction_order ON payments_transaction(order_id);
CREATE INDEX idx_payments_transaction_amount ON payments_transaction(amount);
CREATE INDEX idx_payments_transaction_processed_at ON payments_transaction(processed_at);
CREATE INDEX idx_payments_transaction_completed_at ON payments_transaction(completed_at);
```

### 6.3 托管表 (payments_escrow)

**表名**: `payments_escrow`
**描述**: 订单资金托管

```sql
CREATE TABLE payments_escrow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders_order(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    platform_fee DECIMAL(10,2) DEFAULT 0 CHECK (platform_fee >= 0),
    freelancer_amount DECIMAL(12,2) NOT NULL CHECK (freelancer_amount >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'released', 'refunded', 'disputed')),
    funding_transaction_id UUID REFERENCES payments_transaction(id) ON DELETE SET NULL,
    release_transaction_id UUID REFERENCES payments_transaction(id) ON DELETE SET NULL,
    funded_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    auto_release_date TIMESTAMP WITH TIME ZONE,
    is_manual_release_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(order_id)
);

-- 索引
CREATE INDEX idx_payments_escrow_order ON payments_escrow(order_id);
CREATE INDEX idx_payments_escrow_client_status ON payments_escrow(client_id, status);
CREATE INDEX idx_payments_escrow_freelancer_status ON payments_escrow(freelancer_id, status);
CREATE INDEX idx_payments_escrow_status_funded_at ON payments_escrow(status, funded_at);
CREATE INDEX idx_payments_escrow_auto_release_date ON payments_escrow(auto_release_date);
```

### 6.4 提现表 (payments_withdrawal)

**表名**: `payments_withdrawal`
**描述**: 用户提现申请

```sql
CREATE TABLE payments_withdrawal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    fee DECIMAL(10,2) DEFAULT 0 CHECK (fee >= 0),
    net_amount DECIMAL(12,2) NOT NULL CHECK (net_amount >= 0),
    withdrawal_method VARCHAR(20) NOT NULL CHECK (withdrawal_method IN ('alipay', 'wechat', 'bank_transfer')),
    withdrawal_account VARCHAR(100) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    transaction_id UUID REFERENCES payments_transaction(id) ON DELETE SET NULL,
    provider_reference VARCHAR(100),
    admin_notes TEXT,
    processed_by_id UUID REFERENCES accounts_user(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_payments_withdrawal_user_status ON payments_withdrawal(user_id, status);
CREATE INDEX idx_payments_withdrawal_status_created ON payments_withdrawal(status, created_at);
CREATE INDEX idx_payments_withdrawal_method ON payments_withdrawal(withdrawal_method);
CREATE INDEX idx_payments_withdrawal_amount ON payments_withdrawal(amount);
```

---

## 7. 统计和报表表

### 7.1 服务统计表 (gigs_gig_stat)

**表名**: `gigs_gig_stat`
**描述**: 服务每日统计数据

```sql
CREATE TABLE gigs_gig_stat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES gigs_gig(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(gig_id, date)
);

-- 索引
CREATE INDEX idx_gigs_gig_stat_gig_date ON gigs_gig_stat(gig_id, date);
CREATE INDEX idx_gigs_gig_stat_date ON gigs_gig_stat(date);
```

### 7.2 订单统计表 (orders_order_stat)

**表名**: `orders_order_stat`
**描述**: 订单每日统计数据

```sql
CREATE TABLE orders_order_stat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    refunded_orders INTEGER DEFAULT 0,
    disputed_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    platform_fees DECIMAL(12,2) DEFAULT 0,
    refunds_amount DECIMAL(12,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    average_completion_time DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_orders_order_stat_date ON orders_order_stat(date);
```

---

## 8. 数据库优化策略

### 8.1 索引策略

#### 主键索引
- 所有表使用UUID主键，自动创建唯一索引
- UUID主键提供良好的分布式特性

#### 复合索引
- 针对常用查询组合创建复合索引
- 考虑查询模式的列顺序

#### 示例索引创建策略
```sql
-- 用户类型和状态查询
CREATE INDEX idx_accounts_user_type_status ON accounts_user(user_type, user_status);

-- 时间范围查询
CREATE INDEX idx_orders_order_status_created ON orders_order(status, created_at);

-- 评分和数量排序
CREATE INDEX idx_gigs_gig_rating_count ON gigs_gig(average_rating, review_count DESC);
```

### 8.2 分区策略

#### 时间分区
```sql
-- 按月分区消息表
CREATE TABLE messaging_message_2024_01 PARTITION OF messaging_message
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 按年分区订单表
CREATE TABLE orders_order_2024 PARTITION OF orders_order
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 8.3 查询优化

#### 常用查询模式
```sql
-- 获取用户活跃服务
SELECT g.* FROM gigs_gig g
WHERE g.freelancer_id = $1 AND g.status = 'active'
ORDER BY g.is_featured DESC, g.created_at DESC;

-- 获取订单状态历史
SELECT * FROM orders_order_status_history
WHERE order_id = $1
ORDER BY created_at DESC;

-- 统计用户评分
SELECT
    COUNT(*) as total_reviews,
    AVG(rating) as avg_rating,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count
FROM reviews_review
WHERE reviewee_id = $1 AND status = 'published';
```

### 8.4 数据完整性约束

#### 外键约束
- 确保数据引用完整性
- 级联删除策略合理设置

#### 检查约束
- 价格字段非负约束
- 评分范围约束
- 状态字段枚举约束

#### 唯一约束
- 防止重复数据
- 业务逻辑唯一性

---

## 9. 备份和恢复策略

### 9.1 备份策略

#### 全量备份
```bash
# 每日全量备份
pg_dump -h localhost -U postgres -d freelance_platform > backup_$(date +%Y%m%d).sql

# 压缩备份
pg_dump -h localhost -U postgres -d freelance_platform | gzip > backup_$(date +%Y%m%d).sql.gz
```

#### 增量备份
```bash
# WAL日志备份
archive_command = 'cp %p /backup/wal/%f'
```

### 9.2 恢复策略

#### 完整恢复
```bash
# 从备份恢复
psql -h localhost -U postgres -d freelance_platform < backup_20240115.sql

# 时间点恢复
pg_basebackup -h localhost -D /backup/base -U postgres -v -P
```

---

## 10. 性能监控

### 10.1 慢查询监控

#### 启用慢查询日志
```sql
-- 修改postgresql.conf
log_min_duration_statement = 1000  -- 记录超过1秒的查询
log_statement = 'all'
```

#### 常用监控查询
```sql
-- 查看慢查询
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 查看表大小
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 10.2 连接池配置

#### PgBouncer配置
```ini
[databases]
freelance_platform = host=localhost port=5432 dbname=freelance_platform

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
logfile = /var/log/pgbouncer/pgbouncer.log
admin_users = postgres
stats_users = stats, postgres
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 5
max_db_connections = 50
max_user_connections = 50
server_reset_query = DISCARD ALL
```

---

## 11. 数据迁移

### 11.1 版本控制

#### Django迁移
```bash
# 创建迁移文件
python manage.py makemigrations

# 应用迁移
python manage.py migrate

# 查看迁移状态
python manage.py showmigrations
```

#### 数据迁移脚本
```python
# migrations/0002_populate_default_data.py
def populate_default_skills(apps, schema_editor):
    Skill = apps.get_model('accounts', 'Skill')

    default_skills = [
        {'name': 'Python编程', 'category': '编程'},
        {'name': '平面设计', 'category': '设计'},
        # ...
    ]

    for skill_data in default_skills:
        Skill.objects.create(**skill_data)
```

### 11.2 数据导入导出

#### CSV导入
```sql
COPY accounts_user(id, username, email, user_type)
FROM '/tmp/users.csv'
WITH (FORMAT csv, HEADER true);
```

#### JSON导出
```sql
SELECT row_to_json(t)
FROM (
    SELECT id, title, description, price
    FROM gigs_gig
    WHERE status = 'active'
) t;
```

---

## 12. 安全考虑

### 12.1 数据加密

#### 敏感字段加密
```python
# 使用django-extensions加密
from django_extensions.db.fields import EncryptedCharField

class PaymentMethod(models.Model):
    account_number = EncryptedCharField(max_length=100)
```

#### 数据库连接加密
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'freelance_platform',
        'USER': 'postgres',
        'PASSWORD': 'encrypted_password',
        'HOST': 'localhost',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
        }
    }
}
```

### 12.2 访问控制

#### 数据库用户权限
```sql
-- 应用用户
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE freelance_platform TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- 只读用户
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE freelance_platform TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### 12.3 审计日志

#### 操作审计
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES accounts_user(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET
);
```

---

## 总结

本数据库架构设计具有以下特点：

1. **可扩展性**: UUID主键支持分布式扩展
2. **性能优化**: 完善的索引策略和查询优化
3. **数据完整性**: 严格的外键约束和数据验证
4. **安全性**: 敏感数据加密和访问控制
5. **可维护性**: 清晰的表结构和命名规范
6. **本地化支持**: 针对中国市场的字段设计
7. **审计能力**: 完整的操作日志和变更追踪

该架构能够支持百万级用户和千万级订单的处理需求，为平台的长期发展提供坚实的数据基础。