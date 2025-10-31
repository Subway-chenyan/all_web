import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { User, LoginCredentials, RegisterData, SocialAuthData } from '@/types';
import { ROUTES } from '@/constants';

// Main authentication hook
export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    // State
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    refreshToken,
    error,
    socialLoginLoading,
    loginForm,
    registerForm,
    forgotPasswordEmail,
    resetPasswordToken,

    // Actions
    login,
    register,
    logout,
    setTokens,
    refreshAccessToken,
    clearTokens,
    socialLogin,
    setUser,
    updateUser,
    updateLoginForm,
    updateRegisterForm,
    resetForms,
    requestPasswordReset,
    resetPassword,
    setError,
    clearError,
    setLoading,
    setSocialLoginLoading,
    initializeAuth,
    checkAuthStatus,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Auto-refresh token periodically
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const refreshInterval = setInterval(() => {
      refreshAccessToken();
    }, 14 * 60 * 1000); // Refresh every 14 minutes (token expires in 15 minutes)

    return () => clearInterval(refreshInterval);
  }, [accessToken, refreshToken, refreshAccessToken]);

  // Redirect logic
  const requireAuth = useCallback((redirectTo = ROUTES.LOGIN) => {
    if (!isAuthenticated && !isLoading) {
      navigate(redirectTo, { state: { from: location } });
      return false;
    }
    return true;
  }, [isAuthenticated, isLoading, navigate, location]);

  const requireGuest = useCallback((redirectTo = ROUTES.DASHBOARD) => {
    if (isAuthenticated && !isLoading) {
      navigate(redirectTo);
      return false;
    }
    return true;
  }, [isAuthenticated, isLoading, navigate]);

  const requireRole = useCallback((requiredRole: 'client' | 'freelancer' | 'admin') => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location } });
      return false;
    }

    if (user?.userType !== requiredRole && user?.userType !== 'admin') {
      navigate(ROUTES.DASHBOARD);
      return false;
    }

    return true;
  }, [isAuthenticated, user, navigate, location]);

  // Check if user has specific permissions
  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    if (user.userType === 'admin') return true;

    switch (permission) {
      case 'create_service':
        return user.userType === 'freelancer';
      case 'manage_orders':
        return true; // Both clients and freelancers can manage orders
      case 'view_analytics':
        return user.userType === 'freelancer';
      case 'manage_users':
        return user.userType === 'admin';
      case 'access_admin_panel':
        return user.userType === 'admin';
      default:
        return false;
    }
  }, [user]);

  // Get display name
  const getDisplayName = useCallback(() => {
    if (!user) return '';
    return user.profile?.displayName || `${user.firstName} ${user.lastName}`;
  }, [user]);

  // Get avatar URL
  const getAvatarUrl = useCallback(() => {
    if (!user) return '';
    return user.profile?.avatar || user.avatar || '';
  }, [user]);

  // Check if profile is complete
  const isProfileComplete = useCallback(() => {
    if (!user) return false;
    const profile = user.profile;
    return !!(
      profile?.displayName &&
      profile?.bio &&
      profile?.skills &&
      profile?.skills.length > 0
    );
  }, [user]);

  // Memoized login function with error handling
  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '登录失败'
      };
    }
  }, [login]);

  // Memoized register function with error handling
  const handleRegister = useCallback(async (data: RegisterData) => {
    try {
      await register(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '注册失败'
      };
    }
  }, [register]);

  // Memoized social login function
  const handleSocialLogin = useCallback(async (provider: 'wechat' | 'qq' | 'alipay', data: SocialAuthData) => {
    try {
      await socialLogin(provider, data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : `${provider}登录失败`
      };
    }
  }, [socialLogin]);

  // Memoized password reset request
  const handlePasswordResetRequest = useCallback(async (email: string) => {
    try {
      await requestPasswordReset(email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '发送重置邮件失败'
      };
    }
  }, [requestPasswordReset]);

  // Memoized password reset confirmation
  const handlePasswordReset = useCallback(async (token: string, newPassword: string) => {
    try {
      await resetPassword(token, newPassword);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '密码重置失败'
      };
    }
  }, [resetPassword]);

  // Memoized logout function
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  // Memoized auth status check
  const checkAuth = useCallback(async () => {
    return await checkAuthStatus();
  }, [checkAuthStatus]);

  // Computed properties
  const isClient = user?.userType === 'client';
  const isFreelancer = user?.userType === 'freelancer';
  const isAdmin = user?.userType === 'admin';
  const isVerified = user?.isVerified || false;
  const isActive = user?.isActive || false;

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    refreshToken,
    error,
    socialLoginLoading,
    loginForm,
    registerForm,
    forgotPasswordEmail,
    resetPasswordToken,

    // Computed properties
    isClient,
    isFreelancer,
    isAdmin,
    isVerified,
    isActive,

    // Actions
    login: handleLogin,
    register: handleRegister,
    socialLogin: handleSocialLogin,
    logout: handleLogout,
    passwordResetRequest: handlePasswordResetRequest,
    resetPassword: handlePasswordReset,

    // Form actions
    updateLoginForm,
    updateRegisterForm,
    resetForms,

    // User management
    setUser,
    updateUser,

    // Error handling
    setError,
    clearError,

    // Loading control
    setLoading,
    setSocialLoginLoading,

    // Auth utilities
    checkAuth,
    refreshAccessToken,
    requireAuth,
    requireGuest,
    requireRole,
    hasPermission,
    getDisplayName,
    getAvatarUrl,
    isProfileComplete,
  };
}

// Hook for authentication guards
export const useAuthGuard = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return {
    canAccess: isAuthenticated && !isLoading,
    isLoading,
    user,
    requireAuth: () => {
      if (!isAuthenticated && !isLoading) {
        window.location.href = '/login';
      }
    },
    requireRole: (requiredRole: 'client' | 'freelancer' | 'admin') => {
      if (!isAuthenticated || !user) return false;
      return user.userType === requiredRole;
    },
    requireVerification: () => {
      return isAuthenticated && user?.isVerified;
    },
    requireActive: () => {
      return isAuthenticated && user?.isActive;
    },
  };
}

// Hook for social login state management
export const useSocialLogin = () => {
  const { socialLoginLoading, setSocialLoginLoading, socialLogin } = useAuth();

  const initiateSocialLogin = useCallback(async (provider: 'wechat' | 'qq' | 'alipay') => {
    setSocialLoginLoading(provider, true);

    // For OAuth providers, redirect to the provider's authorization URL
    const authUrls = {
      wechat: '/api/auth/wechat/',
      qq: '/api/auth/qq/',
      alipay: '/api/auth/alipay/',
    };

    try {
      // Store the current URL for redirect after login
      sessionStorage.setItem('auth_redirect_url', window.location.pathname);

      // Redirect to the provider's authorization endpoint
      window.location.href = authUrls[provider];
    } catch (error) {
      setSocialLoginLoading(provider, false);
      console.error(`${provider} login failed:`, error);
    }
  }, [setSocialLoginLoading]);

  const handleSocialCallback = useCallback(async (provider: 'wechat' | 'qq' | 'alipay', data: SocialAuthData) => {
    try {
      await socialLogin(provider, data);

      // Redirect to stored URL or dashboard
      const redirectUrl = sessionStorage.getItem('auth_redirect_url') || '/dashboard';
      sessionStorage.removeItem('auth_redirect_url');
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(`${provider} callback failed:`, error);
    }
  }, [socialLogin]);

  return {
    socialLoginLoading,
    initiateSocialLogin,
    handleSocialCallback,
  };
}

// Hook for form validation
export const useAuthFormValidation = () => {
  const { loginForm, registerForm, updateLoginForm, updateRegisterForm } = useAuthStore();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; strength: 'weak' | 'medium' | 'strong' } => {
    if (password.length < 8) {
      return { isValid: false, strength: 'weak' };
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { isValid: true, strength: 'weak' };
    if (score <= 4) return { isValid: true, strength: 'medium' };
    return { isValid: true, strength: 'strong' };
  };

  const validateLoginForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!loginForm.email) {
      errors.email = '请输入邮箱地址';
    } else if (!validateEmail(loginForm.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    if (!loginForm.password) {
      errors.password = '请输入密码';
    } else if (loginForm.password.length < 8) {
      errors.password = '密码至少需要8个字符';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const validateRegisterForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!registerForm.email) {
      errors.email = '请输入邮箱地址';
    } else if (!validateEmail(registerForm.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    // Password validation
    if (!registerForm.password) {
      errors.password = '请输入密码';
    } else {
      const passwordValidation = validatePassword(registerForm.password);
      if (!passwordValidation.isValid) {
        errors.password = '密码至少需要8个字符';
      }
    }

    // Confirm password validation
    if (!registerForm.confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    // Username validation
    if (!registerForm.username) {
      errors.username = '请输入用户名';
    } else if (registerForm.username.length < 3) {
      errors.username = '用户名至少需要3个字符';
    } else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.username)) {
      errors.username = '用户名只能包含字母、数字和下划线';
    }

    // Name validation
    if (!registerForm.firstName) {
      errors.firstName = '请输入姓氏';
    }

    if (!registerForm.lastName) {
      errors.lastName = '请输入名字';
    }

    // Terms validation
    if (!registerForm.agreeToTerms) {
      errors.agreeToTerms = '请同意服务条款和隐私政策';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  return {
    validateEmail,
    validatePassword,
    validateLoginForm,
    validateRegisterForm,
    loginForm,
    registerForm,
    updateLoginForm,
    updateRegisterForm,
  };
}