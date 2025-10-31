import React from 'react';
import { cn } from '@/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
  text?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  text,
  overlay = false,
}) => {
  // Size configurations
  const sizeConfig = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  // Color configurations
  const colorConfig = {
    primary: 'text-red-500',
    white: 'text-white',
    gray: 'text-gray-500',
  };

  // Text size based on spinner size
  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const Spinner = () => (
    <svg
      className={cn(
        'animate-spin',
        sizeConfig[size],
        colorConfig[color],
        className
      )}
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
  );

  // Overlay version
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-3 shadow-xl">
          <Spinner />
          {text && (
            <span className={cn('text-gray-700 font-medium', textSize[size])}>
              {text}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Inline version
  return (
    <div className="flex items-center space-x-2">
      <Spinner />
      {text && (
        <span className={cn('text-gray-700 font-medium', textSize[size])}>
          {text}
        </span>
      )}
    </div>
  );
};

// Button loading wrapper
export const ButtonLoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeConfig = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <svg
      className={cn('animate-spin', sizeConfig[size], 'text-current', className)}
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
  );
};

// Page loading spinner
export const PageLoadingSpinner: React.FC<{
  text?: string;
  className?: string;
}> = ({ text = '加载中...', className }) => (
  <div className={cn('flex flex-col items-center justify-center p-8 space-y-4', className)}>
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-red-500 rounded-full animate-spin border-t-transparent"></div>
    </div>
    <div className="text-center space-y-2">
      <p className="text-gray-600 font-medium">{text}</p>
      <p className="text-gray-400 text-sm">请稍候，正在处理您的请求</p>
    </div>
  </div>
);

export default LoadingSpinner;