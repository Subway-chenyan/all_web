import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, Filter, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

export interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  reviewer: {
    name: string;
    avatar?: string;
    level: string;
  };
  serviceTitle: string;
  date: Date;
  helpful: number;
  verified: boolean;
  response?: {
    content: string;
    date: Date;
  };
  images?: string[];
}

export interface ReviewSummaryProps {
  reviews: Review[];
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showServiceInfo?: boolean;
  maxItems?: number;
  className?: string;
  onReviewClick?: (review: Review) => void;
  onHelpfulClick?: (reviewId: string) => void;
  loading?: boolean;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  reviews,
  title = '客户评价',
  showFilters = true,
  showSearch = true,
  showServiceInfo = true,
  maxItems = 10,
  className = '',
  onReviewClick,
  onHelpfulClick,
  loading = false,
}) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
  }));

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const filteredAndSortedReviews = reviews
    .filter(review => {
      const matchesRating = selectedRating === null || review.rating === selectedRating;
      const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRating && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating_high':
          return b.rating - a.rating;
        case 'rating_low':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        case 'recent':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const displayReviews = maxItems ? filteredAndSortedReviews.slice(0, maxItems) : filteredAndSortedReviews;

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizes[size],
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1 h-32 bg-gray-200 rounded"></div>
            <div className="lg:col-span-2 h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 leading-chinese">
          {title} ({reviews.length})
        </h2>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Overall Rating */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <div className="flex flex-col">
              {renderStars(Math.round(averageRating), 'lg')}
              <span className="text-sm text-gray-600 mt-1">
                {reviews.length} 条评价
              </span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2">
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right">
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
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
                placeholder="搜索评价..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex flex-wrap gap-3">
              {/* Rating Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">评分:</span>
                <div className="flex gap-1">
                  {[null, 5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating || 'all'}
                      onClick={() => setSelectedRating(rating)}
                      className={cn(
                        'px-3 py-1 text-sm rounded-lg transition-colors duration-200',
                        selectedRating === rating
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {rating || '全部'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">排序:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="recent">最新</option>
                  <option value="rating_high">评分最高</option>
                  <option value="rating_low">评分最低</option>
                  <option value="helpful">最有帮助</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      {displayReviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评价</h3>
          <p className="text-gray-600">
            {searchTerm || selectedRating ? '没有找到匹配的评价' : '还没有客户留下评价'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayReviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0 cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded-lg transition-colors duration-200"
              onClick={() => onReviewClick?.(review)}
            >
              <div className="flex items-start gap-4">
                {/* Reviewer Avatar */}
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {review.reviewer.avatar ? (
                    <img
                      src={review.reviewer.avatar}
                      alt={review.reviewer.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {review.reviewer.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  {/* Review Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {review.reviewer.name}
                          </span>
                          {review.verified && (
                            <div className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                              已验证购买
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.reviewer.level} • {review.date.toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>

                  {/* Review Title and Content */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 mb-1 leading-chinese">
                      {review.title}
                    </h4>
                    <p className="text-gray-700 leading-chinese">
                      {review.content}
                    </p>
                  </div>

                  {/* Service Info */}
                  {showServiceInfo && (
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">服务:</span> {review.serviceTitle}
                    </div>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                      {review.images.length > 3 && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600">
                          +{review.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Response */}
                  {review.response && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="text-sm font-medium text-blue-900 mb-1">
                        卖家回复
                      </div>
                      <p className="text-sm text-blue-800 leading-chinese">
                        {review.response.content}
                      </p>
                      <div className="text-xs text-blue-600 mt-1">
                        {review.response.date.toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onHelpfulClick?.(review.id);
                      }}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>有帮助 ({review.helpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show More */}
      {maxItems && filteredAndSortedReviews.length > maxItems && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {}}
            className="px-6 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            查看全部 {filteredAndSortedReviews.length} 条评价
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;