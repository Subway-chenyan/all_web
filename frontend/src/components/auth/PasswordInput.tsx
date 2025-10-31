import React, { useState, forwardRef, useId } from 'react';
import { cn } from '@/utils';
import FormInput, { FormInputProps } from './FormInput';

export interface PasswordInputProps extends Omit<FormInputProps, 'type' | 'rightIcon'> {
  showStrengthIndicator?: boolean;
  onStrengthChange?: (strength: 'weak' | 'medium' | 'strong', score: number) => void;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  showStrengthIndicator = false,
  onStrengthChange,
  className,
  value,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [strengthScore, setStrengthScore] = useState(0);
  const generatedId = useId();

  // Calculate password strength
  const calculatePasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; score: number } => {
    if (!password || password.length < 8) {
      return { strength: 'weak', score: 0 };
    }

    let score = 0;

    // Length bonus
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // Character variety
    if (/[a-z]/.test(password)) score++; // lowercase
    if (/[A-Z]/.test(password)) score++; // uppercase
    if (/\d/.test(password)) score++; // numbers
    if (/[^a-zA-Z\d]/.test(password)) score++; // special characters

    // Avoid common patterns
    if (!/(.)\1{2,}/.test(password)) score++; // no repeated characters
    if (!/123|abc|qwe/i.test(password)) score++; // no sequential patterns

    let strength: 'weak' | 'medium' | 'strong';
    if (score <= 3) strength = 'weak';
    else if (score <= 6) strength = 'medium';
    else strength = 'strong';

    return { strength, score };
  };

  // Update strength when password changes
  React.useEffect(() => {
    if (showStrengthIndicator && value) {
      const result = calculatePasswordStrength(value as string);
      setStrength(result.strength);
      setStrengthScore(result.score);
      onStrengthChange?.(result.strength, result.score);
    }
  }, [value, showStrengthIndicator, onStrengthChange]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Eye icons for show/hide password
  const EyeIcon = () => (
    <svg
      className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {showPassword ? (
        <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      ) : (
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      )}
    </svg>
  );

  // Strength indicator component
  const StrengthIndicator = () => {
    if (!showStrengthIndicator || !value) return null;

    const strengthConfig = {
      weak: { color: 'bg-red-500', text: '弱', textColor: 'text-red-500' },
      medium: { color: 'bg-yellow-500', text: '中等', textColor: 'text-yellow-500' },
      strong: { color: 'bg-green-500', text: '强', textColor: 'text-green-500' },
    };

    const config = strengthConfig[strength];

    return (
      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">密码强度</span>
          <span className={cn('text-xs font-medium', config.textColor)}>
            {config.text}
          </span>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-200',
                level <= strengthScore ? config.color : 'bg-gray-200'
              )}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <p>密码建议：</p>
          <ul className="space-y-0.5 ml-2">
            <li className={cn('flex items-center', /[a-z]/.test(value as string) && /[A-Z]/.test(value as string) ? 'text-green-500' : 'text-gray-400')}>
              <span className="mr-1">•</span>
              包含大小写字母
            </li>
            <li className={cn('flex items-center', /\d/.test(value as string) ? 'text-green-500' : 'text-gray-400')}>
              <span className="mr-1">•</span>
              包含数字
            </li>
            <li className={cn('flex items-center', /[^a-zA-Z\d]/.test(value as string) ? 'text-green-500' : 'text-gray-400')}>
              <span className="mr-1">•</span>
              包含特殊字符
            </li>
            <li className={cn('flex items-center', (value as string).length >= 12 ? 'text-green-500' : 'text-gray-400')}>
              <span className="mr-1">•</span>
              至少12个字符
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <FormInput
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={<EyeIcon />}
        className={cn('cursor-text', className)}
        value={value}
        {...props}
      />
      <StrengthIndicator />
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;