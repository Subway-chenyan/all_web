import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils';

interface AuthLayoutProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBranding?: boolean;
  backgroundImage?: string;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBranding = true,
  backgroundImage,
  className
}) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Page titles based on route
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.includes('/login')) {
      return {
        title: '欢迎回来',
        subtitle: '登录您的技能集市账户，开启自由职业之旅'
      };
    }
    if (path.includes('/register')) {
      return {
        title: '创建账户',
        subtitle: '加入技能集市，让您的技能发挥价值'
      };
    }
    if (path.includes('/forgot-password')) {
      return {
        title: '重置密码',
        subtitle: '输入您的邮箱地址，我们将发送重置链接'
      };
    }
    if (path.includes('/reset-password')) {
      return {
        title: '设置新密码',
        subtitle: '请输入您的新密码'
      };
    }
    return {
      title: title || '技能集市',
      subtitle: subtitle || '中文技能服务与交易平台'
    };
  };

  const pageInfo = getPageInfo();

  // Social login options
  const socialProviders = [
    {
      name: '微信',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
      url: '#'
    },
    {
      name: 'QQ',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      ),
      color: 'bg-blue-500 hover:bg-blue-600',
      url: '#'
    },
    {
      name: '支付宝',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700',
      url: '#'
    },
  ];

  // Features list for the side panel
  const features = [
    {
      icon: '🎯',
      title: '精准匹配',
      description: '智能算法为您匹配最适合的技能服务需求'
    },
    {
      icon: '🛡️',
      title: '安全保障',
      description: '平台担保交易，保障买卖双方权益'
    },
    {
      icon: '⭐',
      title: '优质服务',
      description: '严格的服务提供者筛选，确保服务质量'
    },
    {
      icon: '🚀',
      title: '快速成长',
      description: '完善的评价体系，助力技能提升和收入增长'
    },
  ];

  // Handle social login
  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    // Mock social login process
    setTimeout(() => {
      setIsLoading(false);
      console.log(`Login with ${provider}`);
    }, 1000);
  };

  return (
    <div className={cn(
      'min-h-screen bg-gray-50 flex flex-col lg:flex-row',
      className
    )}>
      {/* Left/Top Section - Branding & Features */}
      <div className="lg:w-1/2 bg-gradient-to-br from-red-500 to-red-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
          <div className="absolute top-20 right-0 w-32 h-32 bg-white rounded-full translate-x-16"></div>
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white rounded-full translate-y-24"></div>
          <div className="absolute bottom-20 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full p-8 lg:p-12">
          {showBranding && (
            <div className="mb-12">
              <Link to="/" className="inline-flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-white text-red-500 rounded-xl flex items-center justify-center text-2xl font-bold">
                  技
                </div>
                <span className="text-2xl font-bold">技能集市</span>
              </Link>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {pageInfo.title}
              </h1>
              <p className="text-lg text-red-100 mb-8 leading-relaxed">
                {pageInfo.subtitle}
              </p>
            </div>
          )}

          {/* Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                  <p className="text-red-100 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm text-red-100">服务提供者</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">200K+</div>
              <div className="text-sm text-red-100">完成订单</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-red-100">平均评分</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right/Bottom Section - Auth Form */}
      <div className="lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Branding (hidden on desktop) */}
          {showBranding && (
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                  技
                </div>
                <span className="text-2xl font-bold text-gray-900">技能集市</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageInfo.title}</h1>
              <p className="text-gray-600 text-sm">{pageInfo.subtitle}</p>
            </div>
          )}

          {/* Auth Form Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            {/* Form Header */}
            {!showBranding && (
              <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageInfo.title}</h1>
                <p className="text-gray-600 text-sm">{pageInfo.subtitle}</p>
              </div>
            )}

            {/* Form Content */}
            <div className={cn(
              'px-8 py-6',
              showBranding && 'px-8 pt-0'
            )}>
              {children || <Outlet />}

              {/* Social Login Divider */}
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
                {socialProviders.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => handleSocialLogin(provider.name)}
                    disabled={isLoading}
                    className={cn(
                      'flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105',
                      provider.color,
                      isLoading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {provider.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <Link to="/terms" className="hover:text-red-500 transition-colors">
                服务条款
              </Link>
              <span>·</span>
              <Link to="/privacy" className="hover:text-red-500 transition-colors">
                隐私政策
              </Link>
              <span>·</span>
              <Link to="/help" className="hover:text-red-500 transition-colors">
                帮助中心
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>© 2024 技能集市. 保留所有权利.</span>
              <Link to="/licenses" className="hover:text-gray-700 transition-colors">
                开源许可
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center space-x-4 pt-4">
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                安全加密
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                官方认证
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                优质服务
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            <span className="text-gray-700">登录中...</span>
          </div>
        </div>
      )}
    </div>
  );
};