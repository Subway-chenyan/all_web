import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-300">404</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              页面未找到
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              抱歉，您访问的页面不存在或已被移动。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回上一页
            </button>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              您可能在寻找：
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/services"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                浏览服务
              </Link>
              <Link
                to="/categories"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                服务分类
              </Link>
              <Link
                to="/become-seller"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                成为卖家
              </Link>
              <Link
                to="/help"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                帮助中心
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFoundPage;