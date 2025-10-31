import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { ROUTES } from '@/constants';
import { cn } from '@/utils';
import Button from '@/components/ui/Button';

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | string;
  requiresAuth?: boolean;
  userType?: 'freelancer' | 'client' | 'both';
  submenu?: NavItem[];
  external?: boolean;
}

interface QuickAction {
  name: string;
  href: string;
  icon: string;
  color: string;
  requiresAuth?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onClose,
  isMobile = false,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [userStats, setUserStats] = useState({
    unreadMessages: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeServices: 0
  });

  // Enhanced navigation with better categorization
  const mainNavigation: NavItem[] = [
    {
      name: t('navigation.dashboard') || '控制面板',
      href: ROUTES.DASHBOARD,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      requiresAuth: true,
    },
    {
      name: '我的服务',
      href: '/my-services',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      requiresAuth: true,
      userType: 'freelancer',
      badge: userStats.activeServices,
      submenu: [
        { name: '发布新服务', href: '/services/create', icon: '➕' },
        { name: '草稿箱', href: '/my-services/drafts', icon: '📝' },
        { name: '已暂停', href: '/my-services/paused', icon: '⏸️' },
        { name: '已拒绝', href: '/my-services/rejected', icon: '❌' },
      ]
    },
    {
      name: t('orders.title') || '订单管理',
      href: ROUTES.ORDERS,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      requiresAuth: true,
      badge: userStats.pendingOrders,
      submenu: [
        { name: '进行中', href: '/orders/active', icon: '🔄' },
        { name: '待处理', href: '/orders/pending', icon: '⏳' },
        { name: '已完成', href: '/orders/completed', icon: '✅' },
        { name: '已取消', href: '/orders/cancelled', icon: '🚫' },
      ]
    },
    {
      name: t('messages.title') || '消息',
      href: ROUTES.MESSAGES,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      requiresAuth: true,
      badge: userStats.unreadMessages,
    },
    {
      name: '钱包',
      href: '/wallet',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      requiresAuth: true,
      submenu: [
        { name: '余额', href: '/wallet/balance', icon: '💰' },
        { name: '收入记录', href: '/wallet/earnings', icon: '📈' },
        { name: '提现', href: '/wallet/withdraw', icon: '💸' },
        { name: '账单明细', href: '/wallet/transactions', icon: '📋' },
      ]
    },
    {
      name: '收藏夹',
      href: '/favorites',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      requiresAuth: true,
    },
  ];

  const profileNavigation: NavItem[] = [
    {
      name: t('profile.title') || '个人资料',
      href: ROUTES.PROFILE,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      requiresAuth: true,
    },
    {
      name: '评价管理',
      href: '/my-reviews',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      requiresAuth: true,
    },
    {
      name: '数据分析',
      href: '/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      requiresAuth: true,
      userType: 'freelancer',
    },
    {
      name: t('common.settings') || '设置',
      href: ROUTES.SETTINGS,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      requiresAuth: true,
    },
  ];

  const publicNavigation: NavItem[] = [
    {
      name: '浏览服务',
      href: ROUTES.SERVICES,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      name: '服务分类',
      href: '/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: t('navigation.about') || '关于我们',
      href: ROUTES.ABOUT,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: t('navigation.help') || '帮助中心',
      href: '/help',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Quick actions for authenticated users
  const quickActions: QuickAction[] = [
    {
      name: '发布服务',
      href: '/services/create',
      icon: '➕',
      color: 'bg-green-500 hover:bg-green-600',
      requiresAuth: true,
    },
    {
      name: '查找工作',
      href: '/jobs',
      icon: '🔍',
      color: 'bg-blue-500 hover:bg-blue-600',
      requiresAuth: true,
    },
    {
      name: '在线客服',
      href: '/support/chat',
      icon: '💬',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      name: '成为卖家',
      href: '/become-seller',
      icon: '🚀',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  // Filter navigation based on authentication and user type
  const filterNavigation = (items: NavItem[]) => {
    return items.filter(item => {
      if (item.requiresAuth && !isAuthenticated) return false;
      if (item.userType && item.userType !== 'both' && user?.userType !== item.userType) return false;
      return true;
    });
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const toggleSubmenu = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  // Mock loading user stats
  useEffect(() => {
    if (isAuthenticated) {
      setUserStats({
        unreadMessages: 5,
        pendingOrders: 3,
        totalRevenue: 12580,
        activeServices: 12
      });
    }
  }, [isAuthenticated]);

  const handleQuickAction = (action: QuickAction) => {
    if (action.external) {
      window.open(action.href, '_blank');
    } else {
      navigate(action.href);
      if (isMobile && onClose) {
        onClose();
      }
    }
  };

  // Render navigation item with submenu support
  const renderNavItem = (item: NavItem, level = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const isItemActive = isActive(item.href);

    return (
      <div key={item.name}>
        <button
          onClick={() => hasSubmenu ? toggleSubmenu(item.name) : navigate(item.href)}
          className={cn(
            'w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            level > 0 && 'pl-10',
            isItemActive
              ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            isCollapsed && !isMobile && 'justify-center px-2'
          )}
        >
          <div className="flex items-center space-x-3">
            <span className={cn(
              'flex-shrink-0',
              isItemActive && 'text-red-500'
            )}>
              {item.icon}
            </span>
            {(!isCollapsed || isMobile) && (
              <span className="truncate">{item.name}</span>
            )}
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center space-x-2">
              {item.badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                  {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              {hasSubmenu && (
                <svg
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          )}
        </button>

        {hasSubmenu && isExpanded && (!isCollapsed || isMobile) && (
          <div className="mt-1 space-y-1">
            {item.submenu?.map((subItem) => (
              <button
                key={subItem.name}
                onClick={() => navigate(subItem.href)}
                className={cn(
                  'w-full group flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200',
                  isActive(subItem.href)
                    ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                  isCollapsed && !isMobile && 'justify-center px-2'
                )}
              >
                <span className="mr-3">{subItem.icon}</span>
                {(!isCollapsed || isMobile) && (
                  <span className="truncate">{subItem.name}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
      isCollapsed && !isMobile ? 'w-16' : 'w-64',
      isMobile && 'fixed inset-y-0 left-0 z-50 w-72 max-w-full',
      isMobile && onClose && 'transform transition-transform duration-300',
      isMobile && !onClose && 'translate-x-0'
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed || isMobile ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              技
            </div>
            <span className="text-lg font-bold text-gray-900">技能集市</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto">
            技
          </div>
        )}

        {/* Close button for mobile or collapse toggle for desktop */}
        {isMobile ? (
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : !isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg
              className={cn(
                'w-5 h-5 transition-transform duration-200',
                isCollapsed && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* User Profile Section */}
      {isAuthenticated && user && (!isCollapsed || isMobile) && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                src={user.profile?.avatar || user.avatar || 'https://via.placeholder.com/40x40'}
                alt={user.profile?.displayName || `${user.firstName} ${user.lastName}`}
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.profile?.displayName || `${user.firstName} ${user.lastName}`}
                </p>
                <p className="text-xs text-gray-500">
                  {user.userType === 'freelancer' ? '服务提供者' : '客户'}
                </p>
                {userStats.totalRevenue > 0 && user.userType === 'freelancer' && (
                  <p className="text-xs text-green-600 font-medium">
                    ¥{userStats.totalRevenue.toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {isAuthenticated && (!isCollapsed || isMobile) && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            快速操作
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions
              .filter(action => !action.requiresAuth || isAuthenticated)
              .slice(0, isCollapsed && !isMobile ? 2 : 4)
              .map((action) => (
                <button
                  key={action.name}
                  onClick={() => handleQuickAction(action)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg text-white text-xs font-medium transition-all duration-200 transform hover:scale-105',
                    action.color,
                    isCollapsed && !isMobile && 'p-2'
                  )}
                >
                  <span className={cn(
                    'text-lg mb-1',
                    isCollapsed && !isMobile && 'text-sm mb-0'
                  )}>
                    {action.icon}
                  </span>
                  {(!isCollapsed || isMobile) && (
                    <span className="text-center leading-tight">{action.name}</span>
                  )}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {isAuthenticated ? (
            <>
              {/* Main Navigation */}
              {filterNavigation(mainNavigation).map(item => renderNavItem(item))}

              {/* Profile Section */}
              {filterNavigation(profileNavigation).length > 0 && (
                <>
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <h3 className={cn(
                      'px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3',
                      isCollapsed && !isMobile && 'hidden'
                    )}>
                      个人中心
                    </h3>
                    {filterNavigation(profileNavigation).map(item => renderNavItem(item))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Public Navigation */}
              <h3 className={cn(
                'px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3',
                isCollapsed && !isMobile && 'hidden'
              )}>
                浏览
              </h3>
              {filterNavigation(publicNavigation).map(item => renderNavItem(item))}
            </>
          )}

          {/* Auth Section for non-authenticated users */}
          {!isAuthenticated && (!isCollapsed || isMobile) && (
            <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() => {
                  navigate('/auth/login');
                  if (isMobile && onClose) onClose();
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t('auth.login')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
                onClick={() => {
                  navigate('/auth/register');
                  if (isMobile && onClose) onClose();
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {t('auth.register')}
              </Button>
            </div>
          )}
        </nav>
      </div>

      {/* Sidebar Footer */}
      {(!isCollapsed || isMobile) && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>v2.1.0</span>
            <div className="flex items-center space-x-2">
              <button
                className="hover:text-gray-700 transition-colors"
                title="检查更新"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                className="hover:text-gray-700 transition-colors"
                title="反馈建议"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};