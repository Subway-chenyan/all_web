import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="flex justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">技能集市</h1>
            <p className="mt-2 text-sm text-gray-600">中文技能服务与交易平台</p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          <a href="/terms" className="hover:text-gray-700">服务条款</a>
          {' · '}
          <a href="/privacy" className="hover:text-gray-700">隐私政策</a>
          {' · '}
          <a href="/help" className="hover:text-gray-700">帮助中心</a>
        </p>
        <p className="mt-2 text-xs text-gray-400">
          © 2024 技能集市. 保留所有权利.
        </p>
      </div>
    </div>
  );
};