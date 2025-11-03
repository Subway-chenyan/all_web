import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useServices, useServicesFilters, useServicesLoading, useServicesError, useHasMoreServices, useCategories, useServicesStore } from '../../store';
import ServiceCard from '../../components/services/ServiceCard';
import { PageLoading, LoadingSpinner } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import MainLayout from '../../components/layout/MainLayout';
import { Filter, Grid, List, Search, SlidersHorizontal } from 'lucide-react';

const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const services = useServices();
  const filters = useServicesFilters();
  const isLoading = useServicesLoading();
  const error = useServicesError();
  const hasMore = useHasMoreServices();
  const categories = useCategories();

  const { fetchServices, fetchMoreServices, setFilters, clearFilters } = useServicesStore.getState();

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const newFilters = {
      ...filters,
      query: params.search,
      category: params.category,
      subcategory: params.subcategory,
      minPrice: params.min_price ? Number(params.min_price) : undefined,
      maxPrice: params.max_price ? Number(params.max_price) : undefined,
      sortBy: (params.sort_by as typeof filters.sortBy) || 'relevance',
      page: 1,
    };

    setFilters(newFilters);
    fetchServices(newFilters);
  }, [searchParams]);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    // Map camelCase filter keys to snake_case URL params
    const newSearchParams = new URLSearchParams();
    const toSnakeParams: Record<string, string> = {
      query: 'search',
      category: 'category',
      subcategory: 'subcategory',
      minPrice: 'min_price',
      maxPrice: 'max_price',
      sortBy: 'sort_by',
      page: 'page',
      pageSize: 'page_size',
    };
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        const snakeKey = toSnakeParams[k] || k;
        newSearchParams.set(snakeKey, String(v));
      }
    });

    setSearchParams(newSearchParams);
    fetchServices(newFilters);
  };

  const handleLoadMore = () => {
    fetchMoreServices();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchInput = e.currentTarget.querySelector('input[type="search"]') as HTMLInputElement;
    if (searchInput) {
      handleFilterChange('query', searchInput.value);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {filters.query ? `搜索结果: "${filters.query}"` : '浏览所有服务'}
          </h1>
          <p className="text-gray-600">
            {isLoading ? '搜索中...' : `找到 ${services.length} 个服务`}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="search"
                  placeholder="搜索服务..."
                  defaultValue={filters.query || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <Button type="submit">搜索</Button>
            </div>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">所有分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="最低价"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="最高价"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Sort */}
            <select
              value={filters.sortBy || 'relevance'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="relevance">相关性</option>
              <option value="newest">最新</option>
              <option value="best_selling">最畅销</option>
              <option value="rating">评分最高</option>
              <option value="price_low">价格从低到高</option>
              <option value="price_high">价格从高到低</option>
            </select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                clearFilters();
                setSearchParams({});
                fetchServices();
              }}
            >
              清除筛选
            </Button>

            {/* View Mode */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading && !services.length ? (
          <PageLoading text="搜索服务中..." />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchServices()}>重试</Button>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              未找到相关服务
            </h3>
            <p className="text-gray-600 mb-6">
              尝试调整搜索条件或浏览其他分类
            </p>
            <Button onClick={() => {
              clearFilters();
              setSearchParams({});
              fetchServices();
            }}>
              清除所有筛选条件
            </Button>
          </div>
        ) : (
          <>
            {/* Services Grid/List */}
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-6'
            }>
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  className={viewMode === 'list' ? 'flex' : ''}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-12">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {isLoading ? '加载中...' : '加载更多'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ServicesPage;