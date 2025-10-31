import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'large' | 'minimal';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-600',
  bgColor = 'bg-blue-50',
  description,
  trend,
  loading = false,
  className = '',
  onClick,
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'p-4';
      case 'large':
        return 'p-6';
      case 'minimal':
        return 'p-3 border-0 shadow-none bg-transparent';
      default:
        return 'p-5';
    }
  };

  const getValueSize = () => {
    switch (variant) {
      case 'compact':
        return 'text-lg';
      case 'large':
        return 'text-3xl';
      case 'minimal':
        return 'text-xl';
      default:
        return 'text-2xl';
    }
  };

  const getTrendColor = () => {
    if (trend === 'up' || change?.type === 'increase') return 'text-green-600';
    if (trend === 'down' || change?.type === 'decrease') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trend === 'up' || change?.type === 'increase') return '↑';
    if (trend === 'down' || change?.type === 'decrease') return '↓';
    return '→';
  };

  if (loading) {
    return (
      <div className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        getVariantStyles(),
        className
      )}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200',
        getVariantStyles(),
        onClick && 'cursor-pointer hover:shadow-md hover:border-gray-300',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {Icon && variant !== 'minimal' && (
              <div className={cn('p-2 rounded-lg', bgColor)}>
                <Icon className={cn('w-5 h-5', iconColor)} />
              </div>
            )}
            <p className="text-sm font-medium text-gray-600 leading-chinese">
              {title}
            </p>
            {Icon && variant === 'minimal' && (
              <Icon className={cn('w-4 h-4', iconColor)} />
            )}
          </div>
          <p className={cn('mt-2 font-bold text-gray-900', getValueSize())}>
            {value}
          </p>

          {(change || trend) && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', getTrendColor())}>
              <span>{getTrendIcon()}</span>
              <span>
                {change?.value && Math.abs(change.value)}%
                {change?.period && ` vs ${change.period}`}
              </span>
            </div>
          )}

          {description && (
            <p className="mt-1 text-xs text-gray-500 leading-chinese">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;