import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';
import Button from '@/components/ui/Button';
import FormError from './FormError';
import LoadingSpinner from './LoadingSpinner';

export interface EmailVerificationProps {
  email: string;
  onVerificationSuccess?: () => void;
  onResend?: (email: string) => Promise<void>;
  className?: string;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationSuccess,
  onResend,
  className,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle verification code input (auto-focus next input)
  const handleCodeChange = (value: string, index: number) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');

    if (numericValue.length <= 1) {
      const newCode = code.split('');
      newCode[index] = numericValue;
      setCode(newCode.join(''));

      // Auto-focus next input
      if (numericValue && index < 5) {
        const nextInput = document.getElementById(`code-input-${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  // Handle key press for backspace navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setCode(pastedData);
      // Focus last input
      const lastInput = document.getElementById('code-input-5') as HTMLInputElement;
      if (lastInput) {
        lastInput.focus();
      }
    }
  };

  // Verify email code
  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('请输入完整的6位验证码');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate success/failure
      if (code === '123456') {
        setIsVerified(true);
        onVerificationSuccess?.();
      } else {
        setError('验证码错误，请重新输入');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '验证失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      await onResend?.(email);

      // Start countdown
      setCountdown(60);
      setCode(''); // Clear existing code

      // Focus first input
      const firstInput = document.getElementById('code-input-0') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '发送失败，请重试');
    } finally {
      setIsResending(false);
    }
  };

  // Success state
  if (isVerified) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">邮箱验证成功</h3>
        <p className="text-sm text-gray-600">您的邮箱 {email} 已成功验证</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">验证您的邮箱</h3>
        <p className="text-sm text-gray-600">
          我们已向 <span className="font-medium text-gray-900">{email}</span> 发送了6位验证码
        </p>
      </div>

      {/* Code Input Fields */}
      <div className="flex justify-center space-x-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            id={`code-input-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={code[index] || ''}
            onChange={(e) => handleCodeChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={cn(
              'w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent',
              'transition-all duration-200',
              code[index] ? 'border-red-500 bg-red-50' : 'border-gray-300'
            )}
            autoComplete="off"
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <FormError error={error} />
      )}

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        loading={isLoading}
        disabled={code.length !== 6 || isLoading}
        fullWidth
        size="lg"
      >
        {isLoading ? '验证中...' : '验证邮箱'}
      </Button>

      {/* Resend Section */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">
          没有收到验证码？
        </p>
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className={cn(
            'inline-flex items-center text-sm font-medium',
            countdown > 0 || isResending
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-red-500 hover:text-red-600 transition-colors'
          )}
        >
          {isResending && <LoadingSpinner size="sm" className="mr-2" />}
          {countdown > 0 ? `重新发送 (${countdown}s)` : '重新发送验证码'}
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          • 验证码有效期为10分钟<br/>
          • 请检查垃圾邮件文件夹<br/>
          • 如有问题，请联系客服
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;