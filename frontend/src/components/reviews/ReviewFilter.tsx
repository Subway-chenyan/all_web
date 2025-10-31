import React, { useState } from 'react';
import { Star, Filter, ChevronDown, Search } from 'lucide-react';
import { useI18n } from '@/i18n';

interface ReviewFilterProps {
  onFilterChange: (filters: ReviewFilters) => void;
  totalReviews: number;
  className?: string;
}

export interface ReviewFilters {
  rating?: number;
  hasResponse?: boolean;
  sortBy: 'rating' | 'date' | 'helpful';
  sortOrder: 'asc' | 'desc';
  search?: string;
}

interface RatingFilterProps {
  selectedRating?: number;
  onRatingChange: (rating?: number) => void;
  totalReviews: number;
  ratingCounts: { [key: number]: number };
}

const RatingFilter: React.FC<RatingFilterProps> = ({
  selectedRating,
  onRatingChange,
  totalReviews,
  ratingCounts
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        <Star className="w-4 h-4 text-yellow-500" />
        <span className="text-sm">
          {selectedRating ? `${selectedRating}星` : '所有评分'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <button
              onClick={() => {
                onRatingChange(undefined);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                !selectedRating ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              所有评分 ({totalReviews})
            </button>
            {ratings.map((rating) => {
              const count = ratingCounts[rating] || 0;
              return (
                <button
                  key={rating}
                  onClick={() => {
                    onRatingChange(rating);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                    selectedRating === rating ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span>{rating}星</span>
                  </div>
                  <span className="text-gray-500">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface SortDropdownProps {
  sortBy: ReviewFilters['sortBy'];
  sortOrder: ReviewFilters['sortOrder'];
  onSortChange: (sortBy: ReviewFilters['sortBy'], sortOrder: ReviewFilters['sortOrder']) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  sortBy,
  sortOrder,
  onSortChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'date' as const, label: '最新评价', defaultOrder: 'desc' as const },
    { value: 'rating' as const, label: '评分最高', defaultOrder: 'desc' as const },
    { value: 'rating' as const, label: '评分最低', defaultOrder: 'asc' as const },
    { value: 'helpful' as const, label: '最有帮助', defaultOrder: 'desc' as const },
  ];

  const currentOption = sortOptions.find(
    option => option.value === sortBy && option.defaultOrder === sortOrder
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm">{currentOption?.label || '排序方式'}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2">
            {sortOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  onSortChange(option.value, option.defaultOrder);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  sortBy === option.value && sortOrder === option.defaultOrder
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ReviewFilter: React.FC<ReviewFilterProps> = ({
  onFilterChange,
  totalReviews,
  className = ''
}) => {
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Mock rating counts - in real app, this would come from API
  const ratingCounts = {
    5: Math.floor(totalReviews * 0.6),
    4: Math.floor(totalReviews * 0.25),
    3: Math.floor(totalReviews * 0.1),
    2: Math.floor(totalReviews * 0.03),
    1: Math.floor(totalReviews * 0.02)
  };

  const handleRatingChange = (rating?: number) => {
    const newFilters = { ...filters, rating };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy: ReviewFilters['sortBy'], sortOrder: ReviewFilters['sortOrder']) => {
    const newFilters = { ...filters, sortBy, sortOrder };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const newFilters = { ...filters, search: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      sortBy: 'date' as const,
      sortOrder: 'desc' as const
    };
    setFilters(newFilters);
    setSearchTerm('');
    onFilterChange(newFilters);
  };

  const hasActiveFilters = filters.rating || filters.hasResponse || filters.search;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索评价内容..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <RatingFilter
            selectedRating={filters.rating}
            onRatingChange={handleRatingChange}
            totalReviews={totalReviews}
            ratingCounts={ratingCounts}
          />

          <SortDropdown
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      {/* Active Filters and Clear */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">筛选条件:</span>
            {filters.rating && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {filters.rating}星评价
              </span>
            )}
            {filters.hasResponse !== undefined && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {filters.hasResponse ? '有回复' : '无回复'}
              </span>
            )}
            {filters.search && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                搜索: {filters.search}
              </span>
            )}
          </div>

          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            清除筛选
          </button>
        </div>
      )}

      {/* Filter Summary */}
      <div className="text-sm text-gray-600">
        {totalReviews > 0 ? (
          <span>
            显示 {totalReviews} 条评价
            {filters.rating && ` · ${filters.rating}星`}
            {filters.hasResponse !== undefined && (
              ` · ${filters.hasResponse ? '有回复' : '无回复'}`
            )}
          </span>
        ) : (
          <span>暂无评价</span>
        )}
      </div>
    </div>
  );
};

export default ReviewFilter;