import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Service, Category, User, FilterOptions, PaginationParams } from '@/types';
import { servicesService } from '@/services/api/services';

// Extended interfaces for services store
interface ServicesState {
  // Services data
  services: Service[];
  featuredServices: Service[];
  categories: Category[];
  topSellers: User[];

  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;

  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;

  // Filters and search
  filters: FilterOptions;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';

  // View preferences
  viewMode: 'grid' | 'list';

  // Favorites
  favoriteServices: number[];

  // Quick view
  quickViewService: Service | null;
  showQuickView: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchServices: (params?: FilterOptions & PaginationParams & { refresh?: boolean }) => Promise<void>;
  fetchMoreServices: () => Promise<void>;
  fetchFeaturedServices: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTopSellers: () => Promise<void>;
  searchServices: (query: string, params?: FilterOptions & PaginationParams) => Promise<void>;

  // Filter actions
  setFilters: (filters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;

  // View actions
  setViewMode: (mode: 'grid' | 'list') => void;

  // Favorites actions
  toggleFavorite: (serviceId: number) => void;
  isFavorite: (serviceId: number) => boolean;

  // Quick view actions
  showServiceQuickView: (service: Service) => void;
  hideQuickView: () => void;

  // Utility actions
  resetServices: () => void;
  clearError: () => void;
}

export const useServicesStore = create<ServicesState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        services: [],
        featuredServices: [],
        categories: [],
        topSellers: [],
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 12,
        isLoading: false,
        isLoadingMore: false,
        isRefreshing: false,
        filters: {},
        searchQuery: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
        viewMode: 'grid',
        favoriteServices: [],
        quickViewService: null,
        showQuickView: false,
        error: null,

        // Fetch services with pagination and filtering
        fetchServices: async (params = {}) => {
          const { refresh = false } = params;
          const currentState = get();

          // Set loading states
          set({
            isLoading: !refresh && currentState.currentPage === 1,
            isRefreshing: refresh,
            error: null,
          });

          try {
            const page = refresh ? 1 : currentState.currentPage;
            const requestParams = {
              page,
              page_size: currentState.pageSize,
              sort_by: currentState.sortBy,
              sort_order: currentState.sortOrder,
              ...currentState.filters,
              ...params,
            };

            // Add search query if exists
            if (currentState.searchQuery) {
              requestParams.search = currentState.searchQuery;
            }

            const response = await servicesService.getServices(requestParams);

            set({
              services: refresh ? response.results : [...currentState.services, ...response.results],
              currentPage: page,
              totalPages: Math.ceil(response.count / currentState.pageSize),
              totalCount: response.count,
              isLoading: false,
              isRefreshing: false,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '获取服务失败',
              isLoading: false,
              isRefreshing: false,
            });
          }
        },

        // Load more services (infinite scroll)
        fetchMoreServices: async () => {
          const currentState = get();

          if (currentState.isLoadingMore || currentState.currentPage >= currentState.totalPages) {
            return;
          }

          set({ isLoadingMore: true });

          try {
            const nextPage = currentState.currentPage + 1;
            const requestParams = {
              page: nextPage,
              page_size: currentState.pageSize,
              sort_by: currentState.sortBy,
              sort_order: currentState.sortOrder,
              ...currentState.filters,
            };

            if (currentState.searchQuery) {
              requestParams.search = currentState.searchQuery;
            }

            const response = await servicesService.getServices(requestParams);

            set({
              services: [...currentState.services, ...response.results],
              currentPage: nextPage,
              isLoadingMore: false,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '加载更多服务失败',
              isLoadingMore: false,
            });
          }
        },

        // Fetch featured services
        fetchFeaturedServices: async () => {
          try {
            const services = await servicesService.getFeaturedServices(12);
            set({ featuredServices: services });
          } catch (error) {
            console.error('Failed to fetch featured services:', error);
          }
        },

        // Fetch categories
        fetchCategories: async () => {
          try {
            // This would need to be implemented in the API service
            // For now, using mock data
            const mockCategories: Category[] = [
              {
                id: 1,
                name: '设计与创意',
                slug: 'design-creative',
                description: 'logo设计、UI/UX设计、插画设计等',
                isActive: true,
                subcategories: [],
                serviceCount: 1250,
              },
              {
                id: 2,
                name: '编程与开发',
                slug: 'programming-development',
                description: '网站开发、移动应用、软件开发等',
                isActive: true,
                subcategories: [],
                serviceCount: 980,
              },
              {
                id: 3,
                name: '写作与翻译',
                slug: 'writing-translation',
                description: '内容写作、文档翻译、文案创作等',
                isActive: true,
                subcategories: [],
                serviceCount: 750,
              },
              {
                id: 4,
                name: '数字营销',
                slug: 'digital-marketing',
                description: '社交媒体营销、SEO优化、广告投放等',
                isActive: true,
                subcategories: [],
                serviceCount: 620,
              },
              {
                id: 5,
                name: '视频与音频',
                slug: 'video-audio',
                description: '视频剪辑、音频处理、动画制作等',
                isActive: true,
                subcategories: [],
                serviceCount: 540,
              },
              {
                id: 6,
                name: '商业咨询',
                slug: 'business-consulting',
                description: '商业策划、市场调研、财务咨询等',
                isActive: true,
                subcategories: [],
                serviceCount: 380,
              },
            ];
            set({ categories: mockCategories });
          } catch (error) {
            console.error('Failed to fetch categories:', error);
          }
        },

        // Fetch top sellers
        fetchTopSellers: async () => {
          try {
            // This would need to be implemented in the API service
            // For now, using mock data
            const mockTopSellers: User[] = [
              {
                id: 1,
                username: 'design_pro',
                email: 'design@example.com',
                firstName: '张',
                lastName: '设计师',
                avatar: '/images/avatars/avatar1.jpg',
                bio: '专业设计师，5年经验',
                userType: 'freelancer',
                isActive: true,
                isVerified: true,
                profile: {
                  id: 1,
                  user: 1,
                  displayName: '张设计师',
                  avatar: '/images/avatars/avatar1.jpg',
                  bio: '专业设计师，5年经验',
                  skills: ['UI设计', 'logo设计', '品牌设计'],
                  experience: '5年',
                  education: '设计学院本科',
                  portfolio: [],
                  socialLinks: [],
                  location: '北京',
                  website: '',
                  responseTime: 1,
                  languages: ['中文', '英文'],
                  hourlyRate: 200,
                  availability: true,
                  totalEarnings: 150000,
                  completedProjects: 120,
                  averageRating: 4.9,
                  totalReviews: 118,
                },
                createdAt: '2022-01-15T00:00:00Z',
                updatedAt: '2024-01-15T00:00:00Z',
              },
            ];
            set({ topSellers: mockTopSellers });
          } catch (error) {
            console.error('Failed to fetch top sellers:', error);
          }
        },

        // Search services
        searchServices: async (query: string, params = {}) => {
          set({
            searchQuery: query,
            isLoading: true,
            error: null,
            currentPage: 1,
          });

          try {
            const requestParams = {
              page: 1,
              page_size: get().pageSize,
              sort_by: get().sortBy,
              sort_order: get().sortOrder,
              ...get().filters,
              ...params,
            };

            const response = await servicesService.searchServices(query, requestParams);

            set({
              services: response.results,
              currentPage: 1,
              totalPages: Math.ceil(response.count / get().pageSize),
              totalCount: response.count,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '搜索服务失败',
              isLoading: false,
            });
          }
        },

        // Set filters
        setFilters: (newFilters) => {
          const currentFilters = get().filters;
          const updatedFilters = { ...currentFilters, ...newFilters };

          set({
            filters: updatedFilters,
            currentPage: 1, // Reset to first page when filters change
          });
        },

        // Clear all filters
        clearFilters: () => {
          set({
            filters: {},
            searchQuery: '',
            currentPage: 1,
          });
        },

        // Set search query
        setSearchQuery: (query) => {
          set({
            searchQuery: query,
            currentPage: 1,
          });
        },

        // Set sort options
        setSortBy: (sortBy, sortOrder = 'desc') => {
          set({
            sortBy,
            sortOrder,
            currentPage: 1,
          });
        },

        // Set view mode
        setViewMode: (mode) => {
          set({ viewMode: mode });
        },

        // Toggle favorite service
        toggleFavorite: (serviceId) => {
          const currentFavorites = get().favoriteServices;
          const isFavorite = currentFavorites.includes(serviceId);

          set({
            favoriteServices: isFavorite
              ? currentFavorites.filter(id => id !== serviceId)
              : [...currentFavorites, serviceId],
          });

          // Here you would also make an API call to sync with backend
          // For now, just updating local state
        },

        // Check if service is favorite
        isFavorite: (serviceId) => {
          return get().favoriteServices.includes(serviceId);
        },

        // Show quick view
        showServiceQuickView: (service) => {
          set({
            quickViewService: service,
            showQuickView: true,
          });
        },

        // Hide quick view
        hideQuickView: () => {
          set({
            quickViewService: null,
            showQuickView: false,
          });
        },

        // Reset services
        resetServices: () => {
          set({
            services: [],
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            error: null,
          });
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'services-store',
        partialize: (state) => ({
          favoriteServices: state.favoriteServices,
          viewMode: state.viewMode,
          filters: state.filters,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
        }),
      }
    )
  )
);