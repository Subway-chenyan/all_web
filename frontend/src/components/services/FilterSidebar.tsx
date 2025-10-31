import React, { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { useServicesStore } from '@/store/servicesStore';
import { Category, Subcategory } from '@/types';
import { cn } from '@/utils';

interface FilterSidebarProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  isOpen,
  onClose,
  className = '',
}) => {
  const { t } = useI18n();
  const { filters, setFilters, clearFilters } = useServicesStore();

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(filters.category);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | undefined>(filters.subcategory);
  const [priceRange, setPriceRange] = useState({
    min: filters.priceMin || '',
    max: filters.priceMax || '',
  });
  const [selectedRating, setSelectedRating] = useState<number | undefined>(filters.rating);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<number | undefined>(filters.deliveryTime);
  const [selectedSellerLevel, setSelectedSellerLevel] = useState<string | undefined>(filters.sellerLevel);

  // Price range options
  const priceRanges = [
    { label: '¥100以下', min: 0, max: 100 },
    { label: '¥100-500', min: 100, max: 500 },
    { label: '¥500-1000', min: 500, max: 1000 },
    { label: '¥1000-5000', min: 1000, max: 5000 },
    { label: '¥5000以上', min: 5000, max: undefined },
  ];

  // Delivery time options
  const deliveryTimes = [
    { label: '24小时内', value: 1 },
    { label: '3天内', value: 3 },
    { label: '7天内', value: 7 },
    { label: '14天内', value: 14 },
    { label: '30天内', value: 30 },
  ];

  // Seller level options
  const sellerLevels = [
    { label: '新卖家', value: 'new' },
    { label: '一级卖家', value: 'level1' },
    { label: '二级卖家', value: 'level2' },
    { label: '顶级卖家', value: 'top' },
  ];

  // Rating options
  const ratingOptions = [4, 3, 2, 1];

  // Update filters when values change
  useEffect(() => {
    const newFilters: any = {};

    if (selectedCategory) newFilters.category = selectedCategory;
    if (selectedSubcategory) newFilters.subcategory = selectedSubcategory;
    if (priceRange.min) newFilters.priceMin = Number(priceRange.min);
    if (priceRange.max) newFilters.priceMax = Number(priceRange.max);
    if (selectedRating) newFilters.rating = selectedRating;
    if (selectedDeliveryTime) newFilters.deliveryTime = selectedDeliveryTime;
    if (selectedSellerLevel) newFilters.sellerLevel = selectedSellerLevel;

    setFilters(newFilters);
  }, [selectedCategory, selectedSubcategory, priceRange, selectedRating, selectedDeliveryTime, selectedSellerLevel]);

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? undefined : categoryId);
    setSelectedSubcategory(undefined); // Reset subcategory when category changes
  };

  const handleSubcategoryChange = (subcategoryId: number) => {
    setSelectedSubcategory(subcategoryId === selectedSubcategory ? undefined : subcategoryId);
  };

  const handlePriceRangeClick = (range: typeof priceRanges[0]) => {
    setPriceRange({
      min: range.min.toString(),
      max: range.max?.toString() || '',
    });
  };

  const handleClearAll = () => {
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    setPriceRange({ min: '', max: '' });
    setSelectedRating(undefined);
    setSelectedDeliveryTime(undefined);
    setSelectedSellerLevel(undefined);
    clearFilters();
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id === selectedCategory);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={cn(
              'w-4 h-4',
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'
            )}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 ml-1">& up</span>
      </div>
    );
  };

  const hasActiveFilters = selectedCategory || selectedSubcategory || priceRange.min || priceRange.max ||
                          selectedRating || selectedDeliveryTime || selectedSellerLevel;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          'lg:relative lg:transform-none lg:translate-x-0 lg:shadow-md lg:z-auto lg:w-64 lg:h-auto lg:max-h-[calc(100vh-200px)]',
          className
        )}
      >
        <div className="p-4 lg:p-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">筛选条件</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="w-full mb-4 px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              清除所有筛选
            </button>
          )}

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">服务分类</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id}>
                  <button
                    onClick={() => handleCategoryChange(category.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200',
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-xs text-gray-500">
                        ({category.serviceCount})
                      </span>
                    </div>
                  </button>

                  {/* Subcategories */}
                  {selectedCategory === category.id && category.subcategories?.length > 0 && (
                    <div className="ml-4 mt-2 space-y-1">
                      {category.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => handleSubcategoryChange(subcategory.id)}
                          className={cn(
                            'w-full text-left px-3 py-1.5 rounded text-sm transition-colors duration-200',
                            selectedSubcategory === subcategory.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{subcategory.name}</span>
                            <span className="text-xs text-gray-500">
                              ({subcategory.serviceCount})
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">价格范围</h3>

            {/* Quick Price Ranges */}
            <div className="grid grid-cols-1 gap-2 mb-3">
              {priceRanges.map((range, index) => (
                <button
                  key={index}
                  onClick={() => handlePriceRangeClick(range)}
                  className={cn(
                    'px-3 py-2 text-left text-sm rounded-lg border transition-colors duration-200',
                    priceRange.min === range.min.toString() &&
                    priceRange.max === (range.max?.toString() || '')
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Custom Price Range */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="最低价"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="最高价"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Delivery Time */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">交付时间</h3>
            <div className="space-y-2">
              {deliveryTimes.map((time) => (
                <button
                  key={time.value}
                  onClick={() => setSelectedDeliveryTime(
                    selectedDeliveryTime === time.value ? undefined : time.value
                  )}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200',
                    selectedDeliveryTime === time.value
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                  )}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">评分</h3>
            <div className="space-y-2">
              {ratingOptions.map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(
                    selectedRating === rating ? undefined : rating
                  )}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg transition-colors duration-200',
                    selectedRating === rating
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  )}
                >
                  {renderStars(rating)}
                </button>
              ))}
            </div>
          </div>

          {/* Seller Level */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">卖家等级</h3>
            <div className="space-y-2">
              {sellerLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedSellerLevel(
                    selectedSellerLevel === level.value ? undefined : level.value
                  )}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200',
                    selectedSellerLevel === level.value
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                  )}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;