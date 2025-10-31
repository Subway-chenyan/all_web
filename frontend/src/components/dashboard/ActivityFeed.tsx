import React from 'react';
import { User, ShoppingCart, Star, MessageSquare, DollarSign, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';

export interface ActivityItem {
  id: string;
  type: 'order' | 'review' | 'message' | 'payment' | 'service' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  actor?: {
    name: string;
    avatar?: string;
    id: string;
  };
  metadata?: {
    orderId?: string;
    serviceId?: string;
    amount?: number;
    rating?: number;
  };
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  maxItems?: number;
  showTimestamp?: boolean;
  showActor?: boolean;
  className?: string;
  onActivityClick?: (activity: ActivityItem) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = '活动动态',
  maxItems = 10,
  showTimestamp = true,
  showActor = true,
  className = '',
  onActivityClick,
  loading = false,
  emptyMessage = '暂无活动记录',
}) => {
  const getActivityInfo = (type: string) => {
    switch (type) {
      case 'order':
        return {
          icon: ShoppingCart,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          label: '订单',
        };
      case 'review':
        return {
          icon: Star,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          label: '评价',
        };
      case 'message':
        return {
          icon: MessageSquare,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          label: '消息',
        };
      case 'payment':
        return {
          icon: DollarSign,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          label: '支付',
        };
      case 'service':
        return {
          icon: Package,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          label: '服务',
        };
      case 'system':
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          label: '系统',
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          label: '其他',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
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
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-chinese">
        {title}
      </h3>

      <div className="space-y-1">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          activities.slice(0, maxItems).map((activity) => {
            const activityInfo = getActivityInfo(activity.type);
            const Icon = activityInfo.icon;

            return (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200',
                  'hover:bg-gray-50',
                  activity.priority === 'high' && 'border-l-4 border-red-500',
                  activity.priority === 'medium' && 'border-l-4 border-yellow-500'
                )}
                onClick={() => onActivityClick?.(activity)}
              >
                {/* Activity Icon */}
                <div className={cn('p-2 rounded-lg', activityInfo.bgColor)}>
                  <Icon className={cn('w-4 h-4', activityInfo.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 leading-chinese">
                      {activity.title}
                    </h4>
                    {showTimestamp && (
                      <span className="text-xs text-gray-500">
                        {formatTime(activity.timestamp)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2 leading-chinese">
                    {activity.description}
                  </p>

                  {/* Actor Info */}
                  {showActor && activity.actor && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                        {activity.actor.avatar ? (
                          <img
                            src={activity.actor.avatar}
                            alt={activity.actor.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                      </div>
                      <span>{activity.actor.name}</span>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    {activity.metadata?.orderId && (
                      <span>订单: #{activity.metadata.orderId}</span>
                    )}
                    {activity.metadata?.serviceId && (
                      <span>服务: #{activity.metadata.serviceId}</span>
                    )}
                    {activity.metadata?.amount && (
                      <span className="font-medium text-green-600">
                        {formatCurrency(activity.metadata.amount)}
                      </span>
                    )}
                    {activity.metadata?.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{activity.metadata.rating}.0</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activities.length > maxItems && (
        <div className="mt-4 text-center">
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
            查看全部活动
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;