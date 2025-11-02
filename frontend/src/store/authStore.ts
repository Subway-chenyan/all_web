import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse } from '../types';
import { AuthApi } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'freelancer' | 'client';
  }) => Promise<boolean>;
  socialLogin: (provider: string, accessToken: string) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });

        try {
          const response = await AuthApi.login({ email, password, rememberMe });

          if (response.success && response.data) {
            const authData = response.data as AuthResponse;

            set({
              user: authData.user,
              token: authData.token,
              refreshToken: authData.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Store tokens in localStorage
            localStorage.setItem('accessToken', authData.token);
            localStorage.setItem('refreshToken', authData.refreshToken);

            return true;
          } else {
            set({
              error: response.message || '登录失败',
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            error: '登录失败，请稍后重试',
            isLoading: false,
          });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await AuthApi.register(userData);

          if (response.success && response.data) {
            const authData = response.data as AuthResponse;

            set({
              user: authData.user,
              token: authData.token,
              refreshToken: authData.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Store tokens in localStorage
            localStorage.setItem('accessToken', authData.token);
            localStorage.setItem('refreshToken', authData.refreshToken);

            return true;
          } else {
            set({
              error: response.message || '注册失败',
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            error: '注册失败，请稍后重试',
            isLoading: false,
          });
          return false;
        }
      },

      socialLogin: async (provider: string, accessToken: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await AuthApi.socialAuth(provider, accessToken);

          if (response.success && response.data) {
            const authData = response.data as AuthResponse;

            set({
              user: authData.user,
              token: authData.token,
              refreshToken: authData.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Store tokens in localStorage
            localStorage.setItem('accessToken', authData.token);
            localStorage.setItem('refreshToken', authData.refreshToken);

            return true;
          } else {
            set({
              error: response.message || '社交登录失败',
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            error: '社交登录失败，请稍后重试',
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });

        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Call logout API (optional, as token will be invalidated server-side)
        AuthApi.logout().catch(() => {
          // Ignore logout API errors
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          get().logout();
          return false;
        }

        try {
          const response = await AuthApi.refreshToken(refreshToken);

          if (response.success && response.data) {
            const authData = response.data as AuthResponse;

            set({
              token: authData.token,
              refreshToken: authData.refreshToken,
              isAuthenticated: true,
            });

            // Update localStorage
            localStorage.setItem('accessToken', authData.token);
            localStorage.setItem('refreshToken', authData.refreshToken);

            return true;
          } else {
            get().logout();
            return false;
          }
        } catch (error) {
          get().logout();
          return false;
        }
      },

      updateProfile: async (userData) => {
        const { user } = get();

        if (!user) {
          return false;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await AuthApi.updateProfile(userData);

          if (response.success && response.data) {
            const updatedUser = response.data as User;

            set({
              user: updatedUser,
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            set({
              error: response.message || '更新资料失败',
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            error: '更新资料失败，请稍后重试',
            isLoading: false,
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for easy access to specific parts of the state
export const useAuth = () => {
  const auth = useAuthStore();
  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login: auth.login,
    register: auth.register,
    socialLogin: auth.socialLogin,
    logout: auth.logout,
    refreshToken: auth.refreshToken,
    refreshAccessToken: auth.refreshAccessToken,
    updateProfile: auth.updateProfile,
    clearError: auth.clearError,
  };
};

export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);