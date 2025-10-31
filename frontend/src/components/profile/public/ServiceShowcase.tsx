import React, { useState } from 'react';
import { Star, Heart, Eye, MessageCircle, Package, Clock, Filter, Search, Grid, List } from 'lucide-react';
import { cn } from '@/utils';
import Button from '@/components/ui/Button';

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  rating: number;
  reviews: number;
  orders: number;
  deliveryTime: string;
  features: string[];
  tags: string[];
  isFeatured?: boolean;
  isFavorite?: boolean;
  seller: {
    name: string;
    avatar: string;
    level: string;
  };
}

export interface ServiceShowcaseProps {
  services: Service[];
  title?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showFavorites?: boolean;
  viewMode?: 'grid' | 'list';
  maxItems?: number;
  className?: string;
  onServiceClick?: (service: Service) => void;
  onFavoriteClick?: (serviceId: string) => void;
  onContactClick?: (sellerId: string) => void;
  loading?: boolean;
}

const ServiceShowcase: React.FC<ServiceShowcaseProps> = ({
  services,
  title = '提供服务',
  showSearch = true,
  showFilters = true,
  showFavorites = true,
  viewMode = 'grid',
  maxItems,
  className = '',
  onServiceClick,
  onFavoriteClick,
  onContactClick,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list'>(viewMode);

  const categories = Array.from(new Set(services.map(service => service.category)));

  const filteredAndSortedServices = services
    .filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        case 'orders':
          return b.orders - a.orders;
        default:
          return 0;
      }
    });

  const displayServices = maxItems ? filteredAndSortedServices.slice(0, maxItems) : filteredAndSortedServices;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-3 h-3 text-yellow-400 fill-current" />
        ))}
        {hasHalfStar && (
          <Star className="w-3 h-3 text-yellow-400 fill-current opacity-50" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
        ))}
      </div>
    );
  };

  const ServiceCard = ({ service }: { service: Service }) => (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300 group',
        currentViewMode === 'list' ? 'flex' : 'flex flex-col'
      )}
      onClick={() => onServiceClick?.(service)}
    >
      {/* Service Image */}
      <div className={cn(
        'relative overflow-hidden bg-gray-100',
        currentViewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : 'h-48'
      )}>
        <img
          src={service.imageUrl}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {service.isFeatured && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            精选
          </div>
        )}
        {showFavorites && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteClick?.(service.id);
            }}
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-200"
          >
            <Heart className={cn(
              'w-4 h-4',
              service.isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'
            )} />
          </button>
        )}
      </div>

      {/* Service Content */}
      <div className={cn(
        'flex-1 p-4',
        currentViewMode === 'list' && 'flex flex-col justify-between'
      )}>
        <div>
          {/* Category and Title */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {service.category}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-chinese group-hover:text-red-600 transition-colors">
            {service.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-chinese">
            {service.description}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-1 mb-3">
            {service.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
            {service.features.length > 3 && (
              <span className="text-xs text-gray-500">
                +{service.features.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-3">
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderStars(service.rating)}
              <span className="text-sm text-gray-600">
                {service.rating.toFixed(1)} ({service.reviews})
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Package className="w-3 h-3" />
              <span>{service.orders}</span>
            </div>
          </div>

          {/* Delivery Time */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{service.deliveryTime}</span>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-red-500">
                  ¥{service.price}
                </span>
                {service.originalPrice && service.originalPrice > service.price && (
                  <span className="text-sm text-gray-400 line-through">
                    ¥{service.originalPrice}
                  </span>
                )}
              </div>
            </div>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onContactClick?.(service.seller.name);
              }}
            >
              联系
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className={cn(
            'grid gap-6',
            currentViewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 leading-chinese">
          {title} ({services.length})
        </h2>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setCurrentViewMode('grid')}
              className={cn(
                'p-2 rounded transition-colors duration-200',
                currentViewMode === 'grid' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentViewMode('list')}
              className={cn(
                'p-2 rounded transition-colors duration-200',
                currentViewMode === 'list' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="rating">评分最高</option>
            <option value="reviews">评价最多</option>
            <option value="orders">订单最多</option>
            <option value="price_low">价格最低</option>
            <option value="price_high">价格最高</option>
          </select>
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="mb-6 space-y-4">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索服务..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'px-4 py-2 text-sm rounded-lg transition-colors duration-200',
                  selectedCategory === 'all'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                全部
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'px-4 py-2 text-sm rounded-lg transition-colors duration-200',
                    selectedCategory === category
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Services Grid/List */}
      {displayServices.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无服务</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all' ? '没有找到匹配的服务' : '该卖家还没有发布任何服务'}
          </p>
        </div>
      ) : (
        <div className={cn(
          'grid gap-6',
          currentViewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        )}>
          {displayServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* Show More */}
      {maxItems && filteredAndSortedServices.length > maxItems && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => {}}>
            查看全部 {filteredAndSortedServices.length} 个服务
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceShowcase;