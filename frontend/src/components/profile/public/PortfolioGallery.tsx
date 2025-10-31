import React, { useState } from 'react';
import { Eye, Heart, ExternalLink, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils';

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  tags: string[];
  projectUrl?: string;
  client?: string;
  completionDate: Date;
  featured?: boolean;
  likes?: number;
  views?: number;
}

export interface PortfolioGalleryProps {
  portfolios: PortfolioItem[];
  title?: string;
  showFilters?: boolean;
  showCategories?: boolean;
  showStats?: boolean;
  maxItems?: number;
  columns?: number;
  className?: string;
  onPortfolioClick?: (portfolio: PortfolioItem) => void;
  onLikeClick?: (portfolioId: string) => void;
  loading?: boolean;
}

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  portfolios,
  title = '作品集',
  showFilters = true,
  showCategories = true,
  showStats = true,
  maxItems,
  columns = 3,
  className = '',
  onPortfolioClick,
  onLikeClick,
  loading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = Array.from(new Set(portfolios.map(p => p.category)));
  const filteredPortfolios = selectedCategory === 'all'
    ? portfolios
    : portfolios.filter(p => p.category === selectedCategory);

  const displayPortfolios = maxItems ? filteredPortfolios.slice(0, maxItems) : filteredPortfolios;

  const getGridCols = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const openLightbox = (portfolio: PortfolioItem) => {
    setSelectedPortfolio(portfolio);
    setCurrentImageIndex(0);
  };

  const closeLightbox = () => {
    setSelectedPortfolio(null);
    setCurrentImageIndex(0);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedPortfolio) return;

    const filteredList = filteredPortfolios;
    const currentIndex = filteredList.findIndex(p => p.id === selectedPortfolio.id);

    if (direction === 'prev') {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredList.length - 1;
      setSelectedPortfolio(filteredList[prevIndex]);
    } else {
      const nextIndex = currentIndex < filteredList.length - 1 ? currentIndex + 1 : 0;
      setSelectedPortfolio(filteredList[nextIndex]);
    }
  };

  const PortfolioCard = ({ portfolio }: { portfolio: PortfolioItem }) => (
    <div
      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-gray-300"
      onClick={() => openLightbox(portfolio)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={portfolio.imageUrl}
          alt={portfolio.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg mb-1 leading-chinese">
              {portfolio.title}
            </h3>
            <p className="text-white/90 text-sm line-clamp-2 leading-chinese">
              {portfolio.description}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openLightbox(portfolio);
            }}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-200"
          >
            <Maximize2 className="w-4 h-4 text-gray-700" />
          </button>
          {portfolio.projectUrl && (
            <a
              href={portfolio.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-200"
            >
              <ExternalLink className="w-4 h-4 text-gray-700" />
            </a>
          )}
        </div>

        {/* Featured Badge */}
        {portfolio.featured && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            精选
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Category */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 leading-chinese line-clamp-1">
              {portfolio.title}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {portfolio.category}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 leading-chinese">
            {portfolio.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {portfolio.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
          {portfolio.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{portfolio.tags.length - 3}
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {portfolio.client && (
              <span>客户: {portfolio.client}</span>
            )}
            <span>
              {portfolio.completionDate.toLocaleDateString('zh-CN')}
            </span>
          </div>
          {showStats && (
            <div className="flex items-center gap-3">
              {portfolio.views && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{portfolio.views}</span>
                </div>
              )}
              {portfolio.likes !== undefined && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikeClick?.(portfolio.id);
                  }}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  <Heart className={cn(
                    'w-3 h-3',
                    portfolio.likes > 0 ? 'text-red-500 fill-current' : ''
                  )} />
                  <span>{portfolio.likes}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className={cn('grid gap-6', getGridCols())}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 rounded-lg aspect-[4/3]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 leading-chinese">
            {title} ({portfolios.length})
          </h2>
        </div>

        {/* Category Filters */}
        {showCategories && categories.length > 0 && (
          <div className="mb-6">
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
          </div>
        )}

        {/* Portfolio Grid */}
        {displayPortfolios.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无作品</h3>
            <p className="text-gray-600">
              {selectedCategory !== 'all' ? '该分类下暂无作品' : '还没有发布任何作品'}
            </p>
          </div>
        ) : (
          <div className={cn('grid gap-6', getGridCols())}>
            {displayPortfolios.map((portfolio) => (
              <PortfolioCard key={portfolio.id} portfolio={portfolio} />
            ))}
          </div>
        )}

        {/* Show More */}
        {maxItems && filteredPortfolios.length > maxItems && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {}}
              className="px-6 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              查看全部 {filteredPortfolios.length} 个作品
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedPortfolio && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 text-white/80 hover:text-white transition-colors z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={() => navigateImage('next')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-white/80 hover:text-white transition-colors z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={selectedPortfolio.imageUrl}
                alt={selectedPortfolio.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-chinese">
                      {selectedPortfolio.title}
                    </h3>
                    <p className="text-gray-600 leading-chinese">
                      {selectedPortfolio.description}
                    </p>
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {selectedPortfolio.category}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPortfolio.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                  <div className="flex items-center gap-4">
                    {selectedPortfolio.client && (
                      <span>客户: {selectedPortfolio.client}</span>
                    )}
                    <span>
                      完成时间: {selectedPortfolio.completionDate.toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  {selectedPortfolio.projectUrl && (
                    <a
                      href={selectedPortfolio.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      访问项目
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioGallery;