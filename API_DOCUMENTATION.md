# 中国版Fiverr兼职平台 API 文档

## 概述

这是一个基于Django 5.2.7 + DRF构建的freelance marketplace平台的完整API文档。平台支持中文本地化，集成微信/QQ第三方登录，提供完整的用户角色系统（客户、自由职业者、管理员）。

### 技术栈
- **后端**: Django 5.2.7 + Django REST Framework
- **数据库**: PostgreSQL
- **缓存**: Redis
- **认证**: JWT + 第三方OAuth (微信/QQ)
- **支付**: 支付宝、微信支付集成

## 基础信息

### 基础URL
- **开发环境**: `http://localhost:8000/api/`
- **生产环境**: `https://your-domain.com/api/`

### 认证方式
使用JWT Token认证，在请求头中添加：
```
Authorization: Bearer <access_token>
```

### 通用响应格式
```json
{
    "success": true,
    "data": {},
    "message": "操作成功",
    "code": 200
}
```

### 错误响应格式
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "输入数据验证失败",
        "details": {
            "field_name": ["错误信息"]
        }
    }
}
```

---

## 1. 用户认证系统 API

### 1.1 JWT Token 认证

#### 获取访问令牌
```http
POST /api/auth/token/
```

**请求体**:
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**响应**:
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": "uuid",
        "username": "username",
        "email": "user@example.com",
        "user_type": "freelancer",
        "is_verified": true
    }
}
```

**curl示例**:
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**JavaScript示例**:
```javascript
const response = await fetch('/api/auth/token/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
    })
});
const data = await response.json();
localStorage.setItem('access_token', data.access);
```

#### 刷新访问令牌
```http
POST /api/auth/token/refresh/
```

**请求体**:
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 1.2 用户注册

#### 用户注册
```http
POST /api/accounts/register/
```

**请求体**:
```json
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword",
    "password_confirm": "securepassword",
    "user_type": "freelancer",
    "phone_number": "13800138000",
    "wechat_id": "wechat_id_123"
}
```

**响应**:
```json
{
    "success": true,
    "message": "注册成功，请查收邮箱验证链接",
    "user": {
        "id": "uuid",
        "username": "testuser",
        "email": "test@example.com",
        "user_type": "freelancer",
        "is_email_verified": false
    }
}
```

### 1.3 第三方登录

#### 微信登录
```http
GET /api/social/wechat/
```

**查询参数**:
- `code`: 微信授权码

**响应**:
```json
{
    "success": true,
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": "uuid",
        "username": "wechat_user",
        "email": "user@example.com",
        "avatar": "https://thirdwx.qlogo.cn/...",
        "user_type": "freelancer"
    }
}
```

#### QQ登录
```http
GET /api/social/qq/
```

**查询参数**:
- `code`: QQ授权码

### 1.4 用户资料管理

#### 获取当前用户信息
```http
GET /api/accounts/profile/
Authorization: Bearer <access_token>
```

**响应**:
```json
{
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "user_type": "freelancer",
    "profile": {
        "first_name": "张",
        "last_name": "三",
        "bio": "我是一名专业的平面设计师...",
        "avatar": "/media/avatars/user_avatar.jpg",
        "phone_number": "13800138000",
        "wechat_id": "wechat_id_123",
        "location": {
            "country": "China",
            "province": "beijing",
            "city": "Beijing"
        },
        "hourly_rate": "200.00",
        "years_of_experience": 5
    },
    "verification": {
        "is_email_verified": true,
        "is_phone_verified": true,
        "is_identity_verified": false
    }
}
```

#### 更新用户资料
```http
PUT /api/accounts/profile/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "first_name": "张",
    "last_name": "三",
    "bio": "我是一名专业的平面设计师，拥有5年经验...",
    "hourly_rate": "200.00",
    "years_of_experience": 5,
    "skills": [
        {"name": "平面设计", "proficiency_level": 5},
        {"name": "Photoshop", "proficiency_level": 5},
        {"name": "Illustrator", "proficiency_level": 4}
    ]
}
```

### 1.5 技能管理

#### 获取技能列表
```http
GET /api/accounts/skills/
```

**查询参数**:
- `category`: 技能分类
- `search`: 搜索关键词

**响应**:
```json
{
    "count": 50,
    "results": [
        {
            "id": "uuid",
            "name": "平面设计",
            "category": "设计",
            "description": "平面设计相关技能"
        }
    ]
}
```

#### 添加用户技能
```http
POST /api/accounts/skills/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "skill_id": "uuid",
    "proficiency_level": 5,
    "years_experience": 3.5
}
```

---

## 2. 服务管理系统 API

### 2.1 服务分类

#### 获取分类列表
```http
GET /api/gigs/categories/
```

**查询参数**:
- `parent`: 父分类ID（获取子分类）

**响应**:
```json
{
    "count": 20,
    "results": [
        {
            "id": "uuid",
            "name": "平面设计",
            "slug": "graphic-design",
            "description": "专业的平面设计服务",
            "icon": "fas fa-palette",
            "children_count": 8,
            "gigs_count": 156
        }
    ]
}
```

#### 获取分类详情
```http
GET /api/gigs/categories/{slug}/
```

### 2.2 服务管理

#### 获取服务列表
```http
GET /api/gigs/
```

**查询参数**:
- `category`: 分类ID
- `search`: 搜索关键词
- `min_price`: 最低价格
- `max_price`: 最高价格
- `sort`: 排序方式（`price_low`, `price_high`, `rating`, `newest`）
- `featured`: 是否精选
- `page`: 页码
- `page_size`: 每页数量

**响应**:
```json
{
    "count": 1234,
    "next": "http://localhost:8000/api/gigs/?page=2",
    "previous": null,
    "results": [
        {
            "id": "uuid",
            "title": "专业Logo设计服务",
            "slug": "professional-logo-design",
            "description": "为您提供专业的Logo设计服务...",
            "thumbnail": "/media/gigs/thumbnails/logo_design.jpg",
            "freelancer": {
                "id": "uuid",
                "username": "designer_pro",
                "display_name": "专业设计师",
                "avatar": "/media/avatars/designer.jpg",
                "rating": 4.8,
                "review_count": 127
            },
            "category": {
                "id": "uuid",
                "name": "平面设计",
                "slug": "graphic-design"
            },
            "packages": [
                {
                    "type": "basic",
                    "title": "基础套餐",
                    "price": "299.00",
                    "delivery_days": 3,
                    "revisions": 2
                }
            ],
            "average_rating": 4.8,
            "review_count": 127,
            "order_count": 156,
            "is_featured": true,
            "created_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

#### 获取服务详情
```http
GET /api/gigs/{slug}/
```

**响应**:
```json
{
    "id": "uuid",
    "title": "专业Logo设计服务",
    "slug": "professional-logo-design",
    "description": "详细的描述内容...",
    "thumbnail": "/media/gigs/thumbnails/logo_design.jpg",
    "gallery_images": [
        "/media/gigs/gallery/sample1.jpg",
        "/media/gigs/gallery/sample2.jpg"
    ],
    "freelancer": {
        "id": "uuid",
        "username": "designer_pro",
        "profile": {
            "display_name": "专业设计师",
            "bio": "8年设计经验...",
            "avatar": "/media/avatars/designer.jpg",
            "location": "北京",
            "hourly_rate": "200.00"
        },
        "rating_summary": {
            "overall_rating": 4.8,
            "total_reviews": 127,
            "communication_rating": 4.9,
            "quality_rating": 4.8,
            "delivery_rating": 4.7,
            "value_rating": 4.8
        }
    },
    "category": {
        "id": "uuid",
        "name": "平面设计",
        "slug": "graphic-design"
    },
    "packages": [
        {
            "id": "uuid",
            "package_type": "basic",
            "title": "基础套餐",
            "description": "基础Logo设计",
            "price": "299.00",
            "delivery_days": 3,
            "revisions": 2,
            "features": [
                "2个Logo概念",
                "高分辨率文件",
                "源文件",
                "2次修改"
            ]
        },
        {
            "id": "uuid",
            "package_type": "premium",
            "title": "高级套餐",
            "description": "全套Logo设计服务",
            "price": "899.00",
            "delivery_days": 5,
            "revisions": 5,
            "features": [
                "5个Logo概念",
                "完整的品牌识别系统",
                "所有源文件",
                "5次修改",
                "名片设计",
                "信纸设计"
            ]
        }
    ],
    "extras": [
        {
            "id": "uuid",
            "title": "额外的Logo概念",
            "description": "每个额外概念",
            "price": "99.00",
            "delivery_days": 1
        }
    ],
    "requirements": [
        {
            "id": "uuid",
            "requirement_text": "请提供您的公司名称和行业",
            "is_required": true,
            "input_type": "text"
        },
        {
            "id": "uuid",
            "requirement_text": "请上传您喜欢的Logo参考",
            "is_required": false,
            "input_type": "file"
        }
    ],
    "faqs": [
        {
            "question": "多久可以完成设计？",
            "answer": "根据套餐不同，3-5个工作日完成。"
        }
    ],
    "stats": {
        "view_count": 1250,
        "order_count": 156,
        "favorite_count": 89,
        "average_rating": 4.8,
        "review_count": 127
    },
    "seo": {
        "meta_description": "专业的Logo设计服务，为您提供高质量的品牌识别设计"
    }
}
```

#### 创建服务
```http
POST /api/gigs/create/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "title": "专业Logo设计服务",
    "description": "详细的描述内容...",
    "category_id": "uuid",
    "tags": "logo,设计,品牌",
    "packages": [
        {
            "package_type": "basic",
            "title": "基础套餐",
            "description": "基础Logo设计",
            "price": "299.00",
            "delivery_days": 3,
            "revisions": 2,
            "features": ["2个Logo概念", "高分辨率文件"]
        }
    ],
    "requirements": [
        {
            "requirement_text": "请提供您的公司名称",
            "is_required": true,
            "input_type": "text"
        }
    ]
}
```

#### 更新服务
```http
PUT /api/gigs/{slug}/update/
Authorization: Bearer <access_token>
```

#### 删除服务
```http
DELETE /api/gigs/{slug}/delete/
Authorization: Bearer <access_token>
```

### 2.3 服务收藏

#### 收藏/取消收藏服务
```http
POST /api/gigs/{slug}/favorite/
Authorization: Bearer <access_token>
```

**响应**:
```json
{
    "success": true,
    "message": "已添加到收藏",
    "is_favorited": true
}
```

#### 获取用户收藏列表
```http
GET /api/gigs/favorites/
Authorization: Bearer <access_token>
```

### 2.4 服务搜索

#### 搜索建议
```http
GET /api/gigs/search/suggestions/
```

**查询参数**:
- `q`: 搜索关键词

**响应**:
```json
{
    "suggestions": [
        "logo设计",
        "logo制作",
        "品牌logo",
        "公司logo"
    ],
    "categories": [
        {
            "name": "平面设计",
            "slug": "graphic-design",
            "count": 156
        }
    ]
}
```

### 2.5 服务分析

#### 获取服务统计数据
```http
GET /api/gigs/{slug}/analytics/
Authorization: Bearer <access_token>
```

**响应**:
```json
{
    "overview": {
        "total_views": 1250,
        "unique_views": 890,
        "total_orders": 156,
        "total_revenue": "46800.00",
        "conversion_rate": 12.48
    },
    "daily_stats": [
        {
            "date": "2024-01-15",
            "views": 45,
            "orders": 2,
            "revenue": "598.00"
        }
    ],
    "top_sources": [
        {
            "source": "搜索",
            "views": 560,
            "percentage": 44.8
        }
    ]
}
```

---

## 3. 订单处理系统 API

### 3.1 订单管理

#### 创建订单
```http
POST /api/orders/create/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "gig_id": "uuid",
    "package_id": "uuid",
    "title": "Logo设计订单",
    "description": "需要为我的新公司设计Logo",
    "requirements": [
        {
            "requirement_id": "uuid",
            "response": "我的公司名称是：科技创新有限公司"
        }
    ],
    "extras": [
        {
            "extra_id": "uuid",
            "quantity": 1
        }
    ],
    "client_email": "client@example.com",
    "client_phone": "13900139000"
}
```

**响应**:
```json
{
    "success": true,
    "order": {
        "id": "uuid",
        "order_number": "ORD202401151030001234",
        "status": "pending",
        "gig": {
            "id": "uuid",
            "title": "专业Logo设计服务",
            "freelancer": {
                "username": "designer_pro",
                "display_name": "专业设计师"
            }
        },
        "package": {
            "title": "基础套餐",
            "price": "299.00"
        },
        "pricing": {
            "base_price": "299.00",
            "extras_price": "99.00",
            "platform_fee": "29.90",
            "total_price": "427.90"
        },
        "timeline": {
            "delivery_deadline": "2024-01-18T10:30:00Z",
            "estimated_delivery": "2024-01-18T10:30:00Z"
        },
        "created_at": "2024-01-15T10:30:00Z"
    }
}
```

#### 获取订单列表
```http
GET /api/orders/
Authorization: Bearer <access_token>
```

**查询参数**:
- `status`: 订单状态
- `role`: `client` 或 `freelancer`
- `page`: 页码

**响应**:
```json
{
    "count": 25,
    "results": [
        {
            "id": "uuid",
            "order_number": "ORD202401151030001234",
            "status": "in_progress",
            "title": "Logo设计订单",
            "gig": {
                "title": "专业Logo设计服务",
                "thumbnail": "/media/gigs/thumbnails/logo.jpg"
            },
            "freelancer": {
                "username": "designer_pro",
                "display_name": "专业设计师",
                "avatar": "/media/avatars/designer.jpg"
            },
            "client": {
                "username": "client_user",
                "display_name": "客户"
            },
            "total_price": "427.90",
            "delivery_deadline": "2024-01-18T10:30:00Z",
            "is_overdue": false,
            "days_until_deadline": 2,
            "created_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

#### 获取订单详情
```http
GET /api/orders/{order_number}/
Authorization: Bearer <access_token>
```

**响应**:
```json
{
    "id": "uuid",
    "order_number": "ORD202401151030001234",
    "status": "in_progress",
    "title": "Logo设计订单",
    "description": "需要为我的新公司设计Logo",
    "gig": {
        "id": "uuid",
        "title": "专业Logo设计服务",
        "slug": "professional-logo-design"
    },
    "freelancer": {
        "id": "uuid",
        "username": "designer_pro",
        "display_name": "专业设计师",
        "avatar": "/media/avatars/designer.jpg"
    },
    "client": {
        "id": "uuid",
        "username": "client_user",
        "display_name": "客户",
        "email": "client@example.com"
    },
    "package": {
        "title": "基础套餐",
        "description": "基础Logo设计",
        "price": "299.00",
        "delivery_days": 3,
        "revisions": 2
    },
    "extras": [
        {
            "title": "额外的Logo概念",
            "price": "99.00",
            "quantity": 1
        }
    ],
    "pricing": {
        "base_price": "299.00",
        "extras_price": "99.00",
        "platform_fee": "29.90",
        "freelancer_earnings": "368.10",
        "total_price": "427.90"
    },
    "timeline": {
        "delivery_deadline": "2024-01-18T10:30:00Z",
        "estimated_delivery": "2024-01-18T10:30:00Z",
        "created_at": "2024-01-15T10:30:00Z"
    },
    "requirements": [
        {
            "requirement_text": "请提供您的公司名称",
            "response": "科技创新有限公司",
            "is_provided": true,
            "provided_at": "2024-01-15T11:00:00Z"
        }
    ],
    "status_history": [
        {
            "old_status": "pending",
            "new_status": "paid",
            "changed_at": "2024-01-15T10:35:00Z",
            "notes": "支付成功"
        },
        {
            "old_status": "paid",
            "new_status": "in_progress",
            "changed_at": "2024-01-15T11:00:00Z",
            "notes": "开始工作"
        }
    ]
}
```

### 3.2 订单状态管理

#### 更新订单状态
```http
POST /api/orders/{order_number}/update_status/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "status": "delivered",
    "notes": "已完成设计，请查看"
}
```

### 3.3 订单交付

#### 提交交付物
```http
POST /api/orders/{order_number}/deliver/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "title": "Logo设计交付",
    "description": "请查看附件中的Logo设计文件",
    "message": "按照您的要求完成了Logo设计...",
    "files": [
        {
            "name": "logo_final.png",
            "url": "/media/deliveries/logo_final.png",
            "size": 1024000,
            "type": "image/png"
        }
    ],
    "is_final_delivery": true
}
```

#### 接受/拒绝交付
```http
POST /api/orders/{order_number}/delivery/{delivery_id}/respond/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "is_accepted": false,
    "rejected_reason": "颜色需要调整"
}
```

### 3.4 订单争议

#### 创建争议
```http
POST /api/orders/{order_number}/dispute/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "dispute_type": "quality",
    "description": "交付的质量不符合要求",
    "evidence": [
        "/media/evidence/screenshot1.jpg"
    ]
}
```

---

## 4. 消息系统 API

### 4.1 对话管理

#### 获取对话列表
```http
GET /api/messaging/conversations/
Authorization: Bearer <access_token>
```

**查询参数**:
- `type`: 对话类型（`direct`, `order`, `gig_inquiry`, `support`）
- `archived`: 是否已归档

**响应**:
```json
{
    "count": 15,
    "results": [
        {
            "id": "uuid",
            "conversation_type": "order",
            "subject": "关于Logo设计订单",
            "other_participant": {
                "id": "uuid",
                "username": "designer_pro",
                "display_name": "专业设计师",
                "avatar": "/media/avatars/designer.jpg",
                "is_online": true
            },
            "last_message": {
                "content": "好的，我会尽快完成",
                "created_at": "2024-01-15T14:30:00Z",
                "sender": "designer_pro"
            },
            "unread_count": 2,
            "is_archived": false,
            "is_blocked": false,
            "related_order": {
                "id": "uuid",
                "order_number": "ORD202401151030001234"
            },
            "created_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

#### 获取对话详情
```http
GET /api/messaging/conversations/{conversation_id}/
Authorization: Bearer <access_token>
```

#### 创建新对话
```http
POST /api/messaging/conversations/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "participant_id": "uuid",
    "conversation_type": "direct",
    "subject": "咨询设计服务",
    "initial_message": "您好，我想咨询一下Logo设计的事宜"
}
```

### 4.2 消息管理

#### 获取消息列表
```http
GET /api/messaging/conversations/{conversation_id}/messages/
Authorization: Bearer <access_token>
```

**查询参数**:
- `page`: 页码
- `before`: 获取指定时间之前的消息

**响应**:
```json
{
    "count": 50,
    "results": [
        {
            "id": "uuid",
            "sender": {
                "id": "uuid",
                "username": "client_user",
                "display_name": "客户",
                "avatar": "/media/avatars/client.jpg"
            },
            "message_type": "text",
            "content": "您好，我想咨询一下Logo设计的事宜",
            "attachments": [],
            "is_read": true,
            "read_at": "2024-01-15T10:35:00Z",
            "created_at": "2024-01-15T10:30:00Z"
        },
        {
            "id": "uuid",
            "sender": {
                "id": "uuid",
                "username": "designer_pro",
                "display_name": "专业设计师",
                "avatar": "/media/avatars/designer.jpg"
            },
            "message_type": "file",
            "content": "请查看我的作品集",
            "attachments": [
                {
                    "id": "uuid",
                    "filename": "portfolio.pdf",
                    "file_url": "/media/attachments/portfolio.pdf",
                    "file_size": 2048000,
                    "file_type": "application/pdf"
                }
            ],
            "is_read": true,
            "created_at": "2024-01-15T10:32:00Z"
        }
    ]
}
```

#### 发送消息
```http
POST /api/messaging/conversations/{conversation_id}/messages/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "message_type": "text",
    "content": "好的，我会尽快完成",
    "reply_to": "uuid"
}
```

#### 上传文件附件
```http
POST /api/messaging/upload/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**请求体**:
```
file: [文件]
conversation_id: uuid
```

### 4.3 消息操作

#### 标记消息为已读
```http
POST /api/messaging/conversations/{conversation_id}/mark_read/
Authorization: Bearer <access_token>
```

#### 归档对话
```http
POST /api/messaging/conversations/{conversation_id}/archive/
Authorization: Bearer <access_token>
```

#### 拉黑用户
```http
POST /api/messaging/block_user/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "user_id": "uuid",
    "reason": "垃圾信息"
}
```

---

## 5. 评价系统 API

### 5.1 评价管理

#### 获取评价列表
```http
GET /api/reviews/
```

**查询参数**:
- `user_id`: 用户ID
- `gig_id`: 服务ID
- `order_id`: 订单ID
- `rating`: 评分（1-5）
- `review_type`: `freelancer`, `client`, `gig`

**响应**:
```json
{
    "count": 127,
    "results": [
        {
            "id": "uuid",
            "reviewer": {
                "id": "uuid",
                "username": "client_user",
                "display_name": "客户",
                "avatar": "/media/avatars/client.jpg"
            },
            "reviewee": {
                "id": "uuid",
                "username": "designer_pro",
                "display_name": "专业设计师"
            },
            "order": {
                "id": "uuid",
                "order_number": "ORD202401151030001234"
            },
            "gig": {
                "id": "uuid",
                "title": "专业Logo设计服务",
                "slug": "professional-logo-design"
            },
            "review_type": "freelancer",
            "ratings": {
                "overall": 5,
                "communication": 5,
                "quality": 5,
                "delivery": 5,
                "value": 4
            },
            "content": {
                "title": "非常专业的设计师",
                "content": "设计质量很高，沟通顺畅，按时交付。强烈推荐！"
            },
            "response": {
                "content": "感谢您的好评！期待再次合作。",
                "responded_at": "2024-01-16T09:00:00Z",
                "helpful_count": 3
            },
            "is_visible": true,
            "is_flagged": false,
            "helpful_votes": 15,
            "created_at": "2024-01-15T16:30:00Z"
        }
    ],
    "rating_summary": {
        "average_rating": 4.8,
        "total_reviews": 127,
        "rating_distribution": {
            "5_star": 89,
            "4_star": 25,
            "3_star": 8,
            "2_star": 3,
            "1_star": 2
        }
    }
}
```

#### 创建评价
```http
POST /api/reviews/create/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "order_id": "uuid",
    "review_type": "freelancer",
    "rating": 5,
    "communication_rating": 5,
    "quality_rating": 5,
    "delivery_rating": 5,
    "value_rating": 4,
    "title": "非常专业的设计师",
    "content": "设计质量很高，沟通顺畅，按时交付。强烈推荐！"
}
```

#### 回复评价
```http
POST /api/reviews/{review_id}/respond/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "response": "感谢您的好评！期待再次合作。"
}
```

### 5.2 评价互动

#### 评价是否有用
```http
POST /api/reviews/{review_id}/helpful/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "is_helpful": true
}
```

#### 举报评价
```http
POST /api/reviews/{review_id}/report/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "reason": "fake",
    "description": "这个评价看起来是虚假的"
}
```

---

## 6. 支付系统 API

### 6.1 钱包管理

#### 获取钱包信息
```http
GET /api/payments/wallet/
Authorization: Bearer <access_token>
```

**响应**:
```json
{
    "balance": "2580.50",
    "frozen_balance": "299.00",
    "total_earned": "15000.00",
    "total_spent": "12420.50",
    "withdrawal_settings": {
        "withdrawal_method": "alipay",
        "withdrawal_account": "138****8000",
        "withdrawal_account_name": "张三"
    },
    "stats": {
        "today_earned": "599.00",
        "this_month_earned": "3500.00",
        "pending_earnings": "899.00"
    }
}
```

#### 更新提现设置
```http
PUT /api/payments/wallet/withdrawal_settings/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "withdrawal_method": "alipay",
    "withdrawal_account": "13800138000",
    "withdrawal_account_name": "张三"
}
```

### 6.2 交易记录

#### 获取交易记录
```http
GET /api/payments/transactions/
Authorization: Bearer <access_token>
```

**查询参数**:
- `type`: 交易类型
- `status`: 交易状态
- `start_date`: 开始日期
- `end_date`: 结束日期

**响应**:
```json
{
    "count": 156,
    "results": [
        {
            "id": "uuid",
            "transaction_id": "TXN202401151030001234",
            "transaction_type": "payout",
            "status": "completed",
            "amount": "368.10",
            "fee": "29.90",
            "net_amount": "338.20",
            "provider": "alipay",
            "description": "订单ORD202401151030001234完成付款",
            "order": {
                "id": "uuid",
                "order_number": "ORD202401151030001234"
            },
            "created_at": "2024-01-15T10:30:00Z",
            "completed_at": "2024-01-15T10:32:00Z"
        }
    ]
}
```

### 6.3 提现管理

#### 申请提现
```http
POST /api/payments/withdrawals/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "amount": "1000.00",
    "withdrawal_method": "alipay",
    "withdrawal_account": "13800138000",
    "account_name": "张三"
}
```

#### 获取提现记录
```http
GET /api/payments/withdrawals/
Authorization: Bearer <access_token>
```

### 6.4 支付处理

#### 创建支付
```http
POST /api/payments/create_payment/
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
    "order_id": "uuid",
    "payment_method": "alipay",
    "return_url": "https://yourdomain.com/payment/return",
    "notify_url": "https://yourdomain.com/payment/notify"
}
```

**响应**:
```json
{
    "success": true,
    "payment_url": "https://openapi.alipay.com/gateway.do?...",
    "transaction_id": "TXN202401151030001234",
    "amount": "427.90"
}
```

---

## 7. 通用API

### 7.1 文件上传

#### 上传文件
```http
POST /api/common/upload/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**请求体**:
```
file: [文件]
type: avatar|gig_thumbnail|portfolio|attachment
```

**响应**:
```json
{
    "success": true,
    "file": {
        "url": "/media/uploads/avatar_123456.jpg",
        "filename": "avatar_123456.jpg",
        "size": 102400,
        "type": "image/jpeg"
    }
}
```

### 7.2 搜索建议

#### 获取搜索建议
```http
GET /api/common/search_suggestions/
```

**查询参数**:
- `q`: 搜索关键词
- `type`: 搜索类型（`gigs`, `users`, `categories`）

### 7.3 系统配置

#### 获取系统配置
```http
GET /api/common/config/
```

**响应**:
```json
{
    "platform": {
        "name": "技能市场",
        "version": "1.0.0",
        "currency": "CNY",
        "timezone": "Asia/Shanghai"
    },
    "limits": {
        "max_gig_title_length": 200,
        "max_gig_description_length": 5000,
        "max_upload_size": 10485760,
        "allowed_file_types": ["jpg", "png", "gif", "pdf", "doc", "docx"]
    },
    "fees": {
        "platform_fee_percentage": 10,
        "withdrawal_fee": 2.00,
        "min_withdrawal_amount": 100.00
    }
}
```

---

## 错误处理

### 错误代码说明

| 错误代码 | HTTP状态码 | 说明 |
|---------|-----------|------|
| VALIDATION_ERROR | 400 | 请求数据验证失败 |
| UNAUTHORIZED | 401 | 未授权访问 |
| FORBIDDEN | 403 | 权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| RATE_LIMITED | 429 | 请求频率超限 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

### 常见错误示例

#### 验证错误
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "输入数据验证失败",
        "details": {
            "email": ["请输入有效的邮箱地址"],
            "password": ["密码长度至少8位"]
        }
    }
}
```

#### 权限错误
```json
{
    "success": false,
    "error": {
        "code": "FORBIDDEN",
        "message": "您没有权限执行此操作"
    }
}
```

---

## 性能优化建议

### 1. 分页
- 所有列表API都支持分页，建议使用合理的页大小（20-50）
- 使用`page`和`page_size`参数控制分页

### 2. 缓存
- 分类数据缓存1小时
- 热门服务缓存30分钟
- 用户资料缓存15分钟

### 3. 字段选择
- 使用`fields`参数只获取需要的字段
```http
GET /api/gigs/?fields=id,title,price,thumbnail
```

### 4. 并发请求
- 避免同时发起多个API请求
- 使用批量接口减少请求次数

### 5. 图片优化
- 使用合适的图片尺寸
- 启用浏览器缓存
- 考虑使用CDN

---

## 开发环境配置

### 本地开发
```bash
# 安装依赖
pip install -r requirements.txt

# 数据库迁移
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser

# 启动开发服务器
python manage.py runserver
```

### API测试
推荐使用以下工具进行API测试：
- Postman
- Insomnia
- curl命令

### 示例配置
```python
# settings/local.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

---

## 联系信息

如有API相关问题，请联系开发团队：
- 邮箱：dev-team@yourcompany.com
- 文档更新时间：2024年1月15日
- API版本：v1.0