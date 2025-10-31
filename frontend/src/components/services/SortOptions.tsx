import React from 'react';
import { useI18n } from '@/i18n';
import { useServicesStore } from '@/store/servicesStore';
import { cn } from '@/utils';

interface SortOptionsProps {
  className?: string;
  showViewToggle?: boolean;
}

export const SortOptions: React.FC<SortOptionsProps> = ({
  className = '',
  showViewToggle = true,
}) => {
  const { t } = useI18n();
  const { sortBy, sortOrder, setSortBy, viewMode, setViewMode } = useServicesStore();

  const sortOptions = [
    { value: 'created_at', label: '最新发布', order: 'desc' as const },
    { value: 'created_at', label: '最早发布', order: 'asc' as const },
    { value: 'price', label: '价格从低到高', order: 'asc' as const },
    { value: 'price', label: '价格从高到低', order: 'desc' as const },
    { value: 'average_rating', label: '好评优先', order: 'desc' as const },
    { value: 'order_count', label: '销量优先', order: 'desc' as const },
    { value: 'delivery_time', label: '交付时间', order: 'asc' as const },
  ];

  const handleSortChange = (value: string, order: 'asc' | 'desc') => {
    setSortBy(value, order);
  };

  const getCurrentSortLabel = () => {
    const current = sortOptions.find(option =>
      option.value === sortBy && option.order === sortOrder
    );
    return current?.label || '最新发布';
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Sort Dropdown */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">排序:</span>
        <div className="relative">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [value, order] = e.target.value.split('-');
              handleSortChange(value, order as 'asc' | 'desc');
            }}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option
                key={`${option.value}-${option.order}`}
                value={`${option.value}-${option.order}`}
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* Dropdown Arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      {showViewToggle && (
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded transition-colors duration-200',
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
            title="网格视图"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded transition-colors duration-200',
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
            title="列表视图"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default SortOptions;