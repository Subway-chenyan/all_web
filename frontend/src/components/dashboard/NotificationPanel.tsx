import React, { useState } from 'react';
import { Bell, X, Check, Settings, Info, AlertTriangle, CheckCircle, MessageCircle } from 'lucide-react';
import { cn } from '@/utils';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
  metadata?: {
    orderId?: string;
    serviceId?: string;
    userId?: string;
  };
}

export interface NotificationPanelProps {
  notifications: Notification[];
  title?: string;
  maxItems?: number;
  showActions?: boolean;
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  loading?: boolean;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  title = '通知中心',
  maxItems = 10,
  showActions = true,
  className = '',
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  loading = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationInfo = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'error':
        return {
          icon: X,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'message':
        return {
          icon: MessageCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      default:
        return {
          icon: Info,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return timestamp.toLocaleDateString('zh-CN');
  };

  const filteredNotifications = notifications.filter(notification =>
    filter === 'all' || !notification.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead?.(notification.id);
    }
    onNotificationClick?.(notification);
  };

  const handleActionClick = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.action?.onClick) {
      notification.action.onClick();
    } else if (notification.action?.url) {
      window.location.href = notification.action.url;
    }
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 leading-chinese">
              {title}
            </h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showActions && (
              <>
                <button
                  onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100"
                >
                  {filter === 'all' ? '仅未读' : '全部'}
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50"
                  >
                    全部已读
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50"
                  >
                    清空
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>
              {filter === 'unread' ? '暂无未读通知' : '暂无通知'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.slice(0, maxItems).map((notification) => {
              const notificationInfo = getNotificationInfo(notification.type);
              const Icon = notificationInfo.icon;

              return (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 cursor-pointer transition-all duration-200',
                    notification.read
                      ? 'bg-white hover:bg-gray-50'
                      : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      notification.read ? notificationInfo.bgColor : 'bg-blue-100'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        notification.read ? notificationInfo.color : 'text-blue-600'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 leading-chinese">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 leading-chinese">
                        {notification.message}
                      </p>

                      {notification.action && (
                        <button
                          onClick={(e) => handleActionClick(notification, e)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {notification.action.label}
                        </button>
                      )}

                      {/* Metadata */}
                      {notification.metadata && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          {notification.metadata.orderId && (
                            <span>订单: #{notification.metadata.orderId}</span>
                          )}
                          {notification.metadata.serviceId && (
                            <span>服务: #{notification.metadata.serviceId}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead?.(notification.id);
                      }}
                      className={cn(
                        'p-1 rounded transition-colors duration-200',
                        notification.read
                          ? 'text-gray-400 hover:text-gray-600'
                          : 'text-blue-500 hover:text-blue-700'
                      )}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filteredNotifications.length > maxItems && (
        <div className="p-4 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            查看全部通知
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;