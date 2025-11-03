# 前端集成指南

## 概述

本指南面向前端开发人员，详细说明如何与中国版Fiverr兼职平台后端API进行集成。包含完整的认证流程、API调用示例、错误处理和最佳实践。

## 技术栈要求

### 前端技术栈
- **框架**: React 18+ / Vue 3+ / Angular 15+
- **HTTP客户端**: Axios / Fetch API
- **状态管理**: Redux Toolkit / Vuex / Pinia / NgRx
- **UI组件库**: Ant Design / Element Plus / Material-UI
- **构建工具**: Vite / Webpack 5
- **TypeScript**: 5.0+ (推荐)

### 开发工具
- **API测试**: Postman / Insomnia
- **代码规范**: ESLint + Prettier
- **Git工作流**: Git Flow / GitHub Flow

---

## 1. 项目配置

### 1.1 环境配置

#### 环境变量配置 (`.env`)
```bash
# API配置
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000

# 认证配置
VITE_JWT_REFRESH_THRESHOLD=300000  # 5分钟

# 第三方登录
VITE_WECHAT_APP_ID=your_wechat_app_id
VITE_QQ_APP_ID=your_qq_app_id

# 文件上传
VITE_MAX_FILE_SIZE=10485760  # 10MB
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# 地图配置
VITE_AMAP_KEY=your_amap_key
```

#### Axios配置示例
```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求ID用于追踪
    config.headers['X-Request-ID'] = generateRequestId();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Token过期处理
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        localStorage.setItem('access_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 刷新失败，跳转登录
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 错误处理
    handleError(error);
    return Promise.reject(error);
  }
);

// 错误处理函数
function handleError(error: any) {
  const { response } = error;

  if (response) {
    const { status, data } = response;

    switch (status) {
      case 400:
        message.error(data.error?.message || '请求参数错误');
        break;
      case 401:
        message.error('请先登录');
        break;
      case 403:
        message.error('权限不足');
        break;
      case 404:
        message.error('请求的资源不存在');
        break;
      case 429:
        message.error('请求过于频繁，请稍后再试');
        break;
      case 500:
        message.error('服务器内部错误');
        break;
      default:
        message.error('网络错误，请稍后再试');
    }
  } else {
    message.error('网络连接失败');
  }
}

// 刷新访问令牌
async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/token/refresh/`,
    { refresh: refreshToken }
  );

  return response.data.access;
}

// 生成请求ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default apiClient;
```

### 1.2 TypeScript类型定义

#### 通用类型定义
```typescript
// src/types/common.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginationResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface PaginatedParams {
  page?: number;
  page_size?: number;
}

export interface SearchParams extends PaginatedParams {
  search?: string;
  sort?: string;
}
```

#### 用户相关类型
```typescript
// src/types/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  user_type: 'client' | 'freelancer' | 'admin';
  user_status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  profile?: UserProfile;
  verification?: UserVerification;
}

export interface UserProfile {
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar?: string;
  phone_number?: string;
  wechat_id?: string;
  location?: {
    country: string;
    province?: string;
    city?: string;
  };
  hourly_rate?: number;
  years_of_experience?: number;
  skills?: UserSkill[];
  profile_completion_percentage: number;
}

export interface UserSkill {
  id: string;
  skill: {
    id: string;
    name: string;
    category: string;
  };
  proficiency_level: number; // 1-5
  years_experience?: number;
}

export interface UserVerification {
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_identity_verified: boolean;
}
```

#### 服务相关类型
```typescript
// src/types/gig.ts
export interface Gig {
  id: string;
  title: string;
  slug: string;
  description: string;
  freelancer: {
    id: string;
    username: string;
    display_name: string;
    avatar?: string;
    rating: number;
    review_count: number;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  packages: GigPackage[];
  average_rating: number;
  review_count: number;
  order_count: number;
  is_featured: boolean;
  thumbnail?: string;
  gallery_images: string[];
  created_at: string;
}

export interface GigPackage {
  id: string;
  package_type: 'basic' | 'standard' | 'premium';
  title: string;
  description: string;
  price: number;
  delivery_days: number;
  revisions: number;
  features: string[];
}

export interface GigCreateParams {
  title: string;
  description: string;
  category_id: string;
  tags?: string;
  packages: GigPackage[];
  requirements?: GigRequirement[];
}

export interface GigRequirement {
  requirement_text: string;
  is_required: boolean;
  input_type: 'text' | 'textarea' | 'file' | 'checkbox' | 'number';
}
```

---

## 2. 认证系统集成

### 2.1 JWT认证管理

#### 认证服务类
```typescript
// src/services/auth.ts
import apiClient from './api';
import { ApiResponse } from '@/types/common';

interface LoginParams {
  email: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

interface RegisterParams {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  user_type: 'client' | 'freelancer';
  phone_number?: string;
  wechat_id?: string;
}

class AuthService {
  // 登录
  async login(params: LoginParams): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post('/auth/token/', params);
  }

  // 注册
  async register(params: RegisterParams): Promise<ApiResponse> {
    return apiClient.post('/accounts/register/', params);
  }

  // 登出
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout/');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
    }
  }

  // 刷新token
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await apiClient.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });

    localStorage.setItem('access_token', response.access);
    return response.access;
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get('/accounts/profile/');
  }

  // 检查认证状态
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // 获取token剩余有效时间
  getTokenRemainingTime(): number {
    const token = localStorage.getItem('access_token');
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 - Date.now();
    } catch {
      return 0;
    }
  }
}

export const authService = new AuthService();
```

#### 认证状态管理 (Redux Toolkit)
```typescript
// src/store/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// 异步actions
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (params: { email: string; password: string }) => {
    const response = await authService.login(params);
    if (response.success && response.data) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user_info', JSON.stringify(response.data.user));
      return response.data;
    }
    throw new Error(response.error?.message || '登录失败');
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (params: RegisterParams) => {
    const response = await authService.register(params);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error?.message || '注册失败');
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    const response = await authService.getCurrentUser();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('获取用户信息失败');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '登录失败';
      })
      // 注册
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '注册失败';
      })
      // 登出
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // 获取当前用户
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      });
  },
});

export const { clearError, setAuthenticated, updateUser } = authSlice.actions;
export default authSlice.reducer;
```

### 2.2 第三方登录集成

#### 微信登录组件
```typescript
// src/components/auth/WeChatLogin.tsx
import React, { useEffect } from 'react';
import { Button } from 'antd';
import { WechatOutlined } from '@ant-design/icons';

interface WeChatLoginProps {
  onSuccess: (userInfo: any) => void;
  onError: (error: string) => void;
}

const WeChatLogin: React.FC<WeChatLoginProps> = ({ onSuccess, onError }) => {
  useEffect(() => {
    // 初始化微信JS-SDK
    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleWeChatLogin = () => {
    const appId = import.meta.env.VITE_WECHAT_APP_ID;
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/wechat/callback');
    const scope = 'snsapi_login';
    const state = Math.random().toString(36).substr(2);

    const authUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

    window.open(authUrl, 'wechat_login', 'width=600,height=600');
  };

  // 监听微信登录回调
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'WECHAT_LOGIN_SUCCESS') {
        onSuccess(event.data.userInfo);
      } else if (event.data.type === 'WECHAT_LOGIN_ERROR') {
        onError(event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError]);

  return (
    <Button
      icon={<WechatOutlined />}
      size="large"
      block
      onClick={handleWeChatLogin}
      style={{ backgroundColor: '#07C160', borderColor: '#07C160', color: 'white' }}
    >
      微信登录
    </Button>
  );
};

export default WeChatLogin;
```

#### 登录页面集成
```typescript
// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Divider, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginAsync } from '@/store/authSlice';
import WeChatLogin from '@/components/auth/WeChatLogin';

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleEmailLogin = async (values: any) => {
    setLoading(true);
    try {
      await dispatch(loginAsync(values)).unwrap();
      message.success('登录成功');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleWeChatSuccess = (userInfo: any) => {
    message.success('微信登录成功');
    navigate('/');
  };

  const handleWeChatError = (error: string) => {
    message.error(error || '微信登录失败');
  };

  return (
    <div className="login-container">
      <Card title="登录" className="login-card">
        <Form
          form={form}
          onFinish={handleEmailLogin}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <WeChatLogin
          onSuccess={handleWeChatSuccess}
          onError={handleWeChatError}
        />
      </Card>
    </div>
  );
};

export default LoginPage;
```

---

## 3. 用户系统集成

### 3.1 用户资料管理

#### 用户资料服务
```typescript
// src/services/user.ts
import apiClient from './api';
import { ApiResponse, PaginatedParams } from '@/types/common';
import { User, UserProfile, UserSkill } from '@/types/user';

class UserService {
  // 获取用户资料
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get('/accounts/profile/');
  }

  // 更新用户资料
  async updateProfile(data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return apiClient.put('/accounts/profile/', data);
  }

  // 上传头像
  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');

    return apiClient.post('/common/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // 获取技能列表
  async getSkills(params?: PaginatedParams & { category?: string }): Promise<ApiResponse> {
    return apiClient.get('/accounts/skills/', { params });
  }

  // 添加用户技能
  async addUserSkill(data: {
    skill_id: string;
    proficiency_level: number;
    years_experience?: number;
  }): Promise<ApiResponse<UserSkill>> {
    return apiClient.post('/accounts/skills/', data);
  }

  // 删除用户技能
  async removeUserSkill(skillId: string): Promise<ApiResponse> {
    return apiClient.delete(`/accounts/skills/${skillId}/`);
  }

  // 获取教育经历
  async getEducation(): Promise<ApiResponse> {
    return apiClient.get('/accounts/education/');
  }

  // 添加教育经历
  async addEducation(data: any): Promise<ApiResponse> {
    return apiClient.post('/accounts/education/', data);
  }

  // 获取工作经历
  async getWorkExperience(): Promise<ApiResponse> {
    return apiClient.get('/accounts/work-experience/');
  }

  // 添加工作经历
  async addWorkExperience(data: any): Promise<ApiResponse> {
    return apiClient.post('/accounts/work-experience/', data);
  }

  // 获取作品集
  async getPortfolio(): Promise<ApiResponse> {
    return apiClient.get('/accounts/portfolio/');
  }

  // 添加作品集项目
  async addPortfolioItem(data: any): Promise<ApiResponse> {
    return apiClient.post('/accounts/portfolio/', data);
  }
}

export const userService = new UserService();
```

#### 用户资料编辑组件
```typescript
// src/components/profile/ProfileEditor.tsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { userService } from '@/services/user';
import { updateUser } from '@/store/authSlice';

const { TextArea } = Input;
const { Option } = Select;

interface ProfileEditorProps {
  onSave?: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.profile) {
      form.setFieldsValue(user.profile);
    }
  }, [user, form]);

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      const response = await userService.updateProfile(values);
      if (response.success) {
        dispatch(updateUser(response.data));
        message.success('资料更新成功');
        onSave?.();
      }
    } catch (error) {
      message.error('资料更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    try {
      const response = await userService.uploadAvatar(file);
      if (response.success && response.data?.url) {
        form.setFieldValue('avatar', response.data.url);
        dispatch(updateUser({ profile: { avatar: response.data.url } }));
        message.success('头像上传成功');
      }
    } catch (error) {
      message.error('头像上传失败');
    } finally {
      setAvatarUploading(false);
    }
    return false; // 阻止默认上传行为
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      initialValues={{
        first_name: user?.profile?.first_name,
        last_name: user?.profile?.last_name,
        bio: user?.profile?.bio,
        hourly_rate: user?.profile?.hourly_rate,
        years_of_experience: user?.profile?.years_of_experience,
      }}
    >
      <Form.Item label="头像">
        <Upload
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={handleAvatarUpload}
        >
          {user?.profile?.avatar ? (
            <img
              src={user.profile.avatar}
              alt="头像"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>上传头像</div>
            </div>
          )}
        </Upload>
      </Form.Item>

      <Form.Item label="姓名">
        <Input.Group compact>
          <Form.Item name="first_name" noStyle>
            <Input placeholder="姓" style={{ width: '50%' }} />
          </Form.Item>
          <Form.Item name="last_name" noStyle>
            <Input placeholder="名" style={{ width: '50%' }} />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item
        name="bio"
        label="个人简介"
        rules={[
          { max: 2000, message: '个人简介不能超过2000字' },
        ]}
      >
        <TextArea
          rows={4}
          placeholder="介绍一下你自己..."
          showCount
          maxLength={2000}
        />
      </Form.Item>

      <Form.Item
        name="hourly_rate"
        label="时薪 (元/小时)"
        rules={[
          { required: true, message: '请输入时薪' },
          { type: 'number', min: 0, message: '时薪不能为负数' },
        ]}
      >
        <Input
          type="number"
          placeholder="请输入时薪"
          addonAfter="元/小时"
        />
      </Form.Item>

      <Form.Item
        name="years_of_experience"
        label="工作经验 (年)"
        rules={[
          { type: 'number', min: 0, message: '工作经验不能为负数' },
        ]}
      >
        <Input
          type="number"
          placeholder="请输入工作经验"
          addonAfter="年"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading || avatarUploading}
          size="large"
        >
          保存资料
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProfileEditor;
```

---

## 4. 服务系统集成

### 4.1 服务列表和搜索

#### 服务服务类
```typescript
// src/services/gig.ts
import apiClient from './api';
import { ApiResponse, PaginationResponse, SearchParams } from '@/types/common';
import { Gig, GigCreateParams, GigCategory } from '@/types/gig';

interface GigListParams extends SearchParams {
  category?: string;
  min_price?: number;
  max_price?: number;
  featured?: boolean;
  user_type?: 'client' | 'freelancer';
}

class GigService {
  // 获取服务列表
  async getGigs(params?: GigListParams): Promise<ApiResponse<PaginationResponse<Gig>>> {
    return apiClient.get('/gigs/', { params });
  }

  // 获取服务详情
  async getGig(slug: string): Promise<ApiResponse<Gig>> {
    return apiClient.get(`/gigs/${slug}/`);
  }

  // 创建服务
  async createGig(data: GigCreateParams): Promise<ApiResponse<Gig>> {
    return apiClient.post('/gigs/create/', data);
  }

  // 更新服务
  async updateGig(slug: string, data: Partial<GigCreateParams>): Promise<ApiResponse<Gig>> {
    return apiClient.put(`/gigs/${slug}/update/`, data);
  }

  // 删除服务
  async deleteGig(slug: string): Promise<ApiResponse> {
    return apiClient.delete(`/gigs/${slug}/delete/`);
  }

  // 收藏/取消收藏服务
  async toggleFavorite(slug: string): Promise<ApiResponse<{ is_favorited: boolean }>> {
    return apiClient.post(`/gigs/${slug}/favorite/`);
  }

  // 获取用户收藏列表
  async getFavorites(params?: SearchParams): Promise<ApiResponse<PaginationResponse<Gig>>> {
    return apiClient.get('/gigs/favorites/', { params });
  }

  // 获取分类列表
  async getCategories(): Promise<ApiResponse<GigCategory[]>> {
    return apiClient.get('/gigs/categories/');
  }

  // 搜索建议
  async getSearchSuggestions(q: string): Promise<ApiResponse<{
    suggestions: string[];
    categories: GigCategory[];
  }>> {
    return apiClient.get('/gigs/search/suggestions/', { params: { q } });
  }

  // 获取服务统计数据
  async getGigAnalytics(slug: string): Promise<ApiResponse> {
    return apiClient.get(`/gigs/${slug}/analytics/`);
  }

  // 获取自由职业者的服务
  async getFreelancerGigs(params?: SearchParams): Promise<ApiResponse<PaginationResponse<Gig>>> {
    return apiClient.get('/gigs/my-gigs/', { params });
  }
}

export const gigService = new GigService();
```

#### 服务列表组件
```typescript
// src/components/gigs/GigList.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Pagination, Select, Input, Slider, Button, Tag, Avatar } from 'antd';
import { SearchOutlined, StarOutlined, HeartOutlined } from '@ant-design/icons';
import { gigService } from '@/services/gig';
import { Gig } from '@/types/gig';

const { Search } = Input;
const { Option } = Select;

interface GigListProps {
  freelancerId?: string;
  showFavorites?: boolean;
}

const GigList: React.FC<GigListProps> = ({ freelancerId, showFavorites }) => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: 0,
    max_price: 10000,
    sort: 'newest',
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadGigs();
    loadCategories();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadGigs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...filters,
      };

      let response;
      if (showFavorites) {
        response = await gigService.getFavorites(params);
      } else {
        response = await gigService.getGigs(params);
      }

      if (response.success && response.data) {
        setGigs(response.data.results);
        setPagination(prev => ({
          ...prev,
          total: response.data.count,
        }));
      }
    } catch (error) {
      console.error('Failed to load gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await gigService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, category: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sort: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePriceChange = (value: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      min_price: value[0],
      max_price: value[1],
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleToggleFavorite = async (slug: string) => {
    try {
      const response = await gigService.toggleFavorite(slug);
      if (response.success) {
        // 更新本地状态
        setGigs(prev => prev.map(gig =>
          gig.slug === slug
            ? { ...gig, is_favorited: response.data.is_favorited }
            : gig
        ));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const renderGigCard = (gig: Gig) => (
    <Col xs={24} sm={12} lg={8} xl={6} key={gig.id}>
      <Card
        hoverable
        cover={
          <div style={{ height: 200, overflow: 'hidden' }}>
            <img
              src={gig.thumbnail || '/placeholder-gig.jpg'}
              alt={gig.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        }
        actions={[
          <Button
            type="text"
            icon={<HeartOutlined />}
            onClick={() => handleToggleFavorite(gig.slug)}
            style={{ color: gig.is_favorited ? '#ff4d4f' : undefined }}
          />,
          <Button type="text" icon={<StarOutlined />} />,
        ]}
      >
        <Card.Meta
          title={
            <div style={{ height: 48, overflow: 'hidden' }}>
              {gig.title}
              {gig.is_featured && (
                <Tag color="gold" size="small" style={{ marginLeft: 8 }}>
                  精选
                </Tag>
              )}
            </div>
          }
          description={
            <div>
              <div style={{ marginBottom: 8 }}>
                <Avatar size="small" src={gig.freelancer.avatar} />
                <span style={{ marginLeft: 8 }}>{gig.freelancer.display_name}</span>
                <span style={{ marginLeft: 8, color: '#faad14' }}>
                  <StarOutlined /> {gig.average_rating} ({gig.review_count})
                </span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#666' }}>{gig.category.name}</span>
              </div>
              <div style={{ fontWeight: 'bold', color: '#f50' }}>
                ¥{gig.packages[0]?.price || 0}
                <span style={{ fontWeight: 'normal', color: '#666', fontSize: 12 }}>
                  起
                </span>
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  return (
    <div>
      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索服务..."
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: '100%' }}
              onChange={handleCategoryChange}
              value={filters.category || undefined}
            >
              {categories.map((cat: any) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="排序方式"
              style={{ width: '100%' }}
              onChange={handleSortChange}
              value={filters.sort}
            >
              <Option value="newest">最新</Option>
              <Option value="price_low">价格从低到高</Option>
              <Option value="price_high">价格从高到低</Option>
              <Option value="rating">评分最高</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ marginBottom: 8 }}>价格范围: ¥{filters.min_price} - ¥{filters.max_price}</div>
            <Slider
              range
              min={0}
              max={10000}
              step={100}
              value={[filters.min_price, filters.max_price]}
              onChange={handlePriceChange}
            />
          </Col>
        </Row>
      </Card>

      {/* 服务列表 */}
      <Row gutter={[16, 16]}>
        {gigs.map(renderGigCard)}
      </Row>

      {/* 分页 */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }
          onChange={(page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize }));
          }}
        />
      </div>
    </div>
  );
};

export default GigList;
```

---

## 5. 订单系统集成

### 5.1 订单创建和管理

#### 订单服务类
```typescript
// src/services/order.ts
import apiClient from './api';
import { ApiResponse, PaginationResponse, PaginatedParams } from '@/types/common';
import { Order, OrderCreateParams, OrderStatus } from '@/types/order';

interface OrderListParams extends PaginatedParams {
  status?: OrderStatus;
  role?: 'client' | 'freelancer';
}

class OrderService {
  // 创建订单
  async createOrder(data: OrderCreateParams): Promise<ApiResponse<Order>> {
    return apiClient.post('/orders/create/', data);
  }

  // 获取订单列表
  async getOrders(params?: OrderListParams): Promise<ApiResponse<PaginationResponse<Order>>> {
    return apiClient.get('/orders/', { params });
  }

  // 获取订单详情
  async getOrder(orderNumber: string): Promise<ApiResponse<Order>> {
    return apiClient.get(`/orders/${orderNumber}/`);
  }

  // 更新订单状态
  async updateOrderStatus(orderNumber: string, data: {
    status: OrderStatus;
    notes?: string;
  }): Promise<ApiResponse> {
    return apiClient.post(`/orders/${orderNumber}/update_status/`, data);
  }

  // 提交交付
  async submitDelivery(orderNumber: string, data: {
    title: string;
    description: string;
    message: string;
    files: File[];
    is_final_delivery: boolean;
  }): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('message', data.message);
    formData.append('is_final_delivery', data.is_final_delivery.toString());

    data.files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    return apiClient.post(`/orders/${orderNumber}/deliver/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // 响应交付
  async respondToDelivery(orderNumber: string, deliveryId: string, data: {
    is_accepted: boolean;
    rejected_reason?: string;
  }): Promise<ApiResponse> {
    return apiClient.post(`/orders/${orderNumber}/delivery/${deliveryId}/respond/`, data);
  }

  // 创建争议
  async createDispute(orderNumber: string, data: {
    dispute_type: string;
    description: string;
    evidence?: string[];
  }): Promise<ApiResponse> {
    return apiClient.post(`/orders/${orderNumber}/dispute/`, data);
  }
}

export const orderService = new OrderService();
```

#### 订单创建组件
```typescript
// src/components/orders/OrderCreate.tsx
import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, message, Steps, Divider } from 'antd';
import { PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService } from '@/services/order';
import { Gig } from '@/types/gig';

const { TextArea } = Input;
const { Step } = Steps;

interface OrderCreateProps {
  gig: Gig;
  selectedPackage: any;
  onOrderCreated?: (order: any) => void;
}

const OrderCreate: React.FC<OrderCreateProps> = ({
  gig,
  selectedPackage,
  onOrderCreated
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  // 初始化需求数据
  React.useEffect(() => {
    if (gig.requirements) {
      setRequirements(gig.requirements.map(req => ({
        ...req,
        value: '',
      })));
    }
  }, [gig]);

  const calculateTotalPrice = () => {
    let total = selectedPackage.price;
    selectedExtras.forEach(extra => {
      total += extra.price * (extra.quantity || 1);
    });
    return total;
  };

  const handleRequirementChange = (index: number, value: string) => {
    setRequirements(prev => {
      const updated = [...prev];
      updated[index].value = value;
      return updated;
    });
  };

  const handleFileUpload = (index: number, file: File) => {
    setRequirements(prev => {
      const updated = [...prev];
      updated[index].file = file;
      return updated;
    });
    return false; // 阻止默认上传
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const orderData = {
        gig_id: gig.id,
        package_id: selectedPackage.id,
        title: values.title || gig.title,
        description: values.description,
        requirements: requirements.map(req => ({
          requirement_id: req.id,
          response: req.value,
        })),
        extras: selectedExtras.map(extra => ({
          extra_id: extra.id,
          quantity: extra.quantity || 1,
        })),
        client_email: values.client_email || user?.email,
        client_phone: values.client_phone || user?.profile?.phone_number,
      };

      const response = await orderService.createOrder(orderData);
      if (response.success && response.data) {
        message.success('订单创建成功');
        onOrderCreated?.(response.data);
        navigate(`/orders/${response.data.order_number}`);
      }
    } catch (error) {
      message.error('订单创建失败');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <h3>选择套餐</h3>
            <div style={{ marginBottom: 24 }}>
              {gig.packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  style={{
                    marginBottom: 16,
                    border: selectedPackage.id === pkg.id ? '2px solid #1890ff' : undefined,
                  }}
                  onClick={() => onOrderCreated?.({ selectedPackage: pkg })}
                >
                  <h4>{pkg.title} - ¥{pkg.price}</h4>
                  <p>{pkg.description}</p>
                  <ul>
                    {pkg.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <p>交付时间: {pkg.delivery_days} 天</p>
                  <p>修改次数: {pkg.revisions} 次</p>
                </Card>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h3>选择附加服务</h3>
            {gig.extras?.map((extra) => (
              <Card key={extra.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>{extra.title}</h4>
                    <p>{extra.description}</p>
                    <p>¥{extra.price} (额外 {extra.delivery_days} 天)</p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      min={0}
                      placeholder="数量"
                      style={{ width: 80, marginRight: 8 }}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 0;
                        setSelectedExtras(prev =>
                          prev.map(ex =>
                            ex.id === extra.id
                              ? { ...ex, quantity }
                              : ex
                          )
                        );
                      }}
                    />
                    <Button
                      type={selectedExtras.find(ex => ex.id === extra.id) ? 'primary' : 'default'}
                      onClick={() => {
                        setSelectedExtras(prev =>
                          prev.find(ex => ex.id === extra.id)
                            ? prev.filter(ex => ex.id !== extra.id)
                            : [...prev, { ...extra, quantity: 1 }]
                        );
                      }}
                    >
                      {selectedExtras.find(ex => ex.id === extra.id) ? '已选择' : '添加'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      case 2:
        return (
          <div>
            <h3>提供需求信息</h3>
            {requirements.map((req, index) => (
              <div key={req.id} style={{ marginBottom: 16 }}>
                <label style={{ marginBottom: 8, display: 'block' }}>
                  {req.requirement_text}
                  {req.is_required && <span style={{ color: 'red' }}> *</span>}
                </label>
                {req.input_type === 'text' && (
                  <Input
                    placeholder="请输入..."
                    value={req.value}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                  />
                )}
                {req.input_type === 'textarea' && (
                  <TextArea
                    rows={4}
                    placeholder="请输入..."
                    value={req.value}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                  />
                )}
                {req.input_type === 'file' && (
                  <Upload
                    beforeUpload={(file) => handleFileUpload(index, file)}
                    showUploadList={false}
                  >
                    <Button icon={<PlusOutlined />}>上传文件</Button>
                    {req.file && <span style={{ marginLeft: 8 }}>{req.file.name}</span>}
                  </Upload>
                )}
              </div>
            ))}

            <Divider />

            <Form.Item
              name="title"
              label="订单标题"
              initialValue={gig.title}
            >
              <Input placeholder="订单标题" />
            </Form.Item>

            <Form.Item
              name="description"
              label="详细描述"
            >
              <TextArea
                rows={4}
                placeholder="请详细描述您的需求..."
              />
            </Form.Item>

            <Form.Item
              name="client_email"
              label="联系邮箱"
              initialValue={user?.email}
              rules={[{ required: true, message: '请输入联系邮箱' }]}
            >
              <Input type="email" placeholder="联系邮箱" />
            </Form.Item>

            <Form.Item
              name="client_phone"
              label="联系电话"
              initialValue={user?.profile?.phone_number}
            >
              <Input placeholder="联系电话" />
            </Form.Item>
          </div>
        );

      case 3:
        return (
          <div>
            <h3>确认订单</h3>
            <Card>
              <h4>服务信息</h4>
              <p><strong>标题:</strong> {gig.title}</p>
              <p><strong>自由职业者:</strong> {gig.freelancer.display_name}</p>
              <p><strong>套餐:</strong> {selectedPackage.title}</p>

              <h4>价格明细</h4>
              <p><strong>基础价格:</strong> ¥{selectedPackage.price}</p>
              {selectedExtras.map(extra => (
                <p key={extra.id}>
                  <strong>{extra.title}:</strong> ¥{extra.price} × {extra.quantity || 1} = ¥{extra.price * (extra.quantity || 1)}
                </p>
              ))}
              <Divider />
              <p><strong>平台费用:</strong> ¥{calculateTotalPrice() * 0.1}</p>
              <p><strong>总计:</strong> ¥{calculateTotalPrice() * 1.1}</p>

              <h4>交付信息</h4>
              <p><strong>预计交付:</strong> {selectedPackage.delivery_days} 天</p>
              <p><strong>修改次数:</strong> {selectedPackage.revisions} 次</p>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card title={<><ShoppingCartOutlined /> 创建订单</>}>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="选择套餐" />
        <Step title="附加服务" />
        <Step title="需求信息" />
        <Step title="确认订单" />
      </Steps>

      <Form form={form} onFinish={handleSubmit}>
        {renderStepContent()}

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          {currentStep > 0 && (
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              上一步
            </Button>
          )}
          {currentStep < 3 ? (
            <Button
              type="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              下一步
            </Button>
          ) : (
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<ShoppingCartOutlined />}
            >
              创建订单
            </Button>
          )}
        </div>
      </Form>
    </Card>
  );
};

export default OrderCreate;
```

---

## 6. 消息系统集成

### 6.1 实时消息处理

#### 消息服务类
```typescript
// src/services/messaging.ts
import apiClient from './api';
import { ApiResponse, PaginationResponse, PaginatedParams } from '@/types/common';
import { Conversation, Message } from '@/types/messaging';

interface ConversationListParams extends PaginatedParams {
  type?: string;
  archived?: boolean;
}

class MessagingService {
  // 获取对话列表
  async getConversations(params?: ConversationListParams): Promise<ApiResponse<PaginationResponse<Conversation>>> {
    return apiClient.get('/messaging/conversations/', { params });
  }

  // 获取对话详情
  async getConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    return apiClient.get(`/messaging/conversations/${conversationId}/`);
  }

  // 创建新对话
  async createConversation(data: {
    participant_id: string;
    conversation_type?: string;
    subject?: string;
    initial_message?: string;
  }): Promise<ApiResponse<Conversation>> {
    return apiClient.post('/messaging/conversations/', data);
  }

  // 获取消息列表
  async getMessages(conversationId: string, params?: PaginatedParams & {
    before?: string;
  }): Promise<ApiResponse<PaginationResponse<Message>>> {
    return apiClient.get(`/messaging/conversations/${conversationId}/messages/`, { params });
  }

  // 发送消息
  async sendMessage(conversationId: string, data: {
    message_type: string;
    content: string;
    reply_to?: string;
  }): Promise<ApiResponse<Message>> {
    return apiClient.post(`/messaging/conversations/${conversationId}/messages/`, data);
  }

  // 上传文件
  async uploadFile(file: File, conversationId: string): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversation_id', conversationId);

    return apiClient.post('/messaging/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // 标记消息为已读
  async markAsRead(conversationId: string): Promise<ApiResponse> {
    return apiClient.post(`/messaging/conversations/${conversationId}/mark_read/`);
  }

  // 归档对话
  async archiveConversation(conversationId: string): Promise<ApiResponse> {
    return apiClient.post(`/messaging/conversations/${conversationId}/archive/`);
  }

  // 拉黑用户
  async blockUser(data: {
    user_id: string;
    reason?: string;
  }): Promise<ApiResponse> {
    return apiClient.post('/messaging/block_user/', data);
  }
}

export const messagingService = new MessagingService();
```

#### WebSocket连接管理
```typescript
// src/services/websocket.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  connect(token: string) {
    const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/ws/messaging/?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    const listeners = this.listeners.get(type) || [];
    listeners.forEach(listener => listener(payload));
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
          this.connect(token);
        }
      }, this.reconnectInterval);
    }
  }

  send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  subscribe(type: string, listener: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  unsubscribe(type: string, listener: (data: any) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

export const wsService = new WebSocketService();
```

#### 消息组件
```typescript
// src/components/messaging/MessageList.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, List, Avatar, Input, Button, Upload, message, Spin } from 'antd';
import { SendOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { messagingService } from '@/services/messaging';
import { wsService } from '@/services/websocket';
import { Message } from '@/types/messaging';

const { TextArea } = Input;

interface MessageListProps {
  conversationId: string;
  otherParticipant: any;
}

const MessageList: React.FC<MessageListProps> = ({
  conversationId,
  otherParticipant
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    loadMessages();
    setupWebSocket();
    markAsRead();

    return () => {
      wsService.unsubscribe('new_message', handleNewMessage);
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await messagingService.getMessages(conversationId);
      if (response.success && response.data) {
        setMessages(response.data.results.reverse());
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      wsService.connect(token);
    }

    wsService.subscribe('new_message', handleNewMessage);
    wsService.subscribe('message_read', handleMessageRead);
  };

  const handleNewMessage = (data: any) => {
    if (data.conversation_id === conversationId) {
      setMessages(prev => [...prev, data.message]);
      markAsRead();
    }
  };

  const handleMessageRead = (data: any) => {
    if (data.conversation_id === conversationId) {
      setMessages(prev => prev.map(msg =>
        msg.id === data.message_id
          ? { ...msg, is_read: true, read_at: data.read_at }
          : msg
      ));
    }
  };

  const markAsRead = async () => {
    try {
      await messagingService.markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await messagingService.sendMessage(conversationId, {
        message_type: 'text',
        content: newMessage.trim(),
      });

      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      message.error('发送失败');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const response = await messagingService.uploadFile(file, conversationId);
      if (response.success && response.data) {
        const messageResponse = await messagingService.sendMessage(conversationId, {
          message_type: 'file',
          content: file.name,
        });
        if (messageResponse.success && messageResponse.data) {
          setMessages(prev => [...prev, messageResponse.data]);
          scrollToBottom();
        }
      }
    } catch (error) {
      message.error('文件上传失败');
    } finally {
      setUploading(false);
    }
    return false; // 阻止默认上传
  };

  const renderMessage = (msg: Message) => {
    const isOwnMessage = msg.sender.id === user?.id;

    return (
      <div
        key={msg.id}
        style={{
          display: 'flex',
          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
          marginBottom: 16,
        }}
      >
        <div style={{ maxWidth: '70%', display: 'flex', alignItems: 'flex-start' }}>
          {!isOwnMessage && (
            <Avatar
              src={msg.sender.avatar}
              style={{ marginRight: 8 }}
            />
          )}
          <div>
            {!isOwnMessage && (
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                {msg.sender.display_name}
              </div>
            )}
            <Card
              size="small"
              style={{
                backgroundColor: isOwnMessage ? '#1890ff' : '#f0f0f0',
                color: isOwnMessage ? 'white' : 'black',
              }}
            >
              {msg.message_type === 'text' && (
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              )}
              {msg.message_type === 'file' && (
                <div>
                  <PaperClipOutlined /> {msg.content}
                </div>
              )}
            </Card>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {new Date(msg.created_at).toLocaleString()}
              {msg.is_read && isOwnMessage && (
                <span style={{ marginLeft: 8 }}>已读</span>
              )}
            </div>
          </div>
          {isOwnMessage && (
            <Avatar
              src={msg.sender.avatar}
              style={{ marginLeft: 8 }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Card
      title={otherParticipant?.display_name}
      extra={<Avatar src={otherParticipant?.avatar} />}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin />
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 0' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <Upload
            beforeUpload={handleFileUpload}
            showUploadList={false}
            disabled={uploading}
          >
            <Button
              icon={<PaperClipOutlined />}
              loading={uploading}
            />
          </Upload>

          <TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="输入消息..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={sending}
            disabled={!newMessage.trim()}
          />
        </div>
      </div>
    </Card>
  );
};

export default MessageList;
```

---

## 7. 错误处理和用户体验

### 7.1 全局错误处理

#### 错误边界组件
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // 发送错误报告到监控服务
    this.reportError(error, errorInfo);
  }

  reportError(error: Error, errorInfo: React.ErrorInfo) {
    // 这里可以集成错误监控服务，如 Sentry
    if (import.meta.env.PROD) {
      // 发送到错误监控服务
      console.log('Reporting error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Result
          status="500"
          title="页面出现错误"
          subTitle="抱歉，页面出现了意外错误，请稍后重试"
          extra={
            <Button type="primary" onClick={this.handleRetry}>
              重试
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 7.2 加载状态管理

#### 全局加载组件
```typescript
// src/components/LoadingSpinner.tsx
import React from 'react';
import { Spin } from 'antd';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  spinning?: boolean;
  children?: React.ReactNode;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  tip = '加载中...',
  spinning = true,
  children,
}) => {
  if (children) {
    return (
      <Spin size={size} tip={tip} spinning={spinning}>
        {children}
      </Spin>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
    }}>
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default LoadingSpinner;
```

### 7.3 网络状态监控

#### 网络状态组件
```typescript
// src/components/NetworkStatus.tsx
import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'antd';
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert || isOnline) {
    return null;
  }

  return (
    <Alert
      message="网络连接已断开"
      description="请检查您的网络连接，部分功能可能无法使用"
      type="warning"
      icon={<DisconnectOutlined />}
      action={
        <Button
          size="small"
          type="primary"
          onClick={() => window.location.reload()}
        >
          重新加载
        </Button>
      }
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    />
  );
};

export default NetworkStatus;
```

---

## 8. 性能优化

### 8.1 组件懒加载

```typescript
// src/utils/lazyLoad.ts
import React, { Suspense } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export const lazyLoad = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  const LazyComponent = React.lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// 使用示例
export const GigDetailPage = lazyLoad(() => import('@/pages/gigs/GigDetailPage'));
export const OrderCreatePage = lazyLoad(() => import('@/pages/orders/OrderCreatePage'));
```

### 8.2 数据缓存

```typescript
// src/utils/cache.ts
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttl: number = 300000): void { // 默认5分钟
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const cache = new SimpleCache();
```

### 8.3 虚拟滚动

```typescript
// src/components/VirtualList.tsx
import React, { useMemo, useRef, useEffect } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, visibleRange.startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}

export default VirtualList;
```

---

## 9. 测试

### 9.1 API测试

```typescript
// src/__tests__/api.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { authService } from '@/services/auth';

const server = setupServer(
  rest.post('/api/auth/token/', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          access: 'mock_access_token',
          refresh: 'mock_refresh_token',
          user: {
            id: 'user-123',
            username: 'testuser',
            email: 'test@example.com',
            user_type: 'freelancer',
          },
        },
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AuthService', () => {
  it('should login successfully', async () => {
    const response = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.success).toBe(true);
    expect(response.data?.user.username).toBe('testuser');
    expect(localStorage.getItem('access_token')).toBe('mock_access_token');
  });
});
```

### 9.2 组件测试

```typescript
// src/__tests__/components/GigList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GigList from '@/components/gigs/GigList';
import { gigService } from '@/services/gig';

// Mock API
vi.mock('@/services/gig');
const mockGigService = gigService as any;

const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: { id: 'user-123', user_type: 'freelancer' },
      isAuthenticated: true,
    }),
  },
});

describe('GigList', () => {
  beforeEach(() => {
    mockGigService.getGigs.mockResolvedValue({
      success: true,
      data: {
        count: 1,
        results: [
          {
            id: 'gig-123',
            title: 'Test Gig',
            slug: 'test-gig',
            price: 100,
            freelancer: {
              display_name: 'Test User',
              avatar: null,
              rating: 4.5,
              review_count: 10,
            },
            category: { name: 'Design' },
            thumbnail: null,
          },
        ],
      },
    });
  });

  it('should render gig list', async () => {
    render(
      <Provider store={mockStore}>
        <GigList />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Gig')).toBeInTheDocument();
    });
  });
});
```

---

## 10. 部署配置

### 10.1 生产环境配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          utils: ['axios', 'dayjs'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### 10.2 Docker配置

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 总结

本前端集成指南提供了完整的集成方案，包括：

1. **项目配置**: 环境变量、API客户端、类型定义
2. **认证系统**: JWT管理、第三方登录集成
3. **用户系统**: 资料管理、技能管理
4. **服务系统**: 列表展示、搜索过滤、CRUD操作
5. **订单系统**: 订单创建、状态管理、交付流程
6. **消息系统**: 实时通信、WebSocket集成
7. **错误处理**: 全局错误边界、加载状态、网络监控
8. **性能优化**: 懒加载、缓存、虚拟滚动
9. **测试策略**: 单元测试、组件测试
10. **部署配置**: 生产环境构建、Docker部署

遵循本指南可以快速、高效地完成前端与后端的集成工作，确保应用的稳定性、性能和用户体验。