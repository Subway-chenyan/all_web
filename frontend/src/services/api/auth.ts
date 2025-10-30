import { apiRequest } from './index';
import { LoginCredentials, RegisterData, AuthResponse, SocialAuthData } from '@/types';

export const authService = {
  // Login
  login: async (credentials: LoginCredentials) => {
    const response = await apiRequest.post<AuthResponse>('/auth/login/', credentials);
    return response.data;
  },

  // Register
  register: async (userData: RegisterData) => {
    const response = await apiRequest.post<AuthResponse>('/auth/register/', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiRequest.post('/auth/logout/');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refresh: string) => {
    const response = await apiRequest.post<{ access: string }>('/auth/token/refresh/', { refresh });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string) => {
    const response = await apiRequest.post('/auth/verify-email/', { token });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string) => {
    const response = await apiRequest.post('/auth/resend-verification/', { email });
    return response.data;
  },

  // Password reset request
  requestPasswordReset: async (email: string) => {
    const response = await apiRequest.post('/auth/password-reset/', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiRequest.post('/auth/password-reset-confirm/', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await apiRequest.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // Social authentication
  socialAuth: async (data: SocialAuthData) => {
    const response = await apiRequest.post<AuthResponse>(`/auth/${data.provider}/`, data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiRequest.get('/auth/me/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    const response = await apiRequest.put('/auth/profile/', profileData);
    return response.data;
  },
};