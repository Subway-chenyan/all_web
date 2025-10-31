import React, { useState, useCallback } from 'react';
import { Phone, MessageCircle, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { verificationService } from '../../services/verification';

interface PhoneVerificationProps {
  onVerificationComplete: (phone: string) => void;
  onVerificationError: (error: string) => void;
  initialPhone?: string;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onVerificationComplete,
  onVerificationError,
  initialPhone = '',
}) => {
  const [phone, setPhone] = useState(initialPhone);
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const MAX_ATTEMPTS = 3;
  const COUNTDOWN_SECONDS = 60;

  const formatPhoneNumber = useCallback((value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Format for Chinese phone numbers: +86 XXX-XXXX-XXXX
    if (digits.startsWith('86') && digits.length > 2) {
      const mobile = digits.slice(2);
      if (mobile.length <= 3) {
        return `+86 ${mobile}`;
      } else if (mobile.length <= 7) {
        return `+86 ${mobile.slice(0, 3)}-${mobile.slice(3)}`;
      } else {
        return `+86 ${mobile.slice(0, 3)}-${mobile.slice(3, 7)}-${mobile.slice(7, 11)}`;
      }
    }

    // If just digits, assume it's a Chinese number
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
  }, []);

  const validatePhone = useCallback((phone: string) => {
    const digits = phone.replace(/\D/g, '');

    // Check if it's a valid Chinese mobile number
    if (digits.startsWith('86') && digits.length === 13) {
      const mobile = digits.slice(2);
      return /^1[3-9]\d{9}$/.test(mobile);
    }

    // Check if it's a mobile number without country code
    if (digits.length === 11) {
      return /^1[3-9]\d{9}$/.test(digits);
    }

    return false;
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  }, [formatPhoneNumber]);

  const sendVerificationCode = useCallback(async () => {
    if (!validatePhone(phone)) {
      onVerificationError('请输入有效的中国手机号码');
      return;
    }

    try {
      const success = await verificationService.sendPhoneVerification(phone);
      if (success) {
        setIsCodeSent(true);
        setCountdown(COUNTDOWN_SECONDS);

        // Start countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        onVerificationError('发送验证码失败，请重试');
      }
    } catch (error: any) {
      onVerificationError(error.message || '发送验证码失败');
    }
  }, [phone, validatePhone, onVerificationError]);

  const verifyCode = useCallback(async () => {
    if (verificationCode.length !== 6) {
      onVerificationError('请输入6位验证码');
      return;
    }

    setIsVerifying(true);

    try {
      const success = await verificationService.verifyPhone(phone, verificationCode);
      if (success) {
        setIsVerified(true);
        onVerificationComplete(phone);
      } else {
        setAttempts(prev => prev + 1);
        if (attempts + 1 >= MAX_ATTEMPTS) {
          onVerificationError('验证失败次数过多，请重新发送验证码');
          setIsCodeSent(false);
          setVerificationCode('');
          setAttempts(0);
        } else {
          onVerificationError(`验证码错误，还有 ${MAX_ATTEMPTS - attempts - 1} 次机会`);
        }
      }
    } catch (error: any) {
      onVerificationError(error.message || '验证失败');
    } finally {
      setIsVerifying(false);
    }
  }, [phone, verificationCode, attempts, onVerificationComplete, onVerificationError]);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
  }, []);

  const resetVerification = useCallback(() => {
    setIsCodeSent(false);
    setVerificationCode('');
    setCountdown(0);
    setAttempts(0);
    setIsVerified(false);
  }, []);

  const handleResendCode = useCallback(() => {
    resetVerification();
    setTimeout(sendVerificationCode, 100);
  }, [resetVerification, sendVerificationCode]);

  if (isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">手机号验证成功</h3>
        <p className="text-green-700 mb-4">
          您的手机号 {phone} 已成功验证
        </p>
        <button
          onClick={resetVerification}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          更换手机号
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Phone className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">手机号验证</h3>
            <p className="mt-1 text-sm text-blue-800">
              我们将向您的手机号发送6位验证码，用于验证您的身份
            </p>
          </div>
        </div>
      </div>

      {!isCodeSent ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              手机号码 *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+86 138-0013-8000"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              请输入有效的中国手机号码，支持 +86 或直接输入11位号码
            </p>
          </div>

          {phone && validatePhone(phone) && (
            <button
              onClick={sendVerificationCode}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              发送验证码
            </button>
          )}

          {phone && !validatePhone(phone) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  请输入有效的中国手机号码
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              验证码 *
            </label>
            <div className="relative">
              <input
                type="text"
                value={verificationCode}
                onChange={handleCodeChange}
                placeholder="请输入6位验证码"
                maxLength={6}
                className="w-full px-3 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {attempts > 0 && (
                <div className="absolute -top-6 right-0 text-sm text-red-600">
                  剩余尝试次数: {MAX_ATTEMPTS - attempts}
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600 text-center">
              验证码已发送至 {phone}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={verifyCode}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isVerifying ? '验证中...' : '确认验证'}
            </button>

            <button
              onClick={resetVerification}
              className="px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              返回
            </button>
          </div>

          {countdown > 0 ? (
            <div className="text-center text-sm text-gray-500">
              <Clock className="w-4 h-4 inline mr-1" />
              {countdown} 秒后可重新发送
            </div>
          ) : (
            <button
              onClick={handleResendCode}
              className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              重新发送验证码
            </button>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <strong>未收到验证码？</strong><br />
              • 请检查手机是否开启了短信拦截功能<br />
              • 确认手机号码输入正确<br />
              • 等待1-2分钟后重新尝试发送
            </p>
          </div>
        </div>
      )}
    </div>
  );
};