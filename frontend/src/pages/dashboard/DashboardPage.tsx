import React from 'react';
import FreelancerDashboard from './FreelancerDashboard';
import ClientDashboard from './ClientDashboard';

// Mock user role - in a real app, this would come from authentication context
const userRole = 'freelancer'; // 'freelancer' | 'client' | 'admin'

export const DashboardPage: React.FC = () => {
  // In a real implementation, you would:
  // 1. Get user role from authentication context
  // 2. Load user-specific data based on role
  // 3. Handle loading states and error states

  switch (userRole) {
    case 'freelancer':
      return <FreelancerDashboard />;
    case 'client':
      return <ClientDashboard />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              仪表板
            </h2>
            <p className="text-gray-600">
              无法确定用户角色，请重新登录。
            </p>
          </div>
        </div>
      );
  }
};