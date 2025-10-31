import React, { useState } from 'react';
import { cn } from '@/utils';
import { ServiceCategory, ServiceSubcategory } from '@/types/services';

export interface CategorySelectorProps {
  categories: ServiceCategory[];
  selectedCategory?: string;
  selectedSubcategory?: string;
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
  className?: string;
  disabled?: boolean;
  showIcons?: boolean;
  placeholder?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  className = '',
  disabled = false,
  showIcons = true,
  placeholder = '选择分类'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find(
    sub => sub.id === selectedSubcategory
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcategories.some(sub =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    // Reset subcategory when category changes
    onSubcategoryChange('');
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    onSubcategoryChange(subcategoryId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getDisplayText = () => {
    if (selectedCategoryData && selectedSubcategoryData) {
      return `${selectedCategoryData.name} > ${selectedSubcategoryData.name}`;
    }
    if (selectedCategoryData) {
      return selectedCategoryData.name;
    }
    return placeholder;
  };

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'flex items-center justify-between',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
        disabled={disabled}
      >
        <span className={cn(
          'truncate',
          selectedCategory ? 'text-gray-900' : 'text-gray-500'
        )}>
          {getDisplayText()}
        </span>
        <svg
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform',
            isOpen && 'transform rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="搜索分类..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Categories List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredCategories.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  没有找到匹配的分类
                </div>
              ) : (
                <div className="py-1">
                  {filteredCategories.map((category) => (
                    <div key={category.id} className="border-b border-gray-100 last:border-b-0">
                      {/* Category Header */}
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(category.id)}
                        className={cn(
                          'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                          'flex items-center justify-between',
                          selectedCategory === category.id && 'bg-blue-50 text-blue-600'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          {showIcons && category.icon && (
                            <span className="text-xl">{category.icon}</span>
                          )}
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>

                      {/* Subcategories (visible when category is selected) */}
                      {selectedCategory === category.id && category.subcategories.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-200">
                          {category.subcategories.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              type="button"
                              onClick={() => handleSubcategorySelect(subcategory.id)}
                              className={cn(
                                'w-full px-8 py-2 text-left hover:bg-gray-100 transition-colors text-sm',
                                selectedSubcategory === subcategory.id && 'bg-blue-100 text-blue-700'
                              )}
                            >
                              {subcategory.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {selectedCategory && !selectedSubcategory && selectedCategoryData?.subcategories.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  请选择一个子分类
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CategorySelector;