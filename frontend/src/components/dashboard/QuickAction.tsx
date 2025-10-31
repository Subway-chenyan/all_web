import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

export interface QuickActionItem {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  href?: string;
  onClick?: () => void;
  badge?: number | string;
  disabled?: boolean;
  external?: boolean;
}

export interface QuickActionProps {
  actions: QuickActionItem[];
  title?: string;
  columns?: number;
  variant?: 'grid' | 'list' | 'compact';
  className?: string;
  loading?: boolean;
}

const QuickAction: React.FC<QuickActionProps> = ({
  actions,
  title = '快速操作',
  columns = 4,
  variant = 'grid',
  className = '',
  loading = false,
}) => {
  const getGridCols = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  const handleClick = (action: QuickActionItem) => {
    if (action.disabled) return;

    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      if (action.external) {
        window.open(action.href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = action.href;
      }
    }
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className={cn('grid gap-4', getGridCols())}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderAction = (action: QuickActionItem) => {
    const Icon = action.icon;

    if (variant === 'list') {
      return (
        <button
          key={action.id}
          onClick={() => handleClick(action)}
          disabled={action.disabled}
          className={cn(
            'w-full flex items-center gap-4 p-4 text-left rounded-lg border-2 transition-all duration-200',
            action.disabled
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
              : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-md cursor-pointer'
          )}
        >
          <div className={cn('p-3 rounded-lg', action.bgColor)}>
            <Icon className={cn('w-6 h-6', action.color)} />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 leading-chinese">
              {action.label}
            </div>
            {action.description && (
              <div className="text-sm text-gray-600 mt-1 leading-chinese">
                {action.description}
              </div>
            )}
          </div>
          {action.badge && (
            <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {action.badge}
            </div>
          )}
        </button>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          key={action.id}
          onClick={() => handleClick(action)}
          disabled={action.disabled}
          className={cn(
            'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200',
            action.disabled
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
              : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-md cursor-pointer'
          )}
        >
          <div className={cn('p-2 rounded-lg', action.bgColor)}>
            <Icon className={cn('w-5 h-5', action.color)} />
          </div>
          <span className="text-xs font-medium text-gray-700 text-center leading-chinese">
            {action.label}
          </span>
          {action.badge && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
              {action.badge}
            </div>
          )}
        </button>
      );
    }

    // Default grid variant
    return (
      <button
        key={action.id}
        onClick={() => handleClick(action)}
        disabled={action.disabled}
        className={cn(
          'relative flex flex-col items-center gap-3 p-6 text-center rounded-lg border-2 transition-all duration-200',
          action.disabled
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
            : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-md cursor-pointer'
        )}
      >
        <div className={cn('p-3 rounded-lg', action.bgColor)}>
          <Icon className={cn('w-8 h-8', action.color)} />
        </div>
        <div>
          <div className="font-medium text-gray-900 leading-chinese">
            {action.label}
          </div>
          {action.description && (
            <div className="text-sm text-gray-600 mt-1 leading-chinese">
              {action.description}
            </div>
          )}
        </div>
        {action.badge && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            {action.badge}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-chinese">
        {title}
      </h3>

      {actions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>暂无可用操作</p>
        </div>
      ) : (
        <div className={cn('grid gap-4', getGridCols())}>
          {actions.map(renderAction)}
        </div>
      )}
    </div>
  );
};

export default QuickAction;