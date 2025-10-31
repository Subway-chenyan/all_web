import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/utils';
import { FormInputProps } from './FormInput';

export interface PhoneInputProps extends Omit<FormInputProps, 'type'> {
  defaultCountry?: string;
  onCountryChange?: (country: string, dialCode: string) => void;
  showCountryCode?: boolean;
}

// Country code configuration
const COUNTRIES = [
  { code: 'CN', name: '中国', dialCode: '+86', flag: '🇨🇳', pattern: /^1[3-9]\d{9}$/ },
  { code: 'HK', name: '香港', dialCode: '+852', flag: '🇭🇰', pattern: /^[4-9]\d{7}$/ },
  { code: 'TW', name: '台湾', dialCode: '+886', flag: '🇹🇼', pattern: /^9\d{8}$/ },
  { code: 'US', name: '美国', dialCode: '+1', flag: '🇺🇸', pattern: /^\d{10}$/ },
  { code: 'UK', name: '英国', dialCode: '+44', flag: '🇬🇧', pattern: /^\d{10,11}$/ },
  { code: 'JP', name: '日本', dialCode: '+81', flag: '🇯🇵', pattern: /^\d{10,11}$/ },
  { code: 'KR', name: '韩国', dialCode: '+82', flag: '🇰🇷', pattern: /^\d{9,11}$/ },
  { code: 'SG', name: '新加坡', dialCode: '+65', flag: '🇸🇬', pattern: /^[6-8]\d{7}$/ },
];

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(({
  defaultCountry = 'CN',
  onCountryChange,
  showCountryCode = true,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  className,
  ...props
}, ref) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.code === defaultCountry) || COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Update phone number when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      // Extract phone number without country code
      const cleanNumber = value.toString().replace(selectedCountry.dialCode, '').replace(/\s/g, '');
      setPhoneNumber(cleanNumber);
    }
  }, [value, selectedCountry.dialCode]);

  // Handle country change
  const handleCountryChange = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    onCountryChange?.(country.code, country.dialCode);

    // Validate phone number with new country pattern
    if (phoneNumber) {
      const valid = country.pattern.test(phoneNumber);
      setIsValid(valid);
    }
  };

  // Handle phone number change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setPhoneNumber(value);

    // Validate with current country pattern
    const valid = selectedCountry.pattern.test(value);
    setIsValid(value.length > 0 ? valid : null);

    // Pass full phone number with country code to parent
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fullNumber = value ? `${selectedCountry.dialCode}${value}` : '';
    onChange?.(e);
  };

  // Handle blur event
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setShowDropdown(false);
    onBlur?.(e);
  };

  // Format phone number for display
  const formatPhoneNumber = (number: string) => {
    if (!number) return '';

    // Basic formatting for Chinese numbers
    if (selectedCountry.code === 'CN' && number.length === 11) {
      return `${number.slice(0, 3)} ${number.slice(3, 7)} ${number.slice(7)}`;
    }

    // Basic formatting for US numbers
    if (selectedCountry.code === 'US' && number.length === 10) {
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }

    return number;
  };

  // Get validation state
  const getValidationState = () => {
    if (isValid === null) return '';
    if (isValid) return 'border-green-500 focus:border-green-500 focus:ring-green-500';
    return 'border-red-500 focus:border-red-500 focus:ring-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        {/* Country Selector */}
        <div className="flex">
          {showCountryCode && (
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center px-3 py-2 text-sm bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-0"
            >
              <span className="mr-1">{selectedCountry.flag}</span>
              <span className="text-xs text-gray-600">{selectedCountry.dialCode}</span>
              <svg
                className={cn('w-4 h-4 ml-1 text-gray-400 transition-transform', showDropdown && 'rotate-180')}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {/* Phone Input */}
          <input
            ref={ref}
            type="tel"
            value={formatPhoneNumber(phoneNumber)}
            onChange={handlePhoneChange}
            onBlur={handleBlur}
            placeholder="请输入手机号码"
            className={cn(
              'block w-full border border-gray-300 rounded-lg transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
              showCountryCode ? 'rounded-l-none' : '',
              getValidationState(),
              'focus:border-red-500 focus:ring-red-500',
              'px-4 py-2 text-sm',
              error ? 'border-red-500' : '',
              className
            )}
            {...props}
          />
        </div>

        {/* Country Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="py-1">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountryChange(country)}
                  className={cn(
                    'w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors',
                    selectedCountry.code === country.code && 'bg-red-50 text-red-600'
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{country.name}</div>
                    <div className="text-xs text-gray-500">{country.dialCode}</div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
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

      {/* Phone validation hint */}
      {phoneNumber && isValid !== null && (
        <div className="flex items-center space-x-1">
          {isValid ? (
            <>
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-green-600">手机号码格式正确</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 text-red-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-xs text-red-600">
                {selectedCountry.code === 'CN' ? '请输入有效的11位手机号码' : '请输入有效的手机号码'}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
});

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;