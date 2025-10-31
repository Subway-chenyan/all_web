import React from 'react';
import { User, ShoppingCart, Star, MessageSquare, DollarSign, Package, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/utils';

export interface RecentActivityItem {
  id: string;
  type: 'order' | 'review' | 'message' | 'payment' | 'service_update' | 'milestone';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
    id: string;
  };
  status?: 'completed' | 'pending' | 'in_progress' | 'cancelled';
  amount?: number;
  rating?: number;
  metadata?: {
    orderId?: string;
    serviceId?: string;
    quantity?: number;
  };
}

export interface RecentActivityProps {
  activities: RecentActivityItem[];
  title?: string;
  maxItems?: number;
  showUsers?: boolean;
  showStatus?: boolean;
  className?: string;
  onActivityClick?: (activity: RecentActivityItem) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  title = '最近活动',
  maxItems = 8,
  showUsers = true,
  showStatus = true,
  className = '',
  onActivityClick,
  loading = false,
  emptyMessage = '暂无最近活动',
}) => {
  const getActivityInfo = (type: string) => {
    switch (type) {
      case 'order':
        return {
          icon: ShoppingCart,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: '订单',
        };
      case 'review':
        return {
          icon: Star,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: '评价',
        };
      case 'message':
        return {
          icon: MessageSquare,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: '消息',
        };
      case 'payment':
        return {
          icon: DollarSign,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          label: '支付',
        };
      case 'service_update':
        return {
          icon: Package,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          label: '服务更新',
        };
      case 'milestone':
        return {
          icon: TrendingUp,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          label: '里程碑',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: '其他',
        };
    }
  };

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'completed':
        return {
          label: '已完成',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case 'pending':
        return {
          label: '待处理',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        };
      case 'in_progress':
        return {
          label: '进行中',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      case 'cancelled':
        return {
          label: '已取消',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        };
      default:
        return null;
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
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-chinese">
        {title}
      </h3>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          activities.slice(0, maxItems).map((activity) => {
            const activityInfo = getActivityInfo(activity.type);
            const statusInfo = showStatus ? getStatusInfo(activity.status) : null;
            const Icon = activityInfo.icon;

            return (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                  'hover:bg-gray-50 hover:shadow-sm',
                  activityInfo.bgColor,
                  activityInfo.borderColor
                )}
                onClick={() => onActivityClick?.(activity)}
              >
                {/* Activity Icon */}
                <div className={cn('p-2 rounded-lg', activityInfo.bgColor)}>
                  <Icon className={cn('w-5 h-5', activityInfo.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 leading-chinese">
                      {activity.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      {statusInfo && (
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          statusInfo.color,
                          statusInfo.bgColor
                        )}>
                          {statusInfo.label}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 leading-chinese">
                    {activity.description}
                  </p>

                  {/* User Info */}
                  {showUsers && activity.user && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        {activity.user.avatar ? (
                          <img
                            src={activity.user.avatar}
                            alt={activity.user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600">{activity.user.name}</span>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {activity.metadata?.orderId && (
                      <span>订单: #{activity.metadata.orderId}</span>
                    )}
                    {activity.metadata?.serviceId && (
                      <span>服务: #{activity.metadata.serviceId}</span>
                    )}
                    {activity.metadata?.quantity && (
                      <span>数量: {activity.metadata.quantity}</span>
                    )}
                    {activity.amount && (
                      <span className="font-medium text-green-600">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    {activity.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{activity.rating}.0</span>
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

export default RecentActivity;