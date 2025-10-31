import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

export interface DateRangeOption {
  label: string;
  value: string;
  days?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface DateRangeSelectorProps {
  options: DateRangeOption[];
  selectedValue?: string;
  onChange?: (option: DateRangeOption) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const DEFAULT_OPTIONS: DateRangeOption[] = [
  { label: '最近7天', value: '7d', days: 7 },
  { label: '最近30天', value: '30d', days: 30 },
  { label: '最近90天', value: '90d', days: 90 },
  { label: '最近6个月', value: '6m', days: 180 },
  { label: '最近1年', value: '1y', days: 365 },
  { label: '自定义', value: 'custom' },
];

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  options = DEFAULT_OPTIONS,
  selectedValue = '30d',
  onChange,
  className = '',
  placeholder = '选择时间范围',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DateRangeOption>(
    options.find(opt => opt.value === selectedValue) || options[0]
  );

  const handleSelect = (option: DateRangeOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange?.(option);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm',
          'text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200',
          disabled && 'bg-gray-100 cursor-not-allowed'
        )}
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span>{selectedOption.label}</span>
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 transition-transform duration-200',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150',
                  'focus:outline-none focus:bg-gray-50',
                  selectedOption.value === option.value
                    ? 'bg-red-50 text-red-700 font-medium'
                    : 'text-gray-700'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangeSelector;