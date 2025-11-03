import React from 'react';
import { clsx } from 'clsx';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', className, text }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <svg
        className={clsx('animate-spin text-primary-600', sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
};

export const LoadingSpinner: React.FC<LoadingProps> = ({ size = 'md', className }) => (
  <div className={clsx('flex items-center justify-center', className)}>
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        }
      )}
    />
  </div>
);

export const PageLoading: React.FC<{ text?: string }> = ({ text = '加载中...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px]">
    <Loading size="lg" />
    <p className="mt-4 text-gray-600">{text}</p>
  </div>
);

export const SkeletonLoader: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className
}) => (
  <div className={clsx('space-y-3', className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={clsx(
          'animate-pulse rounded-md bg-gray-200',
          index === 0 ? 'h-4 w-3/4' : index === lines - 1 ? 'h-4 w-1/2' : 'h-4 w-full'
        )}
      />
    ))}
  </div>
);

export default Loading;