import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthResponse } from '@/types';
import { setAuthTokens, clearAuthTokens, getAccessToken } from '@/services/api';

// Auth store interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

// Create auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || error.message || '登录失败');
          }

          const data: AuthResponse = await response.json();

          setAuthTokens(data.access, data.refresh);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || error.message || '注册失败');
          }

          const data: AuthResponse = await response.json();

          setAuthTokens(data.access, data.refresh);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        clearAuthTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      refreshToken: async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            get().logout();
            return;
          }

          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (!response.ok) {
            get().logout();
            return;
          }

          const data = await response.json();
          localStorage.setItem('access_token', data.access);
        } catch (error) {
          get().logout();
        }
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      checkAuth: async () => {
        const token = getAccessToken();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            // Token might be expired, try to refresh
            await get().refreshToken();
            const newToken = getAccessToken();
            if (!newToken) {
              get().logout();
              return;
            }

            // Retry with new token
            const retryResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me/`, {
              headers: {
                'Authorization': `Bearer ${newToken}`,
              },
            });

            if (!retryResponse.ok) {
              get().logout();
              return;
            }

            const userData = await retryResponse.json();
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            const userData = await response.json();
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// UI Store interface
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'zh' | 'en') => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Create UI store
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      theme: 'light',
      language: 'zh',
      notifications: [],

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      setLanguage: (language) => {
        set({ language });
      },

      addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification = { ...notification, id };
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto remove notification after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration || 5000);
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);

// Service Store interface
interface ServiceState {
  filters: {
    category?: number;
    subcategory?: number;
    priceMin?: number;
    priceMax?: number;
    deliveryTime?: number;
    rating?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  setFilters: (filters: Partial<ServiceState['filters']>) => void;
  clearFilters: () => void;
}

// Create service store
export const useServiceStore = create<ServiceState>()(
  persist(
    (set) => ({
      filters: {},

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      clearFilters: () => {
        set({ filters: {} });
      },
    }),
    {
      name: 'service-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// Cart Store interface
interface CartState {
  items: Array<{
    service: number;
    package?: number;
    quantity: number;
    requirements?: any[];
  }>;
  addItem: (item: Omit<CartState['items'][0], 'quantity'>) => void;
  removeItem: (serviceId: number, packageId?: number) => void;
  updateQuantity: (serviceId: number, quantity: number, packageId?: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Create cart store
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.service === item.service && i.package === item.package
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += 1;
            return { items: updatedItems };
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
          };
        });
      },

      removeItem: (serviceId, packageId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.service === serviceId && item.package === packageId)
          ),
        }));
      },

      updateQuantity: (serviceId, quantity, packageId) => {
        if (quantity <= 0) {
          get().removeItem(serviceId, packageId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.service === serviceId && item.package === packageId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        // This would need to be calculated based on service prices
        // For now, return 0 as a placeholder
        return 0;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);