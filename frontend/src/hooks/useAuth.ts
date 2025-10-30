import { useEffect } from 'react';
import { useAuthStore } from '@/store';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    checkAuth,
  } = useAuthStore();

  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect logic
  const requireAuth = (redirectTo = ROUTES.LOGIN) => {
    if (!isAuthenticated && !isLoading) {
      navigate(redirectTo, { state: { from: location } });
      return false;
    }
    return true;
  };

  const requireGuest = (redirectTo = ROUTES.DASHBOARD) => {
    if (isAuthenticated && !isLoading) {
      navigate(redirectTo);
      return false;
    }
    return true;
  };

  const requireRole = (requiredRole: 'client' | 'freelancer' | 'admin') => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location } });
      return false;
    }

    if (user?.userType !== requiredRole && user?.userType !== 'admin') {
      navigate(ROUTES.DASHBOARD);
      return false;
    }

    return true;
  };

  // Check if user has specific permissions
  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.userType === 'admin') return true;

    // Add role-based permission logic here
    // For now, basic checks
    switch (permission) {
      case 'create_service':
        return user.userType === 'freelancer';
      case 'manage_orders':
        return true; // Both clients and freelancers can manage orders
      case 'view_analytics':
        return user.userType === 'freelancer';
      default:
        return false;
    }
  };

  // Get display name
  const getDisplayName = () => {
    if (!user) return '';
    return user.profile?.displayName || `${user.firstName} ${user.lastName}`;
  };

  // Get avatar URL
  const getAvatarUrl = () => {
    if (!user) return '';
    return user.profile?.avatar || user.avatar || '';
  };

  // Check if profile is complete
  const isProfileComplete = () => {
    if (!user) return false;
    const profile = user.profile;
    return !!(
      profile?.displayName &&
      profile?.bio &&
      profile?.skills &&
      profile?.skills.length > 0
    );
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    checkAuth,
    requireAuth,
    requireGuest,
    requireRole,
    hasPermission,
    getDisplayName,
    getAvatarUrl,
    isProfileComplete,
  };
}