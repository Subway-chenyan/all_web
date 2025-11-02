# 技能集市 - 前端应用

中国版Fiverr兼职平台的现代化React前端应用，连接自由职业者与客户。

## 🚀 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router v7
- **状态管理**: Zustand + React Query
- **HTTP客户端**: Axios
- **表单**: React Hook Form + Zod
- **图标**: Lucide React
- **工具**: ESLint + TypeScript

## 📦 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础UI组件
│   ├── layout/         # 布局组件
│   └── services/       # 服务相关组件
├── pages/              # 页面组件
│   ├── auth/           # 认证页面
│   ├── dashboard/      # 仪表板页面
│   ├── services/       # 服务页面
│   └── profile/        # 个人资料页面
├── store/              # 状态管理
├── services/           # API服务
├── types/              # TypeScript类型定义
├── hooks/              # 自定义Hooks
├── utils/              # 工具函数
└── assets/             # 静态资源
```

## 🛠 开发环境设置

### 前置要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

复制环境配置文件并根据需要修改：

```bash
cp .env.example .env
```

主要配置项：

```env
# API配置
VITE_API_BASE_URL=http://localhost:8000/api

# 应用配置
VITE_APP_NAME=技能集市
VITE_APP_VERSION=1.0.0

# 功能开关
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_CHAT=true
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🔧 开发脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产版本
- `npm run lint` - 运行ESLint检查
- `npm run lint:fix` - 自动修复ESLint问题
- `npm run type-check` - TypeScript类型检查
- `npm run clean` - 清理构建文件

## 🏗 核心功能

### ✅ 已实现

- 🏠 **主页**
  - 响应式导航栏
  - 搜索功能
  - 服务分类展示
  - 精选服务列表
  - 统计数据展示

- 🔍 **服务浏览**
  - 服务列表页面
  - 高级搜索和过滤
  - 服务卡片组件
  - 分类浏览

- 🎨 **UI组件库**
  - Button组件
  - Card组件
  - Input组件
  - Loading组件
  - 响应式布局

- 🔐 **状态管理**
  - 用户认证状态
  - 服务数据管理
  - 购物车状态
  - 全局UI状态

- 🌐 **API集成**
  - RESTful API客户端
  - 错误处理
  - 请求重试
  - 文件上传

### 🚧 开发中

- 👤 **用户认证**
  - 登录/注册页面
  - 社交登录
  - 密码重置
  - 邮箱验证

- 📊 **用户仪表板**
  - 订单管理
  - 收入统计
  - 消息中心
  - 个人资料

- 💼 **服务管理**
  - 服务创建
  - 服务编辑
  - 订单处理
  - 评价系统

- 💬 **消息系统**
  - 实时聊天
  - 文件分享
  - 消息通知

## 🎨 设计原则

- **移动优先**: 响应式设计，完美适配各种设备
- **用户体验**: 直观的界面和流畅的交互
- **性能优化**: 懒加载、代码分割、缓存策略
- **可访问性**: 遵循WCAG标准，支持键盘导航
- **国际化**: 支持中英文切换

## 🔒 安全特性

- JWT令牌认证
- API请求拦截器
- XSS防护
- CSRF保护
- 输入验证和清理

## 📱 响应式设计

- 📱 手机: 320px - 768px
- 📟 平板: 768px - 1024px
- 💻 桌面: 1024px+

## 🚀 部署

### 构建生产版本

```bash
npm run build
```

### 部署到静态托管

构建后的文件位于 `dist/` 目录，可以部署到任何静态托管服务：

- Vercel
- Netlify
- GitHub Pages
- 阿里云OSS
- 腾讯云COS

### 环境变量

确保在生产环境中设置正确的环境变量：

```bash
# 生产环境
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发规范

### 代码风格

- 使用TypeScript进行类型检查
- 遵循ESLint规则
- 组件使用PascalCase命名
- 文件使用camelCase命名
- 常量使用UPPER_SNAKE_CASE命名

### Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 组件开发规范

- 使用函数式组件和Hooks
- 组件应该是单一职责的
- 使用TypeScript定义Props类型
- 提供默认值和必要的验证
- 添加适当的注释

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 📧 Email: support@jinengshiji.com
- 💬 微信: jinengshiji_support
- 📱 电话: 400-123-4567

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和设计师！

---

**技能集市** - 让才华与机会相遇 🚀