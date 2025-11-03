import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { ApiResponse, ApiError } from '../types';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.handleUnauthorized();
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private handleUnauthorized() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  private formatError(error: AxiosError): ApiError {
    const response = error.response?.data as any;

    if (response) {
      return {
        code: response.code || error.code || 'UNKNOWN_ERROR',
        message: response.message || error.message || 'An unexpected error occurred',
        field: response.field,
        details: response.details,
      };
    }

    return {
      code: error.code || 'NETWORK_ERROR',
      message: error.message || 'Network error occurred',
    };
  }

  // Generic request methods
  public async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as ApiError).message,
      };
    }
  }

  public async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as ApiError).message,
      };
    }
  }

  public async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as ApiError).message,
      };
    }
  }

  public async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(url, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as ApiError).message,
      };
    }
  }

  public async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as ApiError).message,
      };
    }
  }

  // File upload method
  public async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as ApiError).message,
      };
    }
  }

  // Multiple files upload
  public async uploadMultiple<T>(url: string, files: File[], onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as ApiError).message,
      };
    }
  }

  // Set authentication token
  public setAuthToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  // Clear authentication token
  public clearAuthToken() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Get raw axios instance for custom requests
  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export typed API service classes
export class AuthApi {
  static async login(credentials: { email: string; password: string; rememberMe?: boolean }) {
    return apiClient.post('/auth/login/', credentials);
  }

  static async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'freelancer' | 'client';
  }) {
    return apiClient.post('/auth/register/', userData);
  }

  static async socialAuth(provider: string, accessToken: string) {
    return apiClient.post(`/auth/social/${provider}/`, { accessToken });
  }

  static async logout() {
    return apiClient.post('/auth/logout/');
  }

  static async refreshToken(refreshToken: string) {
    return apiClient.post('/auth/refresh/', { refreshToken });
  }

  static async resetPassword(email: string) {
    return apiClient.post('/auth/password/reset/', { email });
  }

  static async confirmResetPassword(token: string, password: string) {
    return apiClient.post('/auth/password/reset/confirm/', { token, password });
  }

  static async verifyEmail(token: string) {
    return apiClient.post('/auth/email/verify/', { token });
  }

  static async resendVerificationEmail() {
    return apiClient.post('/auth/email/resend/');
  }

  static async updateProfile(userData: any) {
    return apiClient.patch('/auth/profile/', userData);
  }
}

export class ServicesApi {
  static async getServices(params?: {
    page?: number;
    page_size?: number;
    category?: string;
    subcategory?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    sort_by?: string;
  }) {
    // For development, use mock data when backend is not available
    if (import.meta.env.DEV) {
      try {
        const { mockServices, mockCategories } = await import('../data/mockData');
        let filteredServices = [...mockServices];

        // Apply filters
        if (params?.search) {
          const searchLower = params.search.toLowerCase();
          filteredServices = filteredServices.filter(service =>
            service.title.toLowerCase().includes(searchLower) ||
            service.description.toLowerCase().includes(searchLower) ||
            service.tags.some(tag => tag.toLowerCase().includes(searchLower))
          );
        }

        if (params?.category) {
          const category = mockCategories.find(cat => cat.id === params.category);
          if (category) {
            filteredServices = filteredServices.filter(service =>
              service.subcategory && category.subcategories.includes(service.subcategory)
            );
          }
        }

        if (params?.min_price) {
          filteredServices = filteredServices.filter(service => service.price >= params.min_price!);
        }

        if (params?.max_price) {
          filteredServices = filteredServices.filter(service => service.price <= params.max_price!);
        }

        // Apply sorting
        if (params?.sort_by) {
          switch (params.sort_by) {
            case 'newest':
              filteredServices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              break;
            case 'best_selling':
              filteredServices.sort((a, b) => b.totalOrders - a.totalOrders);
              break;
            case 'rating':
              filteredServices.sort((a, b) => b.rating - a.rating);
              break;
            case 'price_low':
              filteredServices.sort((a, b) => a.price - b.price);
              break;
            case 'price_high':
              filteredServices.sort((a, b) => b.price - a.price);
              break;
            default:
              // relevance - keep original order
              break;
          }
        }

        // Apply pagination
        const pageSize = params?.page_size || 20;
        const page = params?.page || 1;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedServices = filteredServices.slice(startIndex, endIndex);

        return {
          success: true,
          data: {
            count: filteredServices.length,
            next: endIndex < filteredServices.length ? `/services/?page=${page + 1}` : null,
            previous: page > 1 ? `/services/?page=${page - 1}` : null,
            results: paginatedServices,
          }
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to load services'
        };
      }
    }

    return apiClient.get('/services/', params);
  }

  static async getService(id: string) {
    // For development, use mock data when backend is not available
    if (import.meta.env.DEV) {
      try {
        const { mockServices } = await import('../data/mockData');
        const service = mockServices.find(s => s.id === id);

        if (service) {
          return {
            success: true,
            data: service
          };
        } else {
          return {
            success: false,
            message: 'Service not found'
          };
        }
      } catch (error) {
        return {
          success: false,
          message: 'Failed to load service'
        };
      }
    }

    return apiClient.get(`/services/${id}/`);
  }

  static async createService(serviceData: any) {
    return apiClient.post('/services/', serviceData);
  }

  static async updateService(id: string, serviceData: any) {
    return apiClient.put(`/services/${id}/`, serviceData);
  }

  static async deleteService(id: string) {
    return apiClient.delete(`/services/${id}/`);
  }

  static async likeService(id: string) {
    return apiClient.post(`/services/${id}/like/`);
  }

  static async unlikeService(id: string) {
    return apiClient.delete(`/services/${id}/like/`);
  }

  static async getCategories() {
    // For development, use mock data when backend is not available
    if (import.meta.env.DEV) {
      try {
        const { mockCategories } = await import('../data/mockData');
        return {
          success: true,
          data: mockCategories
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to load categories'
        };
      }
    }

    return apiClient.get('/services/categories/');
  }
}

export class UsersApi {
  static async getCurrentUser() {
    return apiClient.get('/users/me/');
  }

  static async updateProfile(profileData: any) {
    return apiClient.patch('/users/me/', profileData);
  }

  static async uploadAvatar(file: File) {
    return apiClient.upload('/users/me/avatar/', file);
  }

  static async getUserProfile(username: string) {
    return apiClient.get(`/users/${username}/`);
  }

  static async getUserServices(username: string) {
    return apiClient.get(`/users/${username}/services/`);
  }

  static async getUserReviews(username: string) {
    return apiClient.get(`/users/${username}/reviews/`);
  }
}

export class OrdersApi {
  static async getOrders(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    role?: 'buyer' | 'seller';
  }) {
    return apiClient.get('/orders/', params);
  }

  static async getOrder(id: string) {
    return apiClient.get(`/orders/${id}/`);
  }

  static async createOrder(orderData: {
    service: string;
    package: string;
    requirements?: string;
  }) {
    return apiClient.post('/orders/', orderData);
  }

  static async updateOrderStatus(id: string, status: string) {
    return apiClient.patch(`/orders/${id}/status/`, { status });
  }

  static async submitDelivery(id: string, files: File[], message?: string) {
    return apiClient.uploadMultiple(`/orders/${id}/deliver/`, files);
  }

  static async requestRevision(id: string, message: string) {
    return apiClient.post(`/orders/${id}/revision/`, { message });
  }

  static async completeOrder(id: string) {
    return apiClient.post(`/orders/${id}/complete/`);
  }

  static async cancelOrder(id: string, reason: string) {
    return apiClient.post(`/orders/${id}/cancel/`, { reason });
  }
}

export class ReviewsApi {
  static async createReview(reviewData: {
    order: string;
    rating: number;
    title?: string;
    content: string;
  }) {
    return apiClient.post('/reviews/', reviewData);
  }

  static async getReviews(params?: {
    page?: number;
    page_size?: number;
    user?: string;
    service?: string;
    rating?: number;
  }) {
    return apiClient.get('/reviews/', params);
  }

  static async updateReview(id: string, reviewData: any) {
    return apiClient.patch(`/reviews/${id}/`, reviewData);
  }

  static async deleteReview(id: string) {
    return apiClient.delete(`/reviews/${id}/`);
  }

  static async helpfulReview(id: string) {
    return apiClient.post(`/reviews/${id}/helpful/`);
  }
}

export class MessagingApi {
  static async getConversations() {
    return apiClient.get('/messaging/conversations/');
  }

  static async getConversation(id: string) {
    return apiClient.get(`/messaging/conversations/${id}/`);
  }

  static async createConversation(participants: string[]) {
    return apiClient.post('/messaging/conversations/', { participants });
  }

  static async getMessages(conversationId: string, params?: { page?: number; page_size?: number }) {
    return apiClient.get(`/messaging/conversations/${conversationId}/messages/`, params);
  }

  static async sendMessage(conversationId: string, content: string, attachments?: File[]) {
    if (attachments && attachments.length > 0) {
      return apiClient.uploadMultiple(`/messaging/conversations/${conversationId}/messages/`, attachments);
    }
    return apiClient.post(`/messaging/conversations/${conversationId}/messages/`, { content });
  }

  static async markAsRead(conversationId: string) {
    return apiClient.post(`/messaging/conversations/${conversationId}/read/`);
  }

  static async archiveConversation(id: string) {
    return apiClient.post(`/messaging/conversations/${id}/archive/`);
  }

  static async unarchiveConversation(id: string) {
    return apiClient.post(`/messaging/conversations/${id}/unarchive/`);
  }
}

export default apiClient;