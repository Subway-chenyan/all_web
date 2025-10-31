import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from './auth';
import { useAuth, useAuthGuard } from '@/hooks/useAuth';
import { ROUTES } from '@/constants';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: 'client' | 'freelancer' | 'admin';
  requireVerification?: boolean;
  requireActive?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = ROUTES.LOGIN,
  requiredRole,
  requireVerification = false,
  requireActive = false,
  fallback,
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { canAccess, requireRole, requireVerification: checkVerification, requireActive: checkActive } = useAuthGuard();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" text="验证身份中..." />
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role requirements
  if (requiredRole && !requireRole(requiredRole)) {
    return (
      <Navigate
        to={ROUTES.DASHBOARD}
        replace
      />
    );
  }

  // Check verification requirements
  if (requireVerification && !checkVerification()) {
    return (
      <Navigate
        to={ROUTES.VERIFY_EMAIL}
        replace
      />
    );
  }

  // Check active status requirements
  if (requireActive && !checkActive()) {
    return (
      <Navigate
        to={ROUTES.DASHBOARD}
        replace
      />
    );
  }

  // User is authenticated and meets all requirements
  return <>{children}</>;
};

export default ProtectedRoute;