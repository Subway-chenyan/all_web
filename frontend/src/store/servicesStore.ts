import { create } from 'zustand';
import type { Service, Category, SearchFilters, PaginatedResponse } from '../types';
import { ServicesApi } from '../services/api';

interface ServicesState {
  services: Service[];
  categories: Category[];
  featuredServices: Service[];
  currentService: Service | null;
  searchResults: PaginatedResponse<Service> | null;
  filters: SearchFilters;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
}

interface ServicesActions {
  fetchServices: (params?: SearchFilters) => Promise<void>;
  fetchMoreServices: () => Promise<void>;
  fetchService: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchFeaturedServices: () => Promise<void>;
  searchServices: (query: string, filters?: SearchFilters) => Promise<void>;
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
  likeService: (id: string) => Promise<void>;
  unlikeService: (id: string) => Promise<void>;
  clearError: () => void;
  clearServices: () => void;
}

export const useServicesStore = create<ServicesState & ServicesActions>((set, get) => ({
  // Initial state
  services: [],
  categories: [],
  featuredServices: [],
  currentService: null,
  searchResults: null,
  filters: {
    sortBy: 'relevance',
    page: 1,
    pageSize: 20,
  },
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasMore: true,

  // Actions
  fetchServices: async (params) => {
    set({ isLoading: true, error: null });

    try {
      const filters = { ...get().filters, ...params };
      const response = await ServicesApi.getServices({
        page: filters.page,
        page_size: filters.pageSize,
        category: filters.category,
        subcategory: filters.subcategory,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        search: filters.query,
        sort_by: filters.sortBy,
      });

      if (response.success && response.data) {
        const servicesData = response.data as PaginatedResponse<Service>;

        set({
          services: servicesData.results,
          searchResults: servicesData,
          filters,
          isLoading: false,
          hasMore: !!servicesData.next,
        });
      } else {
        set({
          error: response.message || '获取服务列表失败',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: '获取服务列表失败，请稍后重试',
        isLoading: false,
      });
    }
  },

  fetchMoreServices: async () => {
    const { filters, services, hasMore, isLoadingMore } = get();

    if (!hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });

    try {
      const newFilters = { ...filters, page: (filters.page || 1) + 1 };
      const response = await ServicesApi.getServices({
        page: newFilters.page,
        page_size: newFilters.pageSize,
        category: newFilters.category,
        subcategory: newFilters.subcategory,
        min_price: newFilters.minPrice,
        max_price: newFilters.maxPrice,
        search: newFilters.query,
        sort_by: newFilters.sortBy,
      });

      if (response.success && response.data) {
        const servicesData = response.data as PaginatedResponse<Service>;

        set({
          services: [...services, ...servicesData.results],
          searchResults: servicesData,
          filters: newFilters,
          isLoadingMore: false,
          hasMore: !!servicesData.next,
        });
      } else {
        set({
          error: response.message || '加载更多服务失败',
          isLoadingMore: false,
        });
      }
    } catch (error) {
      set({
        error: '加载更多服务失败，请稍后重试',
        isLoadingMore: false,
      });
    }
  },

  fetchService: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await ServicesApi.getService(id);

      if (response.success && response.data) {
        set({
          currentService: response.data as Service,
          isLoading: false,
        });
      } else {
        set({
          error: response.message || '获取服务详情失败',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: '获取服务详情失败，请稍后重试',
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await ServicesApi.getCategories();

      if (response.success && response.data) {
        set({
          categories: response.data as Category[],
        });
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  fetchFeaturedServices: async () => {
    try {
      const response = await ServicesApi.getServices({
        page: 1,
        page_size: 8,
        sort_by: 'best_selling',
      });

      if (response.success && response.data) {
        const servicesData = response.data as PaginatedResponse<Service>;
        set({
          featuredServices: servicesData.results,
        });
      }
    } catch (error) {
      console.error('Failed to fetch featured services:', error);
    }
  },

  searchServices: async (query: string, filters) => {
    set({ isLoading: true, error: null });

    try {
      const searchFilters = {
        ...get().filters,
        ...filters,
        query,
        page: 1,
      };

      const response = await ServicesApi.getServices({
        page: searchFilters.page,
        page_size: searchFilters.pageSize,
        category: searchFilters.category,
        subcategory: searchFilters.subcategory,
        min_price: searchFilters.minPrice,
        max_price: searchFilters.maxPrice,
        search: searchFilters.query,
        sort_by: searchFilters.sortBy,
      });

      if (response.success && response.data) {
        const servicesData = response.data as PaginatedResponse<Service>;

        set({
          services: servicesData.results,
          searchResults: servicesData,
          filters: searchFilters,
          isLoading: false,
          hasMore: !!servicesData.next,
        });
      } else {
        set({
          error: response.message || '搜索服务失败',
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: '搜索服务失败，请稍后重试',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({
      filters: {
        sortBy: 'relevance',
        page: 1,
        pageSize: 20,
      },
    });
  },

  likeService: async (id: string) => {
    const { services, currentService } = get();

    try {
      const response = await ServicesApi.likeService(id);

      if (response.success) {
        // Update local state
        const updateServiceLikes = (service: Service) => {
          if (service.id === id) {
            return {
              ...service,
              likes: service.likes + 1,
            };
          }
          return service;
        };

        set({
          services: services.map(updateServiceLikes),
          currentService: currentService ? updateServiceLikes(currentService) : null,
        });
      }
    } catch (error) {
      console.error('Failed to like service:', error);
    }
  },

  unlikeService: async (id: string) => {
    const { services, currentService } = get();

    try {
      const response = await ServicesApi.unlikeService(id);

      if (response.success) {
        // Update local state
        const updateServiceLikes = (service: Service) => {
          if (service.id === id) {
            return {
              ...service,
              likes: Math.max(0, service.likes - 1),
            };
          }
          return service;
        };

        set({
          services: services.map(updateServiceLikes),
          currentService: currentService ? updateServiceLikes(currentService) : null,
        });
      }
    } catch (error) {
      console.error('Failed to unlike service:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearServices: () => {
    set({
      services: [],
      currentService: null,
      searchResults: null,
      hasMore: true,
    });
  },
}));

// Selectors for easy access to specific parts of the state
export const useServices = () => useServicesStore((state) => state.services);
export const useCurrentService = () => useServicesStore((state) => state.currentService);
export const useCategories = () => useServicesStore((state) => state.categories);
export const useFeaturedServices = () => useServicesStore((state) => state.featuredServices);
export const useSearchResults = () => useServicesStore((state) => state.searchResults);
export const useServicesFilters = () => useServicesStore((state) => state.filters);
export const useServicesLoading = () => useServicesStore((state) => state.isLoading);
export const useServicesError = () => useServicesStore((state) => state.error);
export const useHasMoreServices = () => useServicesStore((state) => state.hasMore);