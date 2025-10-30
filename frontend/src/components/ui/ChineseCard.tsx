import React from 'react';
import { Card as AntdCard, CardProps as AntdCardProps } from 'antd';
import { cn } from '../../utils/cn';

// Chinese Card Component Interface
export interface ChineseCardProps extends Omit<AntdCardProps, 'size' | 'variant'> {
  /**
   * Card variant for Chinese design system
   * @default 'default'
   */
  variant?: 'default' | 'bordered' | 'shadow' | 'elevated' | 'flat';

  /**
   * Card size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Show hover effect
   * @default false
   */
  hoverable?: boolean;

  /**
   * Custom CSS classes using Tailwind
   */
  className?: string;

  /**
   * Card header content
   */
  header?: React.ReactNode;

  /**
   * Card footer content
   */
  footer?: React.ReactNode;

  /**
   * Show loading skeleton
   * @default false
   */
  loading?: boolean;

  /**
   * Chinese loading text
   * @default '加载中...'
   */
  loadingText?: string;

  /**
   * Children content
   */
  children?: React.ReactNode;
}

// Chinese Card Component
export const ChineseCard: React.FC<ChineseCardProps> = ({
  variant = 'default',
  size = 'md',
  hoverable = false,
  className,
  header,
  footer,
  loading = false,
  loadingText = '加载中...',
  children,
  title,
  extra,
  ...antdProps
}) => {
  // Variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-chinese',
    bordered: 'bg-white border-2 border-gray-300',
    shadow: 'bg-white border border-gray-200 shadow-chinese-lg',
    elevated: 'bg-white border-0 shadow-xl',
    flat: 'bg-gray-50 border-0 shadow-none',
  };

  // Size classes
  const sizeClasses = {
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  // Hover classes
  const hoverClasses = hoverable
    ? 'transition-all duration-200 hover:shadow-chinese-lg hover:scale-[1.02] hover:border-red-200'
    : '';

  // Combine classes
  const cardClasses = cn(
    // Base classes
    'rounded-lg overflow-hidden',
    'text-chinese',

    // Variant classes
    variantClasses[variant],

    // Size classes
    sizeClasses[size],

    // Hover classes
    hoverClasses,

    // Custom classes
    className
  );

  // Custom header
  const cardHeader = header || title ? (
    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
      <div className="flex items-center justify-between">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 text-chinese">
            {title}
          </h3>
        )}
        {extra && (
          <div className="flex items-center space-x-2">{extra}</div>
        )}
      </div>
    </div>
  ) : null;

  // Custom footer
  const cardFooter = footer ? (
    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
      {footer}
    </div>
  ) : null;

  // Loading state
  if (loading) {
    return (
      <div className={cardClasses}>
        {cardHeader}
        <div className="px-6 py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className="text-gray-500 text-sm text-chinese">{loadingText}</p>
          </div>
        </div>
        {cardFooter}
      </div>
    );
  }

  // Render card with custom structure
  if (header || title || footer) {
    return (
      <div className={cardClasses}>
        {cardHeader}
        <div className={sizeClasses[size]}>{children}</div>
        {cardFooter}
      </div>
    );
  }

  // Use Ant Design card for simple cases
  return (
    <AntdCard
      {...antdProps}
      className={cardClasses}
      title={title}
      extra={extra}
      hoverable={hoverable}
      loading={loading}
    >
      {children}
    </AntdCard>
  );
};

// Chinese Card Grid Component
export interface ChineseCardGridProps {
  /**
   * Cards in the grid
   */
  children: React.ReactNode;

  /**
   * Grid columns (responsive)
   * @default { xs: 1, sm: 2, md: 3, lg: 4 }
   */
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };

  /**
   * Gap between cards
   * @default 'md'
   */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Custom CSS classes
   */
  className?: string;
}

export const ChineseCardGrid: React.FC<ChineseCardGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className,
}) => {
  // Gap classes
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  // Build grid class names
  const gridClasses = cn(
    'grid',
    gapClasses[gap],
    columns.xs && `grid-cols-${columns.xs}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  );

  return <div className={gridClasses}>{children}</div>;
};

// Export card grid
const ChineseCardWithGrid = Object.assign(ChineseCard, {
  Grid: ChineseCardGrid,
});

export default ChineseCardWithGrid;