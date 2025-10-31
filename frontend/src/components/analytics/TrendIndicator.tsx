import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/utils';

export interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  showArrow?: boolean;
  showIcon?: boolean;
  showPercentage?: boolean;
  showValue?: boolean;
  format?: 'percentage' | 'number' | 'currency';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: 'default' | 'success' | 'danger';
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  previousValue,
  showArrow = true,
  showIcon = true,
  showPercentage = true,
  showValue = false,
  format = 'percentage',
  className = '',
  size = 'md',
  colorScheme = 'default',
}) => {
  const isIncrease = value > (previousValue || 0);
  const isNeutral = value === (previousValue || 0);

  const getTrendType = () => {
    if (isNeutral) return 'neutral';
    return isIncrease ? 'increase' : 'decrease';
  };

  const getTrendColor = () => {
    if (colorScheme !== 'default') {
      return colorScheme === 'success' ? 'text-green-600' : 'text-red-600';
    }
    switch (getTrendType()) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBgColor = () => {
    if (colorScheme !== 'default') {
      return colorScheme === 'success' ? 'bg-green-50' : 'bg-red-50';
    }
    switch (getTrendType()) {
      case 'increase':
        return 'bg-green-50';
      case 'decrease':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-3 py-2';
      default:
        return 'text-sm px-2 py-1.5';
    }
  };

  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val}%`;
      case 'currency':
        return `¥${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    switch (getTrendType()) {
      case 'increase':
        return showArrow ? <ArrowUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />;
      case 'decrease':
        return showArrow ? <ArrowDown className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const calculatePercentage = () => {
    if (!previousValue || previousValue === 0) return 0;
    return ((value - previousValue) / previousValue * 100);
  };

  const displayValue = showPercentage ? calculatePercentage() : value;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium',
        getBgColor(),
        getTrendColor(),
        getSizeStyles(),
        className
      )}
    >
      {getIcon()}
      <span>
        {showValue && formatValue(value)}
        {showValue && showPercentage && ' '}
        {showPercentage && formatValue(displayValue)}
      </span>
    </div>
  );
};

export default TrendIndicator;