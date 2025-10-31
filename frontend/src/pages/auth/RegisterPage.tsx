import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  FormInput,
  PasswordInput,
  PhoneInput,
  SocialLoginButton,
  FormError,
  LoadingSpinner,
  EmailVerification,
} from '@/components/auth';
import { useAuth, useAuthFormValidation } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { cn } from '@/utils';
import { ROUTES } from '@/constants';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const {
    register,
    registerForm,
    updateRegisterForm,
    isLoading,
    error,
    clearError,
    socialLoginLoading,
    socialLogin,
  } = useAuth();

  const { validateRegisterForm, validatePassword } = useAuthFormValidation();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  // Registration steps
  const steps = [
    { id: 1, title: '基本信息', description: '创建您的账户' },
    { id: 2, title: '个人资料', description: '完善您的个人信息' },
    { id: 3, title: '邮箱验证', description: '验证您的邮箱地址' },
  ];

  // Redirect if already authenticated
  useEffect(() => {
    // This will be handled by the auth store's initialization
  }, []);

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    updateRegisterForm({ [field]: value });
    clearError();

    // Clear field-specific error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        // Basic information validation
        if (!registerForm.email) {
          errors.email = '请输入邮箱地址';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
          errors.email = '请输入有效的邮箱地址';
        }

        if (!registerForm.password) {
          errors.password = '请输入密码';
        } else {
          const passwordValidation = validatePassword(registerForm.password);
          if (!passwordValidation.isValid) {
            errors.password = '密码至少需要8个字符';
          }
        }

        if (!registerForm.confirmPassword) {
          errors.confirmPassword = '请确认密码';
        } else if (registerForm.password !== registerForm.confirmPassword) {
          errors.confirmPassword = '两次输入的密码不一致';
        }

        if (!registerForm.username) {
          errors.username = '请输入用户名';
        } else if (registerForm.username.length < 3) {
          errors.username = '用户名至少需要3个字符';
        } else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.username)) {
          errors.username = '用户名只能包含字母、数字和下划线';
        }

        if (!registerForm.userType) {
          errors.userType = '请选择账户类型';
        }
        break;

      case 2:
        // Personal information validation
        if (!registerForm.firstName) {
          errors.firstName = '请输入姓氏';
        }

        if (!registerForm.lastName) {
          errors.lastName = '请输入名字';
        }

        if (registerForm.phone && !/^1[3-9]\d{9}$/.test(registerForm.phone)) {
          errors.phone = '请输入有效的手机号码';
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      const result = await register(registerForm);

      if (result.success) {
        setShowEmailVerification(true);
      } else {
        setFormErrors({ general: result.error });
      }
    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : '注册失败，请重试'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: 'wechat' | 'qq' | 'alipay') => {
    try {
      const result = await socialLogin(provider, { code: 'mock_code', state: 'register' });

      if (result.success) {
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        setFormErrors({ general: result.error });
      }
    } catch (error) {
      setFormErrors({
        general: `${provider}登录失败，请重试`
      });
    }
  };

  // Handle email verification success
  const handleEmailVerificationSuccess = () => {
    navigate(ROUTES.DASHBOARD, { replace: true });
  };

  // Handle password strength change
  const handlePasswordStrengthChange = (strength: 'weak' | 'medium' | 'strong') => {
    setPasswordStrength(strength);
  };

  // Email verification success state
  if (showEmailVerification) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md" variant="default">
          <Card.Body className="p-8">
            <EmailVerification
              email={registerForm.email}
              onVerificationSuccess={handleEmailVerificationSuccess}
            />
          </Card.Body>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md" variant="default">
        <Card.Body className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              创建账户
            </h1>
            <p className="text-sm text-gray-600">
              加入技能集市，让您的技能发挥价值
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center"
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    currentStep >= step.id
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  )}>
                    {step.id}
                  </div>
                  <div className={cn(
                    'ml-2 text-sm',
                    currentStep >= step.id ? 'text-red-500' : 'text-gray-500'
                  )}>
                    {step.title}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'flex-1 h-1 mx-4 rounded',
                      currentStep > step.id ? 'bg-red-500' : 'bg-gray-200'
                    )} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* General Error */}
          {formErrors.general && (
            <div className="mb-6">
              <FormError error={formErrors.general} onDismiss={() => setFormErrors({})} />
            </div>
          )}

          {/* Registration Form */}
          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <FormInput
                  id="email"
                  type="email"
                  label="邮箱地址"
                  placeholder="请输入您的邮箱地址"
                  value={registerForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={formErrors.email}
                  required
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  autoComplete="email"
                />

                <PasswordInput
                  id="password"
                  label="密码"
                  placeholder="请设置密码"
                  value={registerForm.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={formErrors.password}
                  showStrengthIndicator
                  onStrengthChange={handlePasswordStrengthChange}
                  required
                  autoComplete="new-password"
                />

                <PasswordInput
                  id="confirmPassword"
                  label="确认密码"
                  placeholder="请再次输入密码"
                  value={registerForm.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  error={formErrors.confirmPassword}
                  required
                  autoComplete="new-password"
                />

                <FormInput
                  id="username"
                  type="text"
                  label="用户名"
                  placeholder="请输入用户名"
                  value={registerForm.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  error={formErrors.username}
                  required
                  helperText="用户名将作为您的唯一标识，只能包含字母、数字和下划线"
                  autoComplete="username"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    账户类型 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('userType', 'client')}
                      className={cn(
                        'p-3 border-2 rounded-lg text-sm font-medium transition-all',
                        registerForm.userType === 'client'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      )}
                    >
                      <div className="font-medium">买家</div>
                      <div className="text-xs text-gray-500 mt-1">寻找技能服务</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('userType', 'freelancer')}
                      className={cn(
                        'p-3 border-2 rounded-lg text-sm font-medium transition-all',
                        registerForm.userType === 'freelancer'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      )}
                    >
                      <div className="font-medium">卖家</div>
                      <div className="text-xs text-gray-500 mt-1">提供技能服务</div>
                    </button>
                  </div>
                  {formErrors.userType && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.userType}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    id="lastName"
                    type="text"
                    label="姓氏"
                    placeholder="姓"
                    value={registerForm.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={formErrors.lastName}
                    required
                    autoComplete="family-name"
                  />
                  <FormInput
                    id="firstName"
                    type="text"
                    label="名字"
                    placeholder="名"
                    value={registerForm.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={formErrors.firstName}
                    required
                    autoComplete="given-name"
                  />
                </div>

                <PhoneInput
                  id="phone"
                  label="手机号码（选填）"
                  placeholder="请输入手机号码"
                  value={registerForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={formErrors.phone}
                  helperText="用于账户安全验证和重要通知"
                  defaultCountry="CN"
                  autoComplete="tel"
                />

                <div>
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={registerForm.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-600 leading-chinese">
                      我已阅读并同意
                      <Link to="/terms" className="text-red-500 hover:text-red-600 mx-1">
                        服务条款
                      </Link>
                      和
                      <Link to="/privacy" className="text-red-500 hover:text-red-600 mx-1">
                        隐私政策
                      </Link>
                    </span>
                  </label>
                  {formErrors.agreeToTerms && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.agreeToTerms}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={handlePrevious}
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  上一步
                </Button>
              )}

              {currentStep < 2 && (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  下一步
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? '注册中...' : '完成注册'}
                </Button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">或使用以下方式注册</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <SocialLoginButton
              provider="wechat"
              onClick={() => handleSocialLogin('wechat')}
              loading={socialLoginLoading.wechat}
            />
            <SocialLoginButton
              provider="qq"
              onClick={() => handleSocialLogin('qq')}
              loading={socialLoginLoading.qq}
            />
            <SocialLoginButton
              provider="alipay"
              onClick={() => handleSocialLogin('alipay')}
              loading={socialLoginLoading.alipay}
            />
          </div>

          {/* Login Link */}
          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              已有账号？{' '}
              <Link
                to={ROUTES.LOGIN}
                className="font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                立即登录
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </AuthLayout>
  );
};

export default RegisterPage;