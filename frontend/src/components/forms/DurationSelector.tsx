import React, { useState } from 'react';
import { cn } from '@/utils';

export interface DurationSelectorProps {
  value: number; // in days
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  showPresets?: boolean;
  presetOptions?: Array<{ label: string; value: number }>;
  allowCustom?: boolean;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 365,
  disabled = false,
  className = '',
  showPresets = true,
  presetOptions,
  allowCustom = true
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState(value.toString());

  const defaultPresets = [
    { label: '1天', value: 1 },
    { label: '3天', value: 3 },
    { label: '5天', value: 5 },
    { label: '7天', value: 7 },
    { label: '14天', value: 14 },
    { label: '21天', value: 21 },
    { label: '30天', value: 30 },
  ];

  const presets = presetOptions || defaultPresets;

  const formatDuration = (days: number): string => {
    if (days === 1) return '1天';
    if (days < 7) return `${days}天`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      if (remainingDays === 0) return `${weeks}周`;
      return `${weeks}周${remainingDays}天`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      if (remainingDays === 0) return `${months}个月`;
      return `${months}个月${remainingDays}天`;
    }
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (remainingDays === 0) return `${years}年`;
    return `${years}年${remainingDays}天`;
  };

  const handlePresetClick = (presetValue: number) => {
    onChange(presetValue);
    setCustomValue(presetValue.toString());
    setIsCustom(false);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Only allow numbers
    if (/^\d*$/.test(newValue)) {
      setCustomValue(newValue);
      const numValue = parseInt(newValue) || 0;
      if (numValue >= min && numValue <= max) {
        onChange(numValue);
      }
    }
  };

  const handleCustomBlur = () => {
    const numValue = parseInt(customValue) || min;
    const validatedValue = Math.max(min, Math.min(max, numValue));
    setCustomValue(validatedValue.toString());
    onChange(validatedValue);
  };

  const selectedPreset = presets.find(preset => preset.value === value);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Preset Options */}
      {showPresets && !isCustom && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset.value)}
              className={cn(
                'px-3 py-2 text-sm border rounded-md transition-colors',
                value === preset.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              )}
              disabled={disabled}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Custom Input */}
      {allowCustom && (
        <div className="flex items-center space-x-3">
          {showPresets && (
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-sm text-blue-600 hover:text-blue-700"
              disabled={disabled}
            >
              {isCustom ? '选择预设' : '自定义'}
            </button>
          )}

          {isCustom && (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={customValue}
                onChange={handleCustomChange}
                onBlur={handleCustomBlur}
                min={min}
                max={max}
                disabled={disabled}
                className={cn(
                  'w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                  disabled && 'bg-gray-100 cursor-not-allowed'
                )}
              />
              <span className="text-sm text-gray-600">天</span>
            </div>
          )}
        </div>
      )}

      {/* Selected Value Display */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">交付时间: </span>
        <span className="text-gray-900">{formatDuration(value)}</span>
        {selectedPreset && (
          <span className="ml-2 text-xs text-gray-500">
            ({selectedPreset.label})
          </span>
        )}
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-500">
        建议根据工作复杂度合理设置交付时间
      </div>
    </div>
  );
};

export default DurationSelector;