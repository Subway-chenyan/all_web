# 社交登录集成指南 - 微信和QQ第三方登录

本指南详细说明如何配置和使用微信、QQ第三方登录功能。

## 目录

1. [功能概述](#功能概述)
2. [申请开发者账号](#申请开发者账号)
3. [配置环境变量](#配置环境变量)
4. [API接口文档](#api接口文档)
5. [使用示例](#使用示例)
6. [错误处理](#错误处理)
7. [安全注意事项](#安全注意事项)

## 功能概述

### 支持的社交平台
- **微信登录** (WeChat OAuth2)
- **QQ登录** (QQ OAuth2)

### 主要功能
- 用户通过微信/QQ快速登录
- 自动创建用户账号
- 社交账号绑定/解绑
- 用户信息同步
- 登录状态管理
- 安全的令牌管理

## 申请开发者账号

### 1. 微信开放平台申请

#### 步骤：

1. **注册微信开放平台账号**
   - 访问：https://open.weixin.qq.com/
   - 使用邮箱注册账号
   - 完成开发者资质认证（需要企业资质，个人开发者无法申请）

2. **创建移动应用**
   - 登录微信开放平台
   - 点击"管理中心" → "移动应用"
   - 点击"创建移动应用"
   - 填写应用信息：
     - 应用名称：您的应用名称
     - 应用简介：简要描述
     - 应用官网：您的网站地址
     - 应用图标：28x28和108x108像素图标
     - 应用截图：应用界面截图

3. **提交审核**
   - 填写应用签名和包名
   - 上传应用相关资料
   - 等待微信审核（通常需要1-5个工作日）

4. **获取AppID和AppSecret**
   - 审核通过后，在应用详情页面获取：
     - **AppID** (应用ID)
     - **AppSecret** (应用密钥)

#### 所需资料：
- 企业营业执照
- 应用开发者授权书
- 应用界面截图
- 隐私政策链接

### 2. QQ互联平台申请

#### 步骤：

1. **注册QQ互联开发者账号**
   - 访问：https://connect.qq.com/
   - 使用QQ号登录
   - 完成开发者认证

2. **创建应用**
   - 点击"应用管理" → "创建应用"
   - 选择"网站应用"或"移动应用"
   - 填写应用信息：
     - 应用名称：您的应用名称
     - 应用简介：简要描述
     - 应用官网：您的网站地址
     - 应用回调地址：`https://yourdomain.com/api/social/login/callback/`

3. **配置应用信息**
   - 设置应用图标和截图
   - 配置回调域名
   - 选择应用权限

4. **获取AppID和AppKey**
   - 审核通过后，在应用详情页面获取：
     - **AppID** (应用ID)
     - **AppKey** (应用密钥)

#### 所需资料：
- 个人身份证或企业营业执照
- 应用相关资料
- 网站备案信息（网站应用需要）

## 配置环境变量

在项目根目录的 `.env` 文件中添加以下配置：

```bash
# 微信登录配置
WECHAT_CLIENT_ID=your_wechat_appid
WECHAT_CLIENT_SECRET=your_wechat_appsecret
WECHAT_REDIRECT_URI=https://yourdomain.com/api/social/login/callback/

# QQ登录配置
QQ_CLIENT_ID=your_qq_appid
QQ_CLIENT_SECRET=your_qq_appkey
QQ_REDIRECT_URI=https://yourdomain.com/api/social/login/callback/

# 可选：微博登录配置
WEIBO_CLIENT_ID=your_weibo_appid
WEIBO_CLIENT_SECRET=your_weibo_appsecret
WEIBO_REDIRECT_URI=https://yourdomain.com/api/social/login/callback/
```

### 回调地址说明

回调地址必须是HTTPS协议，并且需要在对应平台备案。格式为：
```
https://yourdomain.com/api/social/login/callback/
```

## API接口文档

### 1. 社交登录

**POST** `/api/social/login/`

请求体：
```json
{
    "provider": "wechat",  // "wechat" 或 "qq"
    "code": "authorization_code",  // OAuth授权码
    "user_type": "client",  // "client" 或 "freelancer"
    "social_info": {}  // 可选：额外用户信息
}
```

响应：
```json
{
    "success": true,
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 123,
        "username": "user123",
        "email": "user@example.com",
        "user_type": "客户",
        "is_new_user": false
    },
    "social_account": {
        "id": 456,
        "provider": "wechat",
        "social_nickname": "微信昵称",
        "social_avatar": "https://...",
        "login_count": 5
    }
}
```

### 2. 获取可用的社交登录平台

**GET** `/api/social/login/providers/`

响应：
```json
{
    "providers": {
        "wechat": {
            "name": "微信",
            "description": "使用微信账号登录",
            "icon": "/static/icons/wechat.svg",
            "enabled": true
        },
        "qq": {
            "name": "QQ",
            "description": "使用QQ账号登录",
            "icon": "/static/icons/qq.svg",
            "enabled": true
        }
    },
    "enabled_count": 2
}
```

### 3. 绑定/解绑社交账号

**POST** `/api/social/bind/`

请求体：
```json
{
    "provider": "wechat",
    "bind_type": "bind",  // "bind" 或 "unbind"
    "code": "authorization_code"
}
```

### 4. 获取用户的社交账号列表

**GET** `/api/social/accounts/`

响应：
```json
[
    {
        "id": 456,
        "provider": "wechat",
        "provider_display": "微信",
        "social_nickname": "微信昵称",
        "social_avatar": "https://...",
        "last_login_at": "2024-01-15T10:30:00Z",
        "login_count": 5,
        "is_active": true
    }
]
```

### 5. 完成社交用户注册

**POST** `/api/social/registration/complete/`

请求体：
```json
{
    "email": "user@example.com",
    "phone": "13800138000",
    "nickname": "用户昵称"
}
```

## 使用示例

### 前端JavaScript示例

```javascript
// 微信登录
async function wechatLogin() {
    try {
        // 1. 获取微信授权码（需要在前端调用微信JS-SDK）
        const code = await getWechatCode();

        // 2. 发送到后端
        const response = await fetch('/api/social/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                provider: 'wechat',
                code: code,
                user_type: 'client'
            })
        });

        const result = await response.json();

        if (result.success) {
            // 保存令牌
            localStorage.setItem('access_token', result.access_token);
            localStorage.setItem('refresh_token', result.refresh_token);

            // 跳转到首页
            window.location.href = '/dashboard/';
        } else {
            alert('登录失败: ' + result.error);
        }
    } catch (error) {
        console.error('微信登录错误:', error);
        alert('登录过程中发生错误');
    }
}

// 获取微信授权码
function getWechatCode() {
    return new Promise((resolve, reject) => {
        // 微信JS-SDK配置
        wx.config({
            // 配置参数
        });

        wx.ready(() => {
            wx.login({
                success: (res) => {
                    resolve(res.code);
                },
                fail: reject
            });
        });
    });
}

// QQ登录
async function qqLogin() {
    try {
        // 1. 跳转到QQ授权页面
        const clientId = 'your_qq_appid';
        const redirectUri = encodeURIComponent('https://yourdomain.com/api/social/login/callback/');
        const authUrl = `https://graph.qq.com/oauth2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=get_user_info`;

        // 2. 打开新窗口进行授权
        const popup = window.open(authUrl, 'qq_login', 'width=600,height=400');

        // 3. 监听回调
        window.addEventListener('message', async (event) => {
            if (event.origin !== 'https://yourdomain.com') return;

            const { code } = event.data;
            if (code) {
                popup.close();

                // 4. 发送授权码到后端
                const response = await fetch('/api/social/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        provider: 'qq',
                        code: code,
                        user_type: 'client'
                    })
                });

                const result = await response.json();

                if (result.success) {
                    localStorage.setItem('access_token', result.access_token);
                    localStorage.setItem('refresh_token', result.refresh_token);
                    window.location.href = '/dashboard/';
                } else {
                    alert('登录失败: ' + result.error);
                }
            }
        });
    } catch (error) {
        console.error('QQ登录错误:', error);
        alert('登录过程中发生错误');
    }
}
```

### Python后端测试示例

```python
import requests

# 测试社交登录
def test_social_login():
    url = "http://localhost:8000/api/social/login/"

    data = {
        "provider": "wechat",
        "code": "test_auth_code",
        "user_type": "client"
    }

    response = requests.post(url, json=data)
    result = response.json()

    if result.get('success'):
        print("登录成功!")
        print(f"访问令牌: {result['access_token']}")
        print(f"用户信息: {result['user']}")
    else:
        print(f"登录失败: {result.get('error')}")

# 测试获取社交账号列表
def test_get_social_accounts(access_token):
    url = "http://localhost:8000/api/social/accounts/"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(url, headers=headers)
    accounts = response.json()

    print("用户的社交账号:")
    for account in accounts:
        print(f"- {account['provider_display']}: {account['social_nickname']}")
```

## 错误处理

### 常见错误代码

| 错误代码 | 描述 | 解决方案 |
|---------|------|---------|
| `MISSING_PARAMS` | 缺少必要的认证参数 | 确保提供了code或access_token |
| `AUTH_FAILED` | 社交认证失败 | 检查AppID/AppSecret配置 |
| `PROCESSING_ERROR` | 处理登录时发生错误 | 检查网络连接和API配置 |
| `INTERNAL_ERROR` | 内部服务器错误 | 检查服务器日志 |

### 错误响应格式

```json
{
    "success": false,
    "error": "错误描述",
    "error_code": "ERROR_CODE",
    "details": {}
}
```

## 安全注意事项

### 1. 保护敏感信息
- **AppSecret** 必须保密，不要在前端代码中暴露
- 使用环境变量存储敏感配置
- 定期更换AppSecret

### 2. 回调地址安全
- 回调地址必须使用HTTPS
- 在社交平台备案正确的回调地址
- 验证回调请求的合法性

### 3. 状态管理
- 使用安全的JWT令牌
- 设置合理的令牌过期时间
- 实现令牌刷新机制

### 4. 用户信息保护
- 只获取必要的用户信息
- 遵守相关的隐私政策
- 提供用户数据删除功能

### 5. 防止恶意攻击
- 实现登录频率限制
- 监控异常登录行为
- 验证用户输入数据

## 开发和调试

### 开发环境配置

```bash
# 设置调试模式
DEBUG=True

# 使用本地回调地址
WECHAT_REDIRECT_URI=http://localhost:8000/api/social/login/callback/
QQ_REDIRECT_URI=http://localhost:8000/api/social/login/callback/
```

### 调试技巧

1. **查看日志**
   ```bash
   tail -f logs/django.log
   ```

2. **检查配置**
   ```python
   # 在Django shell中检查配置
   python manage.py shell
   >>> from django.conf import settings
   >>> settings.SOCIALACCOUNT_PROVIDERS
   ```

3. **测试API**
   ```bash
   # 使用curl测试
   curl -X POST http://localhost:8000/api/social/login/ \
        -H "Content-Type: application/json" \
        -d '{"provider":"wechat","code":"test_code","user_type":"client"}'
   ```

## 生产环境部署

### 1. 环境变量配置
- 设置 `DEBUG=False`
- 配置生产环境的回调地址
- 使用HTTPS协议

### 2. 安全设置
```python
# 安全Cookie设置
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# 社交认证状态过期时间
SOCIAL_AUTH_STATE_EXPIRE_SECONDS = 600
```

### 3. 监控和日志
- 监控登录成功率
- 记录异常登录尝试
- 定期检查系统日志

## 技术支持

如果在集成过程中遇到问题，请：

1. 检查本文档的错误处理部分
2. 查看Django日志文件
3. 确认开发者账号和应用配置正确
4. 验证回调地址配置

---

**注意事项：**
- 微信开放平台需要企业资质才能申请
- 确保在所有社交平台正确配置回调地址
- 定期更新和维护社交登录配置
- 遵守各平台的使用条款和隐私政策