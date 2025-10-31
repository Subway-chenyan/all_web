import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  name: string;
  key: string;
  options: FilterOption[];
  type?: 'single' | 'multiple';
}

export interface AnalyticsFiltersProps {
  filters: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onChange?: (filters: Record<string, string[]>) => void;
  className?: string;
  disabled?: boolean;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  selectedFilters = {},
  onChange,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const activeFiltersCount = Object.values(selectedFilters).reduce(
    (count, values) => count + values.length,
    0
  );

  const handleFilterChange = (groupKey: string, value: string, type: 'single' | 'multiple') => {
    if (disabled) return;

    const newFilters = { ...selectedFilters };

    if (type === 'single') {
      newFilters[groupKey] = [value];
    } else {
      const currentValues = newFilters[groupKey] || [];
      if (currentValues.includes(value)) {
        newFilters[groupKey] = currentValues.filter(v => v !== value);
      } else {
        newFilters[groupKey] = [...currentValues, value];
      }
    }

    onChange?.(newFilters);
  };

  const clearFilter = (groupKey: string, value?: string) => {
    if (disabled) return;

    const newFilters = { ...selectedFilters };
    if (value) {
      newFilters[groupKey] = (newFilters[groupKey] || []).filter(v => v !== value);
      if (newFilters[groupKey].length === 0) {
        delete newFilters[groupKey];
      }
    } else {
      delete newFilters[groupKey];
    }
    onChange?.(newFilters);
  };

  const clearAllFilters = () => {
    if (disabled) return;
    onChange?.({});
  };

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const getSelectedLabels = () => {
    const labels: string[] = [];
    filters.forEach(group => {
      const selectedValues = selectedFilters[group.key] || [];
      selectedValues.forEach(value => {
        const option = group.options.find(opt => opt.value === value);
        if (option) {
          labels.push(`${group.name}: ${option.label}`);
        }
      });
    });
    return labels;
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
          'disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
        )}
      >
        <Filter className="w-4 h-4 text-gray-400" />
        <span>筛选</span>
        {activeFiltersCount > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 transition-transform duration-200',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && !isOpen && (
        <div className="flex flex-wrap gap-2 mt-2">
          {getSelectedLabels().map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
            >
              {label}
              <button
                onClick={() => {
                  const [groupName] = label.split(': ');
                  const group = filters.find(g => g.name === groupName);
                  if (group) {
                    const option = group.options.find(opt => `${group.name}: ${opt.label}` === label);
                    if (option) {
                      clearFilter(group.key, option.value);
                    }
                  }
                }}
                className="hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            清除全部
          </button>
        </div>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">筛选条件</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    清除全部
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {filters.map((group) => (
                <div key={group.key} className="border-b border-gray-100 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{group.name}</span>
                      <ChevronDown className={cn(
                        'w-4 h-4 text-gray-400 transition-transform duration-200',
                        expandedGroups.has(group.key) && 'transform rotate-180'
                      )} />
                    </div>
                  </button>

                  {expandedGroups.has(group.key) && (
                    <div className="px-4 pb-3 space-y-2">
                      {group.options.map((option) => {
                        const isSelected = selectedFilters[group.key]?.includes(option.value);
                        return (
                          <label
                            key={option.value}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type={group.type === 'single' ? 'radio' : 'checkbox'}
                              name={group.key}
                              value={option.value}
                              checked={isSelected}
                              onChange={() => handleFilterChange(group.key, option.value, group.type || 'multiple')}
                              className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                            />
                            <span className="text-sm text-gray-700 flex-1">{option.label}</span>
                            {option.count && (
                              <span className="text-xs text-gray-500">({option.count})</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsFilters;