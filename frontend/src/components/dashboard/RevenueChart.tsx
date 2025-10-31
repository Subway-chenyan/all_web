import React, { useState, useMemo } from 'react';
import { LineChart as LineChartComponent } from '@/components/analytics';
import { DateRangeSelector, DateRangeOption } from '@/components/analytics';
import { TrendIndicator } from '@/components/analytics';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/utils';

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface RevenueChartProps {
  data: RevenueData[];
  title?: string;
  height?: number;
  showOrders?: boolean;
  showAvgOrderValue?: boolean;
  className?: string;
  loading?: boolean;
  onDateRangeChange?: (option: DateRangeOption) => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title = '收入趋势',
  height = 350,
  showOrders = true,
  showAvgOrderValue = true,
  className = '',
  loading = false,
  onDateRangeChange,
}) => {
  const [dateRange, setDateRange] = useState<DateRangeOption>({
    label: '最近30天',
    value: '30d',
    days: 30,
  });

  const metrics = useMemo(() => {
    if (!data.length) return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, growth: 0 };

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth (compare last 7 days with previous 7 days)
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last7Days = sortedData.slice(-7);
    const previous7Days = sortedData.slice(-14, -7);

    const last7Revenue = last7Days.reduce((sum, item) => sum + item.revenue, 0);
    const previous7Revenue = previous7Days.reduce((sum, item) => sum + item.revenue, 0);

    const growth = previous7Revenue > 0
      ? ((last7Revenue - previous7Revenue) / previous7Revenue) * 100
      : 0;

    return { totalRevenue, totalOrders, avgOrderValue, growth };
  }, [data]);

  const handleDateRangeChange = (option: DateRangeOption) => {
    setDateRange(option);
    onDateRangeChange?.(option);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const chartLines = [
    {
      dataKey: 'revenue',
      stroke: '#ef4444',
      name: '收入',
      strokeWidth: 3,
    },
  ];

  if (showOrders) {
    chartLines.push({
      dataKey: 'orders',
      stroke: '#3b82f6',
      name: '订单数',
      strokeWidth: 2,
    });
  }

  if (showAvgOrderValue) {
    chartLines.push({
      dataKey: 'avgOrderValue',
      stroke: '#10b981',
      name: '平均订单价值',
      strokeWidth: 2,
    });
  }

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 leading-chinese">
            {title}
          </h3>
        </div>
        <DateRangeSelector
          selectedValue={dateRange.value}
          onChange={handleDateRangeChange}
          className="text-sm"
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">总收入</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(metrics.totalRevenue)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">总订单</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {metrics.totalOrders.toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">平均订单价值</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(metrics.avgOrderValue)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">增长率</span>
          </div>
          <TrendIndicator
            value={metrics.growth}
            className="bg-transparent p-0"
            showPercentage={true}
            size="sm"
          />
        </div>
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <LineChartComponent
          data={data}
          lines={chartLines}
          xAxisDataKey="date"
          height={height}
          showGrid={true}
          showLegend={true}
        />
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          暂无数据
        </div>
      )}
    </div>
  );
};

export default RevenueChart;