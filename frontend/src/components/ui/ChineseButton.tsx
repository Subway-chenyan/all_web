import React from 'react';
import { Button as AntdButton, ButtonProps as AntdButtonProps } from 'antd';
import { cn } from '../../utils/cn';

// Chinese Button Component Interface
export interface ChineseButtonProps {
  /**
   * Button variant for Chinese design system
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';

  /**
   * Button size optimized for Chinese mobile users
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Loading state with Chinese text
   * @default false
   */
  loading?: boolean;

  /**
   * Chinese loading text
   * @default '加载中...'
   */
  loadingText?: string;

  /**
   * Custom CSS classes using Tailwind
   */
  className?: string;

  /**
   * Custom icon (can accept Ant Design icons or custom SVG)
   */
  icon?: React.ReactNode;

  /**
   * Icon position
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';

  /**
   * Children content
   */
  children?: React.ReactNode;

  // Ant Design Button Props
  disabled?: boolean;
  loading?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

// Chinese Button Component
export const ChineseButton: React.FC<ChineseButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loadingText = '加载中...',
  className,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  loading,
  htmlType,
  onClick,
}) => {
  // Size mapping for Chinese mobile optimization
  const sizeMapping = {
    xs: 'small' as const,
    sm: 'small' as const,
    md: 'middle' as const,
    lg: 'large' as const,
    xl: 'large' as const,
  };

  // Tailwind classes based on variant
  const variantClasses = {
    primary: 'bg-red-500 hover:bg-red-600 border-red-500 text-white shadow-chinese',
    secondary: 'bg-amber-500 hover:bg-amber-600 border-amber-500 text-white shadow-chinese',
    outline: 'bg-transparent hover:bg-red-50 border-red-500 text-red-500',
    ghost: 'bg-transparent hover:bg-gray-100 border-transparent text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 border-red-600 text-white shadow-chinese',
    success: 'bg-green-500 hover:bg-green-600 border-green-500 text-white shadow-chinese',
  };

  // Size classes for Tailwind
  const sizeClasses = {
    xs: 'h-8 px-3 text-xs',
    sm: 'h-10 px-4 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-12 px-8 text-lg',
    xl: 'h-14 px-10 text-xl',
  };

  // Combine classes
  const buttonClasses = cn(
    // Base classes
    'rounded-chinese font-medium transition-all duration-200 inline-flex items-center justify-center touch-manipulation',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',

    // Variant classes
    variantClasses[variant],

    // Size classes
    sizeClasses[size],

    // Full width
    fullWidth && 'w-full',

    // Custom classes
    className
  );

  // Adjust Ant Design button props based on variant
  const antdButtonProps = {
    size: sizeMapping[size],
    disabled: disabled || loading,
    loading: loading,
    block: fullWidth,
    className: buttonClasses,
    htmlType,
    onClick,
  };

  // Handle icon positioning
  const renderContent = () => {
    if (loading) {
      return loadingText;
    }

    if (icon && children) {
      if (iconPosition === 'right') {
        return (
          <>
            {children}
            <span className="ml-2">{icon}</span>
          </>
        );
      } else {
        return (
          <>
            <span className="mr-2">{icon}</span>
            {children}
          </>
        );
      }
    }

    if (icon && !children) {
      return icon;
    }

    return children;
  };

  return (
    <AntdButton {...antdButtonProps}>
      {renderContent()}
    </AntdButton>
  );
};

// Chinese Button Group Component
export interface ChineseButtonGroupProps {
  /**
   * Buttons in the group
   */
  children: React.ReactNode;

  /**
   * Group size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Vertical layout
   * @default false
   */
  vertical?: boolean;

  /**
   * Custom CSS classes
   */
  className?: string;
}

export const ChineseButtonGroup: React.FC<ChineseButtonGroupProps> = ({
  children,
  size = 'md',
  vertical = false,
  className,
}) => {
  const groupClasses = cn(
    'inline-flex',
    vertical ? 'flex-col' : 'flex-row',
    size === 'xs' && '[&_.chinese-button:first-child]:rounded-r-none [&_.chinese-button:last-child]:rounded-l-none [&_.chinese-button:not(:first-child):not(:last-child)]:rounded-none',
    size === 'sm' && '[&_.chinese-button:first-child]:rounded-r-none [&_.chinese-button:last-child]:rounded-l-none [&_.chinese-button:not(:first-child):not(:last-child)]:rounded-none',
    size === 'md' && '[&_.chinese-button:first-child]:rounded-r-none [&_.chinese-button:last-child]:rounded-l-none [&_.chinese-button:not(:first-child):not(:last-child)]:rounded-none',
    size === 'lg' && '[&_.chinese-button:first-child]:rounded-r-none [&_.chinese-button:last-child]:rounded-l-none [&_.chinese-button:not(:first-child):not(:last-child)]:rounded-none',
    size === 'xl' && '[&_.chinese-button:first-child]:rounded-r-none [&_.chinese-button:last-child]:rounded-l-none [&_.chinese-button:not(:first-child):not(:last-child)]:rounded-none',
    vertical && '[&_.chinese-button:first-child]:rounded-b-none [&_.chinese-button:last-child]:rounded-t-none [&_.chinese-button:not(:first-child):not(:last-child)]:rounded-none',
    className
  );

  return <div className={groupClasses}>{children}</div>;
};

// Export button group
const ChineseButtonWithGroup = Object.assign(ChineseButton, {
  Group: ChineseButtonGroup,
});

export default ChineseButtonWithGroup;