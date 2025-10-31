import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  StatsCard,
  RevenueChart,
  OrderStatusCard,
  MessagePreview,
  QuickAction,
  PerformanceMetrics,
  NotificationPanel,
  CalendarWidget,
  RecentActivity,
} from '@/components/dashboard';
import { DateRangeSelector, ExportData, AnalyticsFilters } from '@/components/analytics';
import {
  DollarSign,
  Users,
  Star,
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  Calendar,
  Plus,
  Eye,
  Edit,
  Settings,
  FileText,
  BarChart3,
  Target,
  Award,
  Clock,
  AlertCircle,
} from 'lucide-react';

// Mock data - in a real app, this would come from API
const mockStats = [
  {
    title: '本月收入',
    value: '¥28,500',
    change: { value: 15.3, type: 'increase' as const, period: '上月' },
    icon: DollarSign,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: '活跃订单',
    value: '12',
    change: { value: -8.2, type: 'decrease' as const, period: '上周' },
    icon: ShoppingBag,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: '客户数量',
    value: '186',
    change: { value: 12.1, type: 'increase' as const, period: '上月' },
    icon: Users,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: '平均评分',
    value: '4.9',
    change: { value: 2.1, type: 'increase' as const, period: '上月' },
    icon: Star,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
];

const mockRevenueData = [
  { date: '01-01', revenue: 4500, orders: 8, avgOrderValue: 562.5 },
  { date: '01-02', revenue: 3200, orders: 5, avgOrderValue: 640 },
  { date: '01-03', revenue: 5800, orders: 12, avgOrderValue: 483.3 },
  { date: '01-04', revenue: 4100, orders: 7, avgOrderValue: 585.7 },
  { date: '01-05', revenue: 6300, orders: 15, avgOrderValue: 420 },
  { date: '01-06', revenue: 5200, orders: 9, avgOrderValue: 577.8 },
  { date: '01-07', revenue: 7100, orders: 18, avgOrderValue: 394.4 },
];

const mockOrderStatus = [
  { status: 'pending' as const, count: 3, value: 15000, change: 0 },
  { status: 'in_progress' as const, count: 8, value: 45000, change: 12.5 },
  { status: 'completed' as const, count: 156, value: 890000, change: 8.3 },
  { status: 'cancelled' as const, count: 2, value: 8000, change: -25 },
];

const mockMessages = [
  {
    id: '1',
    senderName: '李经理',
    content: '项目进展如何？我们需要提前了解当前的进度',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    conversationId: 'conv_1',
    type: 'order' as const,
    priority: 'high' as const,
  },
  {
    id: '2',
    senderName: '王总',
    content: '新的需求文档已发送，请查收',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    conversationId: 'conv_2',
    type: 'inquiry' as const,
    priority: 'medium' as const,
  },
  {
    id: '3',
    senderName: '系统通知',
    content: '您有一个新的订单待确认',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: true,
    conversationId: 'conv_3',
    type: 'system' as const,
  },
];

const mockQuickActions = [
  {
    id: '1',
    label: '创建新服务',
    description: '发布新的服务项目',
    icon: Plus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    href: '/services/create',
  },
  {
    id: '2',
    label: '查看订单',
    description: '管理所有订单',
    icon: ShoppingBag,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    href: '/orders',
    badge: 3,
  },
  {
    id: '3',
    label: '消息中心',
    description: '回复客户消息',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    href: '/messages',
    badge: 2,
  },
  {
    id: '4',
    label: '财务管理',
    description: '查看收入统计',
    icon: DollarSign,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    href: '/wallet',
  },
  {
    id: '5',
    label: '个人资料',
    description: '编辑个人信息',
    icon: Edit,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    href: '/profile/edit',
  },
  {
    id: '6',
    label: '数据分析',
    description: '查看详细报表',
    icon: BarChart3,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    href: '/analytics',
  },
];

const mockPerformanceMetrics = [
  {
    label: '本月收入',
    value: 28500,
    previousValue: 24700,
    target: 30000,
    unit: '¥',
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    label: '完成订单',
    value: 42,
    previousValue: 38,
    target: 50,
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    label: '客户满意度',
    value: 98,
    target: 95,
    unit: '%',
    icon: <Star className="w-5 h-5" />,
  },
  {
    label: '响应时间',
    value: 1.2,
    previousValue: 1.8,
    target: 1,
    unit: 'h',
    icon: <Clock className="w-5 h-5" />,
  },
];

const mockPerformanceData = [
  { month: '1月', revenue: 45000, orders: 38, clients: 25, rating: 4.8 },
  { month: '2月', revenue: 52000, orders: 42, clients: 29, rating: 4.9 },
  { month: '3月', revenue: 48000, orders: 35, clients: 31, rating: 4.7 },
  { month: '4月', revenue: 61000, orders: 48, clients: 35, rating: 4.9 },
  { month: '5月', revenue: 58000, orders: 45, clients: 38, rating: 4.8 },
  { month: '6月', revenue: 67000, orders: 52, clients: 42, rating: 4.9 },
];

const mockNotifications = [
  {
    id: '1',
    type: 'success' as const,
    title: '订单完成',
    message: '订单 #12345 已完成，客户给出了5星好评！',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    action: {
      label: '查看订单',
      url: '/orders/12345',
    },
  },
  {
    id: '2',
    type: 'warning' as const,
    title: '截止日期提醒',
    message: '订单 #12347 将在2天后到期，请及时完成',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    metadata: {
      orderId: '12347',
    },
  },
  {
    id: '3',
    type: 'info' as const,
    title: '平台公告',
    message: '平台将进行系统维护，期间部分功能可能无法使用',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
  },
];

const mockCalendarEvents = [
  {
    id: '1',
    title: '项目启动会议',
    date: new Date(),
    time: '14:00',
    type: 'meeting' as const,
    description: '与客户讨论新项目需求',
    location: '线上会议',
  },
  {
    id: '2',
    title: '项目交付',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: '18:00',
    type: 'deadline' as const,
    description: '网站开发项目交付',
  },
  {
    id: '3',
    title: '客户电话',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: '10:00',
    type: 'reminder' as const,
    description: '跟进项目反馈',
  },
];

const mockRecentActivities = [
  {
    id: '1',
    type: 'order' as const,
    title: '新订单 #12349',
    description: '客户购买了React开发服务',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    user: {
      name: '李经理',
      id: 'user_1',
    },
    status: 'pending' as const,
    amount: 5500,
    metadata: {
      orderId: '12349',
    },
  },
  {
    id: '2',
    type: 'review' as const,
    title: '收到5星好评',
    description: '客户对UI设计服务非常满意',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    user: {
      name: '王总',
      id: 'user_2',
    },
    rating: 5,
    metadata: {
      orderId: '12345',
    },
  },
  {
    id: '3',
    type: 'payment' as const,
    title: '收到付款',
    description: '订单 #12346 尾款已到账',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    amount: 3000,
    metadata: {
      orderId: '12346',
    },
  },
];

const FreelancerDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState({ label: '最近30天', value: '30d' });
  const [selectedFilters, setSelectedFilters] = useState({});

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      // Update stats, notifications, etc.
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">自由职业者仪表板</h1>
            <p className="text-gray-600">欢迎回来！这是您的业务概览</p>
          </div>

          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <DateRangeSelector
              selectedValue={dateRange.value}
              onChange={(option) => setDateRange(option)}
            />
            <ExportData
              data={mockRevenueData}
              filename={`revenue_${dateRange.value}`}
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockStats.map((stat, index) => (
            <StatsCard
              key={index}
              {...stat}
              onClick={() => console.log('View details for:', stat.title)}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Revenue Chart */}
            <RevenueChart
              data={mockRevenueData}
              title="收入趋势"
              height={350}
              onDateRangeChange={(option) => setDateRange(option)}
            />

            {/* Quick Actions */}
            <QuickAction
              actions={mockQuickActions}
              title="快速操作"
              columns={3}
              variant="grid"
            />

            {/* Performance Metrics */}
            <PerformanceMetrics
              metrics={mockPerformanceMetrics}
              chartData={mockPerformanceData}
              title="绩效指标"
              showChart={true}
              showTargets={true}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Order Status */}
            <OrderStatusCard
              orders={mockOrderStatus}
              title="订单状态"
              showValues={true}
              onStatusClick={(status) => console.log('Filter by status:', status)}
            />

            {/* Messages */}
            <MessagePreview
              messages={mockMessages}
              title="最新消息"
              maxItems={5}
              onMessageClick={(messageId, conversationId) =>
                console.log('Open conversation:', conversationId)
              }
            />

            {/* Notifications */}
            <NotificationPanel
              notifications={mockNotifications}
              title="通知"
              maxItems={5}
              onNotificationClick={(notification) =>
                console.log('Open notification:', notification)
              }
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Calendar */}
          <CalendarWidget
            events={mockCalendarEvents}
            title="日程安排"
            view="month"
            onEventClick={(event) => console.log('Open event:', event)}
          />

          {/* Recent Activity */}
          <RecentActivity
            activities={mockRecentActivities}
            title="最近活动"
            maxItems={8}
            onActivityClick={(activity) => console.log('Open activity:', activity)}
          />
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;