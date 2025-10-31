import React from 'react';
import { BarChart as BarChartComponent, TrendIndicator } from '@/components/analytics';
import { Target, Clock, Star, TrendingUp, Users, DollarSign } from 'lucide-react';
import { cn } from '@/utils';

export interface PerformanceMetric {
  label: string;
  value: number;
  previousValue?: number;
  target?: number;
  unit?: string;
  color?: string;
  icon?: React.ReactNode;
}

export interface PerformanceData {
  month: string;
  revenue: number;
  orders: number;
  clients: number;
  rating: number;
}

export interface PerformanceMetricsProps {
  metrics: PerformanceMetric[];
  chartData?: PerformanceData[];
  title?: string;
  showChart?: boolean;
  showTargets?: boolean;
  height?: number;
  className?: string;
  loading?: boolean;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics,
  chartData,
  title = '绩效指标',
  showChart = true,
  showTargets = true,
  height = 300,
  className = '',
  loading = false,
}) => {
  const getMetricIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('收入') || lowerLabel.includes('revenue')) {
      return <DollarSign className="w-5 h-5" />;
    }
    if (lowerLabel.includes('订单') || lowerLabel.includes('order')) {
      return <Target className="w-5 h-5" />;
    }
    if (lowerLabel.includes('时间') || lowerLabel.includes('time')) {
      return <Clock className="w-5 h-5" />;
    }
    if (lowerLabel.includes('评分') || lowerLabel.includes('rating')) {
      return <Star className="w-5 h-5" />;
    }
    if (lowerLabel.includes('客户') || lowerLabel.includes('client')) {
      return <Users className="w-5 h-5" />;
    }
    return <TrendingUp className="w-5 h-5" />;
  };

  const getProgressPercentage = (value: number, target?: number) => {
    if (!target) return 0;
    return Math.min((value / target) * 100, 100);
  };

  const formatValue = (value: number, unit?: string) => {
    if (unit === '¥' || unit === 'CNY') {
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 0,
      }).format(value);
    }
    if (unit === '%') {
      return `${value}%`;
    }
    if (unit === 'h' || unit === 'hour') {
      return `${value}小时`;
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          {showChart && <div className="h-64 bg-gray-200 rounded"></div>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 leading-chinese">
        {title}
      </h3>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                  {metric.icon || getMetricIcon(metric.label)}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {metric.label}
                </span>
              </div>
              {metric.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatValue(metric.value, metric.unit)}
                </span>
                {metric.previousValue && (
                  <TrendIndicator
                    value={metric.value}
                    previousValue={metric.previousValue}
                    size="sm"
                    className="bg-transparent p-0"
                  />
                )}
              </div>

              {showTargets && metric.target && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>目标: {formatValue(metric.target, metric.unit)}</span>
                    <span>{getProgressPercentage(metric.value, metric.target).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-500',
                        getProgressPercentage(metric.value, metric.target) >= 100
                          ? 'bg-green-500'
                          : getProgressPercentage(metric.value, metric.target) >= 75
                          ? 'bg-blue-500'
                          : getProgressPercentage(metric.value, metric.target) >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      )}
                      style={{
                        width: `${getProgressPercentage(metric.value, metric.target)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      {showChart && chartData && chartData.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4 leading-chinese">
            绩效趋势
          </h4>
          <BarChartComponent
            data={chartData}
            bars={[
              { dataKey: 'revenue', fill: '#ef4444', name: '收入' },
              { dataKey: 'orders', fill: '#3b82f6', name: '订单' },
              { dataKey: 'clients', fill: '#10b981', name: '客户' },
            ]}
            xAxisDataKey="month"
            height={height}
            showGrid={true}
            showLegend={true}
          />
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;