# 技能集市前端

这是技能集市平台的前端应用，基于 React + TypeScript + Vite 构建的现代化技能服务与交易平台。

## 功能特性

- 🚀 **现代化技术栈**: React 19 + TypeScript + Vite
- 🎨 **响应式设计**: 基于Tailwind CSS的移动优先设计
- 🔄 **状态管理**: Zustand + React Query
- 🛡️ **类型安全**: 完整的TypeScript类型定义
- 🌐 **国际化支持**: 中文优先的UI设计
- 🔐 **用户认证**: 完整的登录注册流程
- 📱 **移动端优化**: 响应式设计，支持各种设备

## 技术栈

### 核心框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 现代化构建工具

### 路由与状态管理
- **React Router v7** - 客户端路由
- **Zustand** - 轻量级状态管理
- **React Query** - 服务器状态管理

### 样式与UI
- **Tailwind CSS** - 实用优先的CSS框架
- **clsx & tailwind-merge** - 条件样式工具

### 工具与开发体验
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Axios** - HTTP客户端
- **date-fns** - 日期处理工具

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础UI组件
│   ├── layout/         # 布局组件
│   ├── forms/          # 表单组件
│   └── providers/      # Context提供者
├── pages/              # 页面组件
│   ├── auth/           # 认证相关页面
│   ├── services/       # 服务相关页面
│   ├── orders/         # 订单相关页面
│   ├── messages/       # 消息相关页面
│   ├── profile/        # 用户资料页面
│   └── dashboard/      # 控制面板页面
├── hooks/              # 自定义Hooks
├── services/           # API服务
├── store/              # 状态管理
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
├── constants/          # 常量定义
└── styles/             # 全局样式
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产版本
- `npm run lint` - 运行ESLint检查
- `npm run lint:fix` - 自动修复ESLint问题
- `npm run format` - 格式化代码
- `npm run format:check` - 检查代码格式
- `npm run type-check` - TypeScript类型检查
- `npm run clean` - 清理构建文件

## 环境变量

### 开发环境 (.env.development)

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=技能集市
VITE_DEBUG=true
```

### 生产环境 (.env.production)

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_NAME=技能集市
VITE_DEBUG=false
```

## API配置

应用通过Vite代理配置与后端API通信：

- `/api/*` -> `http://localhost:8000/api/*`
- `/admin/*` -> `http://localhost:8000/admin/*`
- `/static/*` -> `http://localhost:8000/static/*`
- `/media/*` -> `http://localhost:8000/media/*`

## 认证流程

1. 用户登录获取access_token和refresh_token
2. tokens存储在localStorage中
3. 自动token刷新机制
4. 登录状态持久化

## 状态管理

### Zustand Store

- **useAuthStore** - 用户认证状态
- **useUIStore** - UI状态（主题、侧边栏、通知等）
- **useServiceStore** - 服务筛选状态
- **useCartStore** - 购物车状态

### React Query

- 服务器状态缓存
- 自动重新获取
- 乐观更新
- 错误处理

## 路由结构

### 公开路由
- `/` - 首页
- `/services` - 服务列表
- `/services/:id` - 服务详情
- `/auth/login` - 登录
- `/auth/register` - 注册

### 受保护路由
- `/dashboard` - 控制面板
- `/profile` - 个人资料
- `/orders` - 订单管理
- `/messages` - 消息中心
- `/wallet` - 钱包

## 组件设计原则

1. **组件优先** - 可复用的模块化组件
2. **类型安全** - 完整的TypeScript支持
3. **无障碍访问** - WCAG 2.1 AA标准
4. **性能优化** - 懒加载、代码分割
5. **响应式设计** - 移动优先

## 开发规范

### 代码风格

- 使用Prettier进行代码格式化
- 使用ESLint进行代码质量检查
- 遵循React Hooks规范
- 使用函数组件和Hooks

### 提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建工具或辅助工具的变动

## 部署

### 构建部署

```bash
npm run build
```

构建文件将输出到 `dist/` 目录，可以部署到任何静态文件服务器。

### 环境配置

确保在生产环境中设置正确的环境变量：

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_NAME=技能集市
```

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如有问题或建议，请：

1. 查看[常见问题](/help)
2. 提交[Issue](https://github.com/yourrepo/issues)
3. 联系[技术支持](mailto:support@example.com)