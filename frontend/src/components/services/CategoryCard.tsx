import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '@/types';
import { useI18n } from '@/i18n';
import { cn } from '@/utils';

interface CategoryCardProps {
  category: Category;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  size = 'medium',
  className = '',
}) => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleClick = () => {
    navigate(`/categories/${category.slug}`);
  };

  const sizeClasses = {
    small: 'p-3 text-center',
    medium: 'p-4 text-center',
    large: 'p-6 text-center',
  };

  const iconSizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const titleSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  // Category icons mapping
  const getCategoryIcon = (slug: string) => {
    const iconMap: Record<string, string> = {
      'design-creative': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      'programming-development': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      'writing-translation': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      'digital-marketing': 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
      'video-audio': 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      'business-consulting': 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    };

    return iconMap[slug] || 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z';
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 group',
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="flex justify-center mb-3">
        <div className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300',
          iconSizes[size]
        )}>
          <svg
            className={cn(
              'text-blue-600',
              size === 'small' ? 'w-5 h-5' : size === 'medium' ? 'w-7 h-7' : 'w-10 h-10'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={getCategoryIcon(category.slug)}
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className={cn(
          'font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200',
          titleSizes[size]
        )}>
          {category.name}
        </h3>

        {category.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Service Count */}
        <div className="text-xs text-gray-500">
          {category.serviceCount} 个服务
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;