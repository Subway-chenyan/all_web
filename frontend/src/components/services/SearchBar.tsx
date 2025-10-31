import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useServicesStore } from '@/store/servicesStore';
import { cn } from '@/utils';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  onSearch,
  showSuggestions = true,
  className = '',
  size = 'medium',
}) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { searchQuery, setSearchQuery, searchServices } = useServicesStore();

  const [query, setQuery] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Popular search suggestions
  const popularSuggestions = [
    'logo设计',
    '网站开发',
    'UI/UX设计',
    '内容写作',
    '视频剪辑',
    'SEO优化',
    '移动应用开发',
    '品牌设计',
    '社交媒体营销',
    '翻译服务',
  ];

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && query.length >= 2) {
        handleSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestions = (searchText: string) => {
    // Filter popular suggestions
    const filtered = popularSuggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(searchText.toLowerCase())
    );

    setSuggestions(filtered.slice(0, 8));
    setShowSuggestionsList(filtered.length > 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSearchQuery(value);

    if (!value) {
      setShowSuggestionsList(false);
      setSuggestions([]);
    }
  };

  const handleSearch = async (searchTerm?: string) => {
    const searchValue = searchTerm || query;

    if (!searchValue.trim()) return;

    setIsLoading(true);
    setShowSuggestionsList(false);

    try {
      if (onSearch) {
        onSearch(searchValue);
      } else {
        await searchServices(searchValue);
        // Navigate to services page if not already there
        if (window.location.pathname !== '/services') {
          navigate('/services');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSearchQuery(suggestion);
    setShowSuggestionsList(false);
    handleSearch(suggestion);
  };

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg',
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className={cn(
                'text-gray-400',
                iconSizeClasses[size]
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query && suggestions.length > 0) {
                setShowSuggestionsList(true);
              }
            }}
            placeholder={placeholder || t('search.searchQuery')}
            className={cn(
              'block w-full pl-10 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200',
              sizeClasses[size],
              isLoading && 'opacity-75'
            )}
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchQuery('');
                setShowSuggestionsList(false);
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-12 flex items-center pr-2"
            >
              <svg
                className={cn(
                  'text-gray-400 hover:text-gray-600 transition-colors duration-200',
                  iconSizeClasses[size]
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Search Button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={cn(
              'absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200',
              isLoading && 'animate-pulse'
            )}
          >
            {isLoading ? (
              <svg
                className={cn(
                  'animate-spin',
                  iconSizeClasses[size]
                )}
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
            ) : (
              <svg
                className={iconSizeClasses[size]}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="py-1">
            {/* Suggestions Header */}
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
              搜索建议
            </div>

            {/* Suggestions List */}
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-150 flex items-center space-x-2"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>{suggestion}</span>
              </button>
            ))}

            {/* View All Results */}
            <div className="border-t border-gray-100 px-3 py-2">
              <button
                onClick={() => handleSearch()}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                查看所有结果
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;