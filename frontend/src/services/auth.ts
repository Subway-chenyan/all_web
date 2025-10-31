import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  SocialAuthData,
  User,
  ApiResponse
} from '@/types';
import { API_ENDPOINTS } from '@/constants';

// Create axios instance for authentication
class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token for Django
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
          config.headers['X-CSRFToken'] = csrfToken;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const token = this.getStoredToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management utilities
  private getStoredToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  }

  private storeTokens(accessToken: string, refreshToken: string, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('access_token', accessToken);
    storage.setItem('refresh_token', refreshToken);

    // Also store in the other storage for consistency
    if (rememberMe) {
      sessionStorage.setItem('access_token', accessToken);
      sessionStorage.setItem('refresh_token', refreshToken);
    } else {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_remember');
  }

  private getCSRFToken(): string {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }

    return '';
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const { access, refresh, user } = response.data;

      // Store tokens
      this.storeTokens(access, refresh, credentials.rememberMe);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || '登录失败';
        throw new Error(message);
      }
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );

      const { access, refresh, user } = response.data;

      // Store tokens
      this.storeTokens(access, refresh);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || '注册失败';
        throw new Error(message);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear tokens locally
      this.clearTokens();
    }
  }

  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response: AxiosResponse<{ access: string }> = await this.api.post(
        API_ENDPOINTS.AUTH.REFRESH,
        { refresh: refreshToken }
      );

      const { access } = response.data;

      // Update the stored access token
      const rememberMe = localStorage.getItem('auth_remember') === 'true';
      this.storeTokens(access, refreshToken, rememberMe);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || 'Token刷新失败';
        throw new Error(message);
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.api.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || '获取用户信息失败';
        throw new Error(message);
      }
      throw error;
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.api.patch(
        API_ENDPOINTS.AUTH.PROFILE,
        userData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || '更新个人信息失败';
        throw new Error(message);
      }
      throw error;
    }
  }

  // Email verification
  async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        { token }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || '邮箱验证失败';
        throw new Error(message);
      }
      throw error;
    }
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        { email }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || '发送验证邮件失败';
        throw new Error(message);
      }
      throw error;
    }
  }

  // Password reset
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post(
        API_ENDPOINTS.AUTH.PASSWORD_RESET,
        { email }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || '发送重置邮件失败';
        throw new Error(message);
      }
      throw error;
    }
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post(
        API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM,
        {
          token,
          new_password: newPassword,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || '密码重置失败';
        throw new Error(message);
      }
      throw error;
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          old_password: oldPassword,
          new_password: newPassword,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || '密码修改失败';
        throw new Error(message);
      }
      throw error;
    }
  }

  // Social authentication
  async socialLogin(provider: 'wechat' | 'qq' | 'alipay', data: SocialAuthData): Promise<AuthResponse> {
    try {
      const endpoint = provider === 'wechat'
        ? API_ENDPOINTS.AUTH.SOCIAL.WECHAT
        : provider === 'qq'
        ? API_ENDPOINTS.AUTH.SOCIAL.QQ
        : '/api/auth/alipay/'; // Fallback for Alipay

      const response: AxiosResponse<AuthResponse> = await this.api.post(endpoint, data);

      const { access, refresh, user } = response.data;

      // Store tokens
      this.storeTokens(access, refresh);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.response?.data?.message || `${provider}登录失败`;
        throw new Error(message);
      }
      throw error;
    }
  }

  // Get social login URL
  getSocialLoginUrl(provider: 'wechat' | 'qq' | 'alipay'): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const redirectUrl = encodeURIComponent(`${window.location.origin}/auth/callback/${provider}`);

    switch (provider) {
      case 'wechat':
        return `${baseUrl}/api/auth/wechat/?redirect_uri=${redirectUrl}`;
      case 'qq':
        return `${baseUrl}/api/auth/qq/?redirect_uri=${redirectUrl}`;
      case 'alipay':
        return `${baseUrl}/api/auth/alipay/?redirect_uri=${redirectUrl}`;
      default:
        throw new Error(`Unsupported social provider: ${provider}`);
    }
  }

  // Check authentication status
  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        return false;
      }

      await this.getCurrentUser();
      return true;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  // Utility method to get auth headers for other API calls
  getAuthHeaders(): Record<string, string> {
    const token = this.getStoredToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const csrfToken = this.getCSRFToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    return headers;
  }

  // Retry logic for failed requests
  async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<AxiosResponse<T>> {
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Don't retry on authentication errors
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError;
  }
}

// Create singleton instance
const authService = new AuthService();

// Export service and types
export default authService;
export { AuthService };

// Export convenience functions
export const authApi = {
  login: authService.login.bind(authService),
  register: authService.register.bind(authService),
  logout: authService.logout.bind(authService),
  refreshToken: authService.refreshToken.bind(authService),
  getCurrentUser: authService.getCurrentUser.bind(authService),
  updateProfile: authService.updateProfile.bind(authService),
  verifyEmail: authService.verifyEmail.bind(authService),
  resendVerificationEmail: authService.resendVerificationEmail.bind(authService),
  requestPasswordReset: authService.requestPasswordReset.bind(authService),
  confirmPasswordReset: authService.confirmPasswordReset.bind(authService),
  changePassword: authService.changePassword.bind(authService),
  socialLogin: authService.socialLogin.bind(authService),
  getSocialLoginUrl: authService.getSocialLoginUrl.bind(authService),
  checkAuthStatus: authService.checkAuthStatus.bind(authService),
  getAuthHeaders: authService.getAuthHeaders.bind(authService),
  retryRequest: authService.retryRequest.bind(authService),
};