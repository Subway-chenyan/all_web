import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { cn } from '@/utils';

interface MainLayoutProps {
  children?: React.ReactNode;
  showFooter?: boolean;
  showSidebar?: boolean;
  sidebarCollapsible?: boolean;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showFooter = true,
  showSidebar = true,
  sidebarCollapsible = true,
  className
}) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading states for route transitions
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Simulate loading delay

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Generate breadcrumbs based on current route
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: '首页', href: '/' }
    ];

    let currentPath = '';
    const pathNames: Record<string, string> = {
      'dashboard': '控制面板',
      'services': '服务',
      'orders': '订单',
      'messages': '消息',
      'profile': '个人资料',
      'settings': '设置',
      'wallet': '钱包',
      'favorites': '收藏夹',
      'analytics': '数据分析',
      'help': '帮助中心',
      'about': '关于我们',
      'contact': '联系我们',
      'become-seller': '成为卖家',
      'my-services': '我的服务',
      'create': '发布服务',
      'edit': '编辑服务',
    };

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      let label = pathNames[segment] || segment;

      // Handle ID segments (e.g., /services/123)
      if (/^\d+$/.test(segment)) {
        label = `详情 #${segment}`;
      }

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        active: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Error boundary fallback
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">出现了一些问题</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            重新加载页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-gray-50 flex flex-col', className)}>
      {/* Header */}
      <Header onMenuClick={handleMobileMenuClick} />

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Sidebar - Desktop */}
        {showSidebar && (
          <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0">
              <Sidebar
                isCollapsed={sidebarCollapsible ? sidebarCollapsed : false}
                onToggleCollapse={sidebarCollapsible ? handleSidebarToggle : undefined}
              />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                  onClick={handleSidebarClose}
                />
                <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
                  <Sidebar
                    isMobile={true}
                    onClose={handleSidebarClose}
                  />
                </div>
              </>
            )}
          </>
        )}

        {/* Main Content Area */}
        <main className={cn(
          'flex-1 overflow-auto transition-all duration-300',
          showSidebar && !sidebarCollapsed && 'lg:ml-0',
          showSidebar && sidebarCollapsed && 'lg:ml-0'
        )}>
          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 1 && (
            <div className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm">
                    {breadcrumbs.map((item, index) => (
                      <li key={index} className="flex items-center">
                        {index > 0 && (
                          <svg
                            className="flex-shrink-0 h-5 w-5 text-gray-300 mx-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {item.active ? (
                          <span className="text-gray-700 font-medium" aria-current="page">
                            {item.label}
                          </span>
                        ) : item.href ? (
                          <a
                            href={item.href}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <span className="text-gray-500">{item.label}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 mx-4 sm:mx-6 lg:mx-8 mt-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 mx-4 sm:mx-6 lg:mx-8"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 mx-4 sm:mx-6 lg:mx-8"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 mx-4 sm:mx-6 lg:mx-8"></div>
              <div className="h-64 bg-gray-200 rounded mx-4 sm:mx-6 lg:mx-8"></div>
            </div>
          )}

          {/* Page Content */}
          {!isLoading && (
            <div className="flex-1">
              {/* Optional Page Header */}
              {(location.pathname !== '/' && breadcrumbs.length > 1) && (
                <div className="bg-white shadow-sm border-b border-gray-200">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                          {breadcrumbs[breadcrumbs.length - 1].label}
                        </h1>
                        {breadcrumbs.length > 2 && (
                          <p className="mt-1 text-sm text-gray-500">
                            {breadcrumbs.slice(1, -1).map(item => item.label).join(' > ')}
                          </p>
                        )}
                      </div>

                      {/* Page Actions */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => window.history.back()}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          返回
                        </button>
                        <button
                          onClick={() => window.location.reload()}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          刷新
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Wrapper */}
              <div className={cn(
                'py-6',
                (location.pathname === '/' || breadcrumbs.length <= 1) && 'py-0'
              )}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {children || <Outlet />}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      {showFooter && !isLoading && <Footer />}
    </div>
  );
};