import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Service, Category } from '@/types';
import { useI18n } from '@/i18n';
import { useServicesStore } from '@/store/servicesStore';
import {
  SearchBar,
  ServiceCard,
  FilterSidebar,
  SortOptions,
  QuickViewModal,
  CategoryCard,
} from '@/components/services';
import { cn } from '@/utils';

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, formatCurrency } = useI18n();

  const {
    services,
    featuredServices,
    categories,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    currentPage,
    totalPages,
    totalCount,
    viewMode,
    filters,
    searchQuery,
    showQuickView,
    quickViewService,
    fetchServices,
    fetchMoreServices,
    fetchFeaturedServices,
    fetchCategories,
    searchServices,
    setFilters,
    clearFilters,
    setSearchQuery,
    setViewMode,
    showServiceQuickView,
    hideQuickView,
    clearError,
    resetServices,
  } = useServicesStore();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initialize data and handle URL parameters
  useEffect(() => {
    const initializePage = async () => {
      try {
        // Load initial data
        await Promise.all([
          fetchCategories(),
          fetchFeaturedServices(),
        ]);

        // Parse URL parameters
        const categoryParam = searchParams.get('category');
        const searchParam = searchParams.get('search');
        const minPriceParam = searchParams.get('minPrice');
        const maxPriceParam = searchParams.get('maxPrice');
        const ratingParam = searchParams.get('rating');

        // Set filters from URL
        const urlFilters: any = {};
        if (categoryParam) urlFilters.category = parseInt(categoryParam);
        if (minPriceParam) urlFilters.priceMin = parseInt(minPriceParam);
        if (maxPriceParam) urlFilters.priceMax = parseInt(maxPriceParam);
        if (ratingParam) urlFilters.rating = parseInt(ratingParam);

        if (Object.keys(urlFilters).length > 0) {
          setFilters(urlFilters);
        }

        // Load services
        if (searchParam) {
          await searchServices(searchParam, { ...urlFilters });
        } else {
          await fetchServices({ ...urlFilters });
        }
      } catch (error) {
        console.error('Failed to initialize services page:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    initializePage();
  }, []);

  // Load more services on scroll
  const handleScroll = useCallback(() => {
    if (isLoadingMore || isRefreshing) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 1000) {
      if (currentPage < totalPages) {
        fetchMoreServices();
      }
    }
  }, [isLoadingMore, isRefreshing, currentPage, totalPages, fetchMoreServices]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    resetServices();

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);

    if (query) {
      await searchServices(query);
    } else {
      await fetchServices();
    }
  };

  const handleCategoryClick = async (category: Category) => {
    const newFilters = { category: category.id };
    setFilters(newFilters);
    resetServices();

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', category.id.toString());
    setSearchParams(newParams);

    await fetchServices(newFilters);
  };

  const handleFilterChange = async (newFilters: any) => {
    setFilters(newFilters);
    resetServices();

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);

    if (searchQuery) {
      await searchServices(searchQuery, newFilters);
    } else {
      await fetchServices(newFilters);
    }
  };

  const handleClearFilters = async () => {
    clearFilters();
    resetServices();

    // Clear URL parameters except search
    const newParams = new URLSearchParams(searchParams);
    ['category', 'subcategory', 'minPrice', 'maxPrice', 'rating', 'deliveryTime', 'sellerLevel'].forEach(param => {
      newParams.delete(param);
    });
    setSearchParams(newParams);

    if (searchQuery) {
      await searchServices(searchQuery);
    } else {
      await fetchServices();
    }
  };

  const handleRefresh = async () => {
    resetServices();
    if (searchQuery) {
      await searchServices(searchQuery, filters, { refresh: true });
    } else {
      await fetchServices({ ...filters, refresh: true });
    }
  };

  const handleQuickView = (service: Service) => {
    showServiceQuickView(service);
  };

  const handleRetry = () => {
    clearError();
    handleRefresh();
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className={cn(
      'grid gap-6',
      viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
    )}>
      {[...Array(8)].map((_, index) => (
        <div key={index} className={cn(
          'bg-white rounded-lg shadow-sm overflow-hidden animate-pulse',
          viewMode === 'list' ? 'flex' : ''
        )}>
          {viewMode === 'grid' ? (
            <>
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </>
          ) : (
            <>
              <div className="w-48 h-full min-h-[192px] bg-gray-200"></div>
              <div className="flex-1 p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );

  // Empty state
  const renderEmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        未找到相关服务
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {searchQuery || Object.keys(filters).length > 0
          ? '请尝试调整搜索关键词或筛选条件'
          : '暂时没有可用的服务，请稍后再试'}
      </p>
      <div className="space-x-4">
        {(searchQuery || Object.keys(filters).length > 0) && (
          <button
            onClick={handleClearFilters}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            清除筛选条件
          </button>
        )}
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          返回首页
        </button>
      </div>
    </div>
  );

  // Error state
  const renderErrorState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-red-50 rounded-full mx-auto mb-6 flex items-center justify-center">
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        加载失败
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {error || '获取服务列表时出现错误，请稍后重试'}
      </p>
      <button
        onClick={handleRetry}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        重新加载
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <SearchBar
                placeholder="搜索服务..."
                onSearch={handleSearch}
                showSuggestions={true}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>筛选</span>
                {Object.keys(filters).length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>

              {/* Sort Options */}
              <SortOptions showViewToggle={true} />

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50"
                title="刷新"
              >
                <svg className={cn('w-5 h-5', isRefreshing && 'animate-spin')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">当前筛选:</span>
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                const label = {
                  category: categories.find(c => c.id === value)?.name || `分类 ${value}`,
                  subcategory: `子分类 ${value}`,
                  priceMin: `¥${value}起`,
                  priceMax: `¥${value}以下`,
                  rating: `${value}星以上`,
                  deliveryTime: `${value}天内`,
                  sellerLevel: `${value}`,
                }[key] || `${key}: ${value}`;

                return (
                  <span
                    key={key}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center space-x-1"
                  >
                    <span>{label}</span>
                    <button
                      onClick={() => {
                        const newFilters = { ...filters };
                        delete newFilters[key as keyof typeof filters];
                        handleFilterChange(newFilters);
                      }}
                      className="hover:text-blue-900"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                );
              })}
              <button
                onClick={handleClearFilters}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
              >
                清除全部
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              categories={categories}
              isOpen={true}
              onClose={() => {}}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="mb-6">
              {searchQuery && (
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  搜索结果: "{searchQuery}"
                </h1>
              )}
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {totalCount > 0 ? (
                    <>
                      找到 <span className="font-semibold text-gray-900">{totalCount}</span> 个服务
                      {currentPage > 1 && (
                        <span className="ml-2">
                          (第 {currentPage} 页，共 {totalPages} 页)
                        </span>
                      )}
                    </>
                  ) : (
                    '暂无服务'
                  )}
                </p>
              </div>
            </div>

            {/* Featured Categories */}
            {!searchQuery && Object.keys(filters).length === 0 && categories.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">热门分类</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.slice(0, 8).map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      size="small"
                      onClick={() => handleCategoryClick(category)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Featured Services */}
            {!searchQuery && Object.keys(filters).length === 0 && featuredServices.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">推荐服务</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      viewMode="grid"
                      onQuickView={handleQuickView}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isInitialLoad && isLoading && renderLoadingSkeleton()}

            {/* Error State */}
            {error && !isLoading && renderErrorState()}

            {/* Services Grid/List */}
            {!isInitialLoad && !error && (
              <>
                {services.length > 0 ? (
                  <>
                    <div className={cn(
                      'grid gap-6',
                      viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
                    )}>
                      {services.map((service) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          viewMode={viewMode}
                          onQuickView={handleQuickView}
                        />
                      ))}
                    </div>

                    {/* Load More Indicator */}
                    {isLoadingMore && (
                      <div className="mt-8 text-center">
                        <div className="inline-flex items-center space-x-2 text-gray-600">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span>加载更多...</span>
                        </div>
                      </div>
                    )}

                    {/* End of Results */}
                    {currentPage >= totalPages && services.length > 0 && (
                      <div className="mt-12 text-center text-gray-500">
                        <p>已显示全部服务</p>
                      </div>
                    )}
                  </>
                ) : !isLoading && (
                  renderEmptyState()
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      {isFilterOpen && (
        <FilterSidebar
          categories={categories}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        service={quickViewService}
        isOpen={showQuickView}
        onClose={hideQuickView}
      />
    </div>
  );
};
