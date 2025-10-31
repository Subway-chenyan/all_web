import React, { useState, useEffect, ChangeEvent } from 'react';
import { cn } from '@/utils';

export interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCurrency?: boolean;
  allowDecimals?: boolean;
  maxLength?: number;
}

const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  currency = 'CNY',
  min = 0,
  max = 999999,
  step = 1,
  placeholder = '0.00',
  disabled = false,
  className = '',
  showCurrency = true,
  allowDecimals = true,
  maxLength = 10
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      // Format the value when not focused
      if (value || value === 0) {
        setInputValue(formatValue(value));
      } else {
        setInputValue('');
      }
    }
  }, [value, isFocused]);

  const formatValue = (num: number): string => {
    if (allowDecimals) {
      return num.toFixed(2);
    }
    return num.toString();
  };

  const parseValue = (str: string): number => {
    // Remove all non-numeric characters except decimal point
    const cleanStr = str.replace(/[^0-9.]/g, '');

    // Handle multiple decimal points
    const parts = cleanStr.split('.');
    if (parts.length > 2) {
      parts.splice(2);
    }

    // Limit decimal places
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
    }

    const parsed = parseFloat(parts.join('.'));
    return isNaN(parsed) ? 0 : parsed;
  };

  const validateValue = (num: number): number => {
    // Apply min/max constraints
    if (num < min) return min;
    if (num > max) return max;
    return num;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Check max length
    if (newValue.length > maxLength) return;

    // Allow empty input or valid number format
    if (newValue === '' || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
      setInputValue(newValue);

      // Parse and update value
      const parsed = parseValue(newValue);
      const validated = validateValue(parsed);
      onChange(validated);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Ensure the value is properly formatted when blurring
    const parsed = parseValue(inputValue);
    const validated = validateValue(parsed);
    onChange(validated);
    setInputValue(formatValue(validated));
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleIncrement = () => {
    const newValue = value + step;
    const validated = validateValue(newValue);
    onChange(validated);
  };

  const handleDecrement = () => {
    const newValue = value - step;
    const validated = validateValue(newValue);
    onChange(validated);
  };

  const getCurrencySymbol = (): string => {
    switch (currency) {
      case 'CNY':
        return '¥';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return currency;
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center">
        {/* Currency Symbol */}
        {showCurrency && (
          <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
            <span className="text-gray-600 font-medium">{getCurrencySymbol()}</span>
          </div>
        )}

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 px-3 py-2 border border-gray-300 rounded-r-md',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'transition-colors',
            showCurrency ? 'rounded-l-none' : 'rounded-l-md',
            disabled && 'bg-gray-100 cursor-not-allowed'
          )}
          inputMode="decimal"
        />

        {/* Increment/Decrement Buttons */}
        {!disabled && (
          <div className="flex flex-col ml-2">
            <button
              type="button"
              onClick={handleIncrement}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={value >= max}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className="px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-l border-b border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={value <= min}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {allowDecimals && (
        <div className="mt-1 text-xs text-gray-500">
          支持小数点后两位
        </div>
      )}

      {/* Range Indicator */}
      {(min > 0 || max < 999999) && (
        <div className="mt-1 text-xs text-gray-500">
          范围: {getCurrencySymbol()}{min} - {getCurrencySymbol()}{max}
        </div>
      )}
    </div>
  );
};

export default PriceInput;