import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/utils';

export interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxLength?: number;
  allowDuplicates?: boolean;
  suggestions?: string[];
  className?: string;
  disabled?: boolean;
  tagValidator?: (tag: string) => boolean;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({
  tags = [],
  onChange,
  placeholder = '输入标签后按回车添加',
  maxTags = 10,
  maxLength = 20,
  allowDuplicates = false,
  suggestions = [],
  className = '',
  disabled = false,
  tagValidator,
  onTagAdd,
  onTagRemove
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue && suggestions.length > 0) {
      const filtered = suggestions.filter(
        suggestion =>
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          (!allowDuplicates ? !tags.includes(suggestion) : true)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
    setSelectedSuggestionIndex(-1);
  }, [inputValue, suggestions, tags, allowDuplicates]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();

    if (!trimmedTag) return false;

    if (trimmedTag.length > maxLength) {
      return false;
    }

    if (tags.length >= maxTags) {
      return false;
    }

    if (!allowDuplicates && tags.includes(trimmedTag)) {
      return false;
    }

    if (tagValidator && !tagValidator(trimmedTag)) {
      return false;
    }

    const newTags = [...tags, trimmedTag];
    onChange(newTags);
    onTagAdd?.(trimmedTag);
    setInputValue('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    return true;
  };

  const removeTag = (indexToRemove: number) => {
    const tagToRemove = tags[indexToRemove];
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
    onTagRemove?.(tagToRemove);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (showSuggestions && selectedSuggestionIndex >= 0) {
          addTag(filteredSuggestions[selectedSuggestionIndex]);
        } else if (inputValue) {
          addTag(inputValue);
        }
        break;

      case 'Backspace':
        if (!inputValue && tags.length > 0) {
          removeTag(tags.length - 1);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestionIndex(prev =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');
    const pastedTags = pastedText
      .split(/[,，\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag);

    if (pastedTags.length > 0) {
      const newTags = [...tags];
      let addedCount = 0;

      for (const tag of pastedTags) {
        if (newTags.length >= maxTags) break;
        if (tag.length > maxLength) continue;
        if (!allowDuplicates && newTags.includes(tag)) continue;
        if (tagValidator && !tagValidator(tag)) continue;

        newTags.push(tag);
        addedCount++;
        onTagAdd?.(tag);
      }

      if (addedCount > 0) {
        onChange(newTags);
      }
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20">
        {/* Tags */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                aria-label={`移除标签 ${tag}`}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </span>
        ))}

        {/* Input */}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            onPaste={handlePaste}
            placeholder={tags.length === 0 ? placeholder : ''}
            disabled={disabled}
            maxLength={maxLength}
            className="flex-1 min-w-[120px] px-2 py-1 outline-none text-sm"
          />
        )}

        {tags.length >= maxTags && (
          <span className="text-sm text-gray-500">
            已达到最大标签数量
          </span>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                index === selectedSuggestionIndex && 'bg-gray-50'
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-1 text-xs text-gray-500">
        {tags.length > 0 && (
          <span>{tags.length}/{maxTags} 个标签</span>
        )}
        {inputValue && (
          <span className="ml-2">
            {inputValue.length}/{maxLength} 字符
          </span>
        )}
      </div>
    </div>
  );
};

export default TagInput;