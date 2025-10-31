import React from 'react';
import { cn } from '@/utils';

export interface FormErrorProps {
  error?: string | null;
  errors?: Record<string, string | string[]>;
  className?: string;
  variant?: 'default' | 'inline' | 'toast';
  onDismiss?: () => void;
}

const FormError: React.FC<FormErrorProps> = ({
  error,
  errors,
  className,
  variant = 'default',
  onDismiss,
}) => {
  // If no error or errors, don't render
  if (!error && !errors) return null;

  // Flatten errors object into array of messages
  const errorMessages: string[] = [];

  if (error) {
    errorMessages.push(error);
  }

  if (errors) {
    Object.entries(errors).forEach(([field, message]) => {
      if (Array.isArray(message)) {
        message.forEach((msg) => {
          errorMessages.push(`${field}: ${msg}`);
        });
      } else if (message) {
        errorMessages.push(`${field}: ${message}`);
      }
    });
  }

  // Remove duplicates and limit to first few errors
  const uniqueErrors = [...new Set(errorMessages)].slice(0, 3);

  // Error icon
  const ErrorIcon = () => (
    <svg
      className="w-5 h-5 text-red-500 flex-shrink-0"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  // Dismiss button
  const DismissButton = () => (
    <button
      type="button"
      onClick={onDismiss}
      className="ml-4 flex-shrink-0 p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );

  // Render different variants
  switch (variant) {
    case 'inline':
      return (
        <div className={cn('space-y-1', className)}>
          {uniqueErrors.map((errorMessage, index) => (
            <div key={index} className="flex items-center text-sm text-red-600">
              <ErrorIcon />
              <span className="ml-2 leading-chinese">{errorMessage}</span>
            </div>
          ))}
        </div>
      );

    case 'toast':
      return (
        <div
          className={cn(
            'fixed top-4 right-4 max-w-sm bg-white border border-red-200 rounded-lg shadow-lg p-4 z-50 animate-pulse',
            className
          )}
        >
          <div className="flex items-start">
            <ErrorIcon />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">错误</h3>
              <div className="mt-1 text-sm text-red-700 space-y-1">
                {uniqueErrors.map((errorMessage, index) => (
                  <p key={index} className="leading-chinese">{errorMessage}</p>
                ))}
              </div>
            </div>
            {onDismiss && <DismissButton />}
          </div>
        </div>
      );

    case 'default':
    default:
      return (
        <div
          className={cn(
            'bg-red-50 border border-red-200 rounded-lg p-4',
            className
          )}
        >
          <div className="flex items-start">
            <ErrorIcon />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {uniqueErrors.length === 1 ? '错误' : '发现多个错误'}
              </h3>
              <div className="mt-2 text-sm text-red-700 space-y-1">
                {uniqueErrors.map((errorMessage, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span className="leading-chinese">{errorMessage}</span>
                  </div>
                ))}
              </div>
              {uniqueErrors.length > 3 && (
                <p className="mt-2 text-xs text-red-600">
                  还有 {errorMessages.length - 3} 个错误未显示
                </p>
              )}
            </div>
            {onDismiss && <DismissButton />}
          </div>
        </div>
      );
  }
};

export default FormError;