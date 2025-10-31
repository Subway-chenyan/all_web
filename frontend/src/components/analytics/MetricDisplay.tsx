import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils';

export interface MetricDisplayProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'large';
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({
  title,
  value,
  change,
  icon,
  description,
  className = '',
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'p-4';
      case 'large':
        return 'p-6';
      default:
        return 'p-5';
    }
  };

  const getValueSize = () => {
    switch (variant) {
      case 'compact':
        return 'text-xl';
      case 'large':
        return 'text-3xl';
      default:
        return 'text-2xl';
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    switch (change.type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="w-4 h-4" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        getVariantStyles(),
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {icon && <div className="text-gray-400">{icon}</div>}
            <p className="text-sm font-medium text-gray-600 leading-chinese">{title}</p>
          </div>
          <p className={cn('mt-2 font-bold text-gray-900', getValueSize())}>
            {value}
          </p>
          {change && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', getChangeColor())}>
              {getChangeIcon()}
              <span>{Math.abs(change.value)}%</span>
              {change.period && (
                <span className="text-gray-500"> vs {change.period}</span>
              )}
            </div>
          )}
          {description && (
            <p className="mt-1 text-xs text-gray-500 leading-chinese">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricDisplay;