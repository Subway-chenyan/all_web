import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Package, Truck } from 'lucide-react';
import { cn } from '@/utils';

export interface OrderStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'delivered' | 'processing';
  count: number;
  value?: number;
  change?: number;
}

export interface OrderStatusCardProps {
  orders: OrderStatus[];
  title?: string;
  showValues?: boolean;
  showChanges?: boolean;
  className?: string;
  onStatusClick?: (status: string) => void;
}

const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
  orders,
  title = '订单状态',
  showValues = true,
  showChanges = true,
  className = '',
  onStatusClick,
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: '待处理',
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'processing':
        return {
          label: '处理中',
          icon: Package,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'in_progress':
        return {
          label: '进行中',
          icon: Truck,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
        };
      case 'completed':
        return {
          label: '已完成',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'delivered':
        return {
          label: '已交付',
          icon: Truck,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
        };
      case 'cancelled':
        return {
          label: '已取消',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          label: '未知',
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalOrders = orders.reduce((sum, order) => sum + order.count, 0);

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 leading-chinese">
        {title}
      </h3>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const Icon = statusInfo.icon;
          const percentage = totalOrders > 0 ? (order.count / totalOrders) * 100 : 0;

          return (
            <div
              key={order.status}
              className={cn(
                'p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
                statusInfo.bgColor,
                statusInfo.borderColor,
                onStatusClick && 'hover:border-opacity-60'
              )}
              onClick={() => onStatusClick?.(order.status)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', statusInfo.bgColor)}>
                    <Icon className={cn('w-5 h-5', statusInfo.color)} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {statusInfo.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.count} 个订单
                      {showValues && order.value && (
                        <span className="ml-2">
                          ({formatCurrency(order.value)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {percentage.toFixed(1)}%
                  </div>
                  {showChanges && order.change !== undefined && (
                    <div className={cn(
                      'text-sm font-medium',
                      order.change > 0 ? 'text-green-600' :
                      order.change < 0 ? 'text-red-600' : 'text-gray-600'
                    )}>
                      {order.change > 0 ? '+' : ''}{order.change}%
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-500',
                      statusInfo.color.replace('text-', 'bg-')
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">总订单数</span>
          <span className="text-lg font-bold text-gray-900">
            {totalOrders.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusCard;