import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to combine Tailwind CSS classes with clsx and tailwind-merge
 * This ensures proper class precedence and avoids conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility function to create conditional classes for Chinese design system
 */
export function createConditionalClasses(
  base: string,
  conditions: Record<string, boolean>
): string {
  const conditionalClasses = Object.entries(conditions)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
    .join(' ');

  return cn(base, conditionalClasses);
}

/**
 * Utility function to create responsive classes for Chinese mobile-first design
 */
export function createResponsiveClasses(
  base: string,
  responsive: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  }
): string {
  const responsiveClasses = [
    responsive.xs && `${responsive.xs}`,
    responsive.sm && `sm:${responsive.sm}`,
    responsive.md && `md:${responsive.md}`,
    responsive.lg && `lg:${responsive.lg}`,
    responsive.xl && `xl:${responsive.xl}`,
  ]
    .filter(Boolean)
    .join(' ');

  return cn(base, responsiveClasses);
}

/**
 * Utility function to create Chinese typography classes
 */
export function createChineseTypography(
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl',
  weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' = 'normal',
  spacing: 'normal' | 'chinese' | 'chinese-loose' = 'chinese'
): string {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const spacingClasses = {
    normal: 'leading-normal',
    chinese: 'leading-chinese',
    'chinese-loose': 'leading-chinese-loose',
  };

  return cn(
    sizeClasses[size],
    weightClasses[weight],
    spacingClasses[spacing],
    'text-chinese tracking-chinese'
  );
}

/**
 * Utility function to create Chinese color theme classes
 */
export function createChineseColorTheme(
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray',
  shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 = 500,
  type: 'bg' | 'text' | 'border' = 'text'
): string {
  const colorMap = {
    primary: 'red',
    secondary: 'amber',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    gray: 'gray',
  };

  const typePrefix = {
    bg: 'bg',
    text: 'text',
    border: 'border',
  };

  return cn(`${typePrefix[type]}-${colorMap[color]}-${shade}`);
}

/**
 * Utility function to create Chinese spacing classes
 */
export function createChineseSpacing(
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl',
  type: 'p' | 'm' | 'px' | 'py' | 'mx' | 'my' = 'p'
): string {
  const sizeMap = {
    xs: '1',
    sm: '2',
    md: '4',
    lg: '6',
    xl: '8',
    '2xl': '12',
    '3xl': '16',
  };

  return cn(`${type}-${sizeMap[size]}`);
}

/**
 * Utility function to create Chinese shadow classes
 */
export function createChineseShadow(
  size: 'sm' | 'md' | 'lg' | 'chinese' | 'chinese-lg' = 'md'
): string {
  const shadowMap = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    chinese: 'shadow-chinese',
    'chinese-lg': 'shadow-chinese-lg',
  };

  return cn(shadowMap[size]);
}