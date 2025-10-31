import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  FormInput,
  PasswordInput,
  SocialLoginButton,
  FormError,
  LoadingSpinner,
} from '@/components/auth';
import { useAuth, useAuthFormValidation } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { cn } from '@/utils';
import { ROUTES } from '@/constants';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const {
    login,
    loginForm,
    updateLoginForm,
    isLoading,
    error,
    clearError,
    socialLoginLoading,
    socialLogin,
  } = useAuth();

  const { validateLoginForm } = useAuthFormValidation();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get redirect path from location state
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  // Redirect if already authenticated
  useEffect(() => {
    // This will be handled by the auth store's initialization
  }, []);

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    updateLoginForm({ [field]: value });
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    // Validate form
    const validation = validateLoginForm();
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(loginForm);

      if (result.success) {
        // Redirect to intended page or dashboard
        navigate(from, { replace: true });
      } else {
        setFormErrors({ general: result.error });
      }
    } catch (error) {
      setFormErrors({
        general: error instanceof Error ? error.message : '登录失败，请重试'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: 'wechat' | 'qq' | 'alipay') => {
    try {
      // For now, we'll simulate social login
      // In a real implementation, this would redirect to OAuth provider
      const result = await socialLogin(provider, { code: 'mock_code', state: 'login' });

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setFormErrors({ general: result.error });
      }
    } catch (error) {
      setFormErrors({
        general: `${provider}登录失败，请重试`
      });
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    navigate(ROUTES.FORGOT_PASSWORD);
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md" variant="default">
        <Card.Body className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              欢迎回来
            </h1>
            <p className="text-sm text-gray-600">
              登录您的技能集市账户，开启自由职业之旅
            </p>
          </div>

          {/* General Error */}
          {formErrors.general && (
            <div className="mb-6">
              <FormError error={formErrors.general} onDismiss={() => setFormErrors({})} />
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <FormInput
              id="email"
              type="email"
              label="邮箱地址"
              placeholder="请输入您的邮箱地址"
              value={loginForm.email}
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

            {/* Password Field */}
            <div className="space-y-2">
              <PasswordInput
                id="password"
                label="密码"
                placeholder="请输入您的密码"
                value={loginForm.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={formErrors.password}
                required
                leftIcon={
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={loginForm.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600">记住我</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                忘记密码？
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              fullWidth
              size="lg"
              className="py-3"
            >
              {isSubmitting ? '登录中...' : '登录'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">或使用以下方式登录</span>
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

          {/* Register Link */}
          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              还没有账号？{' '}
              <Link
                to={ROUTES.REGISTER}
                className="font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                立即注册
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;