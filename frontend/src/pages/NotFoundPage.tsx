import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="text-6xl font-bold text-gray-900 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">页面未找到</h1>
        <p className="text-gray-600 mb-8">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <div className="space-y-4">
          <Link
            to={ROUTES.HOME}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700"
          >
            返回首页
          </Link>
          <div className="text-sm text-gray-500">
            或者{' '}
            <Link to={ROUTES.SERVICES} className="text-blue-600 hover:text-blue-800">
              浏览我们的服务
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};