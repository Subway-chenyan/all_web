import React, { forwardRef, useId } from 'react';
import { cn } from '@/utils';

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  containerClassName?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  error,
  helperText,
  required = false,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  fullWidth = true,
  containerClassName,
  className,
  id,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Base input styles
  const baseInputStyles = 'block w-full rounded-lg border transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles
  const variantStyles = {
    default: 'border-gray-300 bg-white focus:border-red-500 focus:ring-red-500',
    filled: 'border-transparent bg-gray-50 focus:border-red-500 focus:ring-red-500 focus:bg-white',
    outlined: 'border-2 border-gray-200 bg-transparent focus:border-red-500 focus:ring-red-500',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  // Icon padding adjustments
  const iconPaddingStyles = {
    left: leftIcon ? 'pl-10' : '',
    right: rightIcon ? 'pr-10' : '',
  };

  // Error styles
  const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 leading-chinese"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400 w-5 h-5 flex items-center justify-center">
              {leftIcon}
            </div>
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            baseInputStyles,
            variantStyles[variant],
            sizeStyles[size],
            iconPaddingStyles.left,
            iconPaddingStyles.right,
            errorStyles,
            className
          )}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-gray-400 w-5 h-5 flex items-center justify-center">
              {rightIcon}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <div className="flex items-start space-x-1">
          {error && (
            <svg
              className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <p className={cn(
            'text-xs',
            error ? 'text-red-500' : 'text-gray-500',
            'leading-chinese'
          )}>
            {error || helperText}
          </p>
        </div>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;