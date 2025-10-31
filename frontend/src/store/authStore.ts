import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginCredentials, RegisterData, AuthResponse, SocialAuthData } from '@/types';

// Auth state interface
interface AuthState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Tokens
  accessToken: string | null;
  refreshToken: string | null;

  // Error state
  error: string | null;

  // Social login state
  socialLoginLoading: {
    wechat: boolean;
    qq: boolean;
    alipay: boolean;
  };

  // Form states
  loginForm: {
    email: string;
    password: string;
    rememberMe: boolean;
  };

  registerForm: {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    firstName: string;
    lastName: string;
    userType: 'client' | 'freelancer';
    phone?: string;
    agreeToTerms: boolean;
  };

  // Password reset state
  forgotPasswordEmail: string;
  resetPasswordToken: string | null;
}

// Auth actions interface
interface AuthActions {
  // Authentication actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;

  // Token management
  setTokens: (accessToken: string, refreshToken: string) => void;
  refreshAccessToken: () => Promise<void>;
  clearTokens: () => void;

  // Social login
  socialLogin: (provider: 'wechat' | 'qq' | 'alipay', data: SocialAuthData) => Promise<void>;

  // User management
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;

  // Form actions
  updateLoginForm: (data: Partial<AuthState['loginForm']>) => void;
  updateRegisterForm: (data: Partial<AuthState['registerForm']>) => void;
  resetForms: () => void;

  // Password reset
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Loading states
  setLoading: (loading: boolean) => void;
  setSocialLoginLoading: (provider: keyof AuthState['socialLoginLoading'], loading: boolean) => void;

  // Initialization
  initializeAuth: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

// Combine state and actions
type AuthStore = AuthState & AuthActions;

// Create the auth store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
      refreshToken: null,
      error: null,
      socialLoginLoading: {
        wechat: false,
        qq: false,
        alipay: false,
      },
      loginForm: {
        email: '',
        password: '',
        rememberMe: false,
      },
      registerForm: {
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        firstName: '',
        lastName: '',
        userType: 'client',
        phone: '',
        agreeToTerms: false,
      },
      forgotPasswordEmail: '',
      resetPasswordToken: null,

      // Authentication actions
      login: async (credentials) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/auth/login/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(credentials),
          });

          const data: AuthResponse = await response.json();

          if (!response.ok) {
            throw new Error(data.error || '登录失败');
          }

          set({
            user: data.user,
            isAuthenticated: true,
            accessToken: data.access,
            refreshToken: data.refresh,
            isLoading: false,
            loginForm: {
              ...get().loginForm,
              email: credentials.email,
              rememberMe: credentials.rememberMe || false,
            },
          });

          // Store tokens securely
          if (credentials.rememberMe) {
            localStorage.setItem('auth_remember', 'true');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '登录失败',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const response = await fetch('/api/auth/register/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(data),
          });

          const result: AuthResponse = await response.json();

          if (!response.ok) {
            throw new Error(result.error || '注册失败');
          }

          set({
            user: result.user,
            isAuthenticated: true,
            accessToken: result.access,
            refreshToken: result.refresh,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '注册失败',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          error: null,
        });

        // Clear stored data
        localStorage.removeItem('auth_remember');
        sessionStorage.removeItem('auth_tokens');

        // Redirect to login page
        window.location.href = '/login';
      },

      // Token management
      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await fetch('/api/auth/refresh/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          set({
            accessToken: data.access,
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
        }
      },

      clearTokens: () => {
        set({
          accessToken: null,
          refreshToken: null,
        });
      },

      // Social login
      socialLogin: async (provider, data) => {
        set({
          socialLoginLoading: {
            ...get().socialLoginLoading,
            [provider]: true,
          },
          error: null,
        });

        try {
          const response = await fetch(`/api/auth/social/${provider}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(data),
          });

          const result: AuthResponse = await response.json();

          if (!response.ok) {
            throw new Error(result.error || `${provider}登录失败`);
          }

          set({
            user: result.user,
            isAuthenticated: true,
            accessToken: result.access,
            refreshToken: result.refresh,
            socialLoginLoading: {
              ...get().socialLoginLoading,
              [provider]: false,
            },
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : `${provider}登录失败`,
            socialLoginLoading: {
              ...get().socialLoginLoading,
              [provider]: false,
            },
          });
          throw error;
        }
      },

      // User management
      setUser: (user) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      // Form actions
      updateLoginForm: (data) => {
        set({
          loginForm: { ...get().loginForm, ...data },
        });
      },

      updateRegisterForm: (data) => {
        set({
          registerForm: { ...get().registerForm, ...data },
        });
      },

      resetForms: () => {
        set({
          loginForm: {
            email: '',
            password: '',
            rememberMe: false,
          },
          registerForm: {
            email: '',
            password: '',
            confirmPassword: '',
            username: '',
            firstName: '',
            lastName: '',
            userType: 'client',
            phone: '',
            agreeToTerms: false,
          },
        });
      },

      // Password reset
      requestPasswordReset: async (email) => {
        set({
          isLoading: true,
          error: null,
          forgotPasswordEmail: email,
        });

        try {
          const response = await fetch('/api/auth/password-reset/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ email }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || '发送重置邮件失败');
          }

          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '发送重置邮件失败',
            isLoading: false,
          });
          throw error;
        }
      },

      resetPassword: async (token, newPassword) => {
        set({
          isLoading: true,
          error: null,
          resetPasswordToken: token,
        });

        try {
          const response = await fetch('/api/auth/password-reset-confirm/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
              token,
              new_password: newPassword,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || '密码重置失败');
          }

          set({
            isLoading: false,
            resetPasswordToken: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '密码重置失败',
            isLoading: false,
          });
          throw error;
        }
      },

      // Error handling
      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Loading states
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setSocialLoginLoading: (provider, loading) => {
        set({
          socialLoginLoading: {
            ...get().socialLoginLoading,
            [provider]: loading,
          },
        });
      },

      // Initialization
      initializeAuth: async () => {
        const { accessToken, refreshToken } = get();

        if (accessToken && refreshToken) {
          try {
            // Verify the current token
            const response = await fetch('/api/auth/user/', {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            });

            if (response.ok) {
              const user = await response.json();
              set((state) => {
                state.user = user;
                state.isAuthenticated = true;
              });
            } else if (response.status === 401) {
              // Token expired, try to refresh
              await get().refreshAccessToken();
            }
          } catch (error) {
            console.error('Auth initialization failed:', error);
            get().clearTokens();
          }
        }
      },

      checkAuthStatus: async () => {
        const { accessToken } = get();

        if (!accessToken) {
          return false;
        }

        try {
          const response = await fetch('/api/auth/user/', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          return response.ok;
        } catch {
          return false;
        }
      },
    })),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const rememberMe = localStorage.getItem('auth_remember');
          const storage = rememberMe ? localStorage : sessionStorage;
          return storage.getItem(name);
        },
        setItem: (name, value) => {
          const rememberMe = localStorage.getItem('auth_remember');
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem(name, value);
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        },
      })),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        loginForm: state.loginForm,
        registerForm: state.registerForm,
      }),
    }
  );

// Utility function to get CSRF token
function getCSRFToken(): string {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }

  return '';
}

// Export types for external use
export type { AuthState, AuthActions, AuthStore };