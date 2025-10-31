import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  StatsCard,
  OrderStatusCard,
  MessagePreview,
  QuickAction,
  NotificationPanel,
  CalendarWidget,
  RecentActivity,
} from '@/components/dashboard';
import { DateRangeSelector, ExportData, AnalyticsFilters, PieChart, BarChart } from '@/components/analytics';
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
  Search,
  Filter,
  Heart,
  FileText,
  BarChart3,
  Target,
  Clock,
  AlertCircle,
  UserCheck,
  Briefcase,
} from 'lucide-react';

// Mock data - in a real app, this would come from API
const mockStats = [
  {
    title: '本月支出',
    value: '¥15,200',
    change: { value: -5.3, type: 'decrease' as const, period: '上月' },
    icon: DollarSign,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    title: '活跃项目',
    value: '8',
    change: { value: 14.2, type: 'increase' as const, period: '上周' },
    icon: ShoppingBag,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: '合作自由职业者',
    value: '24',
    change: { value: 8.7, type: 'increase' as const, period: '上月' },
    icon: Users,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: '完成项目',
    value: '47',
    change: { value: 12.1, type: 'increase' as const, period: '上月' },
    icon: Target,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
];

const mockSpendingData = [
  { date: '01-01', spending: 2800, projects: 2, avgProjectValue: 1400 },
  { date: '01-02', spending: 1200, projects: 1, avgProjectValue: 1200 },
  { date: '01-03', spending: 4500, projects: 3, avgProjectValue: 1500 },
  { date: '01-04', spending: 2100, projects: 2, avgProjectValue: 1050 },
  { date: '01-05', spending: 3300, projects: 2, avgProjectValue: 1650 },
  { date: '01-06', spending: 1800, projects: 1, avgProjectValue: 1800 },
  { date: '01-07', spending: 3900, projects: 3, avgProjectValue: 1300 },
];

const mockOrderStatus = [
  { status: 'pending' as const, count: 2, value: 6000, change: 0 },
  { status: 'in_progress' as const, count: 6, value: 25000, change: 8.5 },
  { status: 'completed' as const, count: 47, value: 186000, change: 12.3 },
  { status: 'cancelled' as const, count: 1, value: 2000, change: -50 },
];

const mockMessages = [
  {
    id: '1',
    senderName: '张明',
    content: '项目进展顺利，已完成第一阶段的开发工作',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    conversationId: 'conv_1',
    type: 'order' as const,
    priority: 'high' as const,
  },
  {
    id: '2',
    senderName: '李设计师',
    content: 'UI设计稿已更新，请查看最新版本',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    conversationId: 'conv_2',
    type: 'order' as const,
    priority: 'medium' as const,
  },
  {
    id: '3',
    senderName: '王开发者',
    content: '需要确认一些技术细节',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: true,
    conversationId: 'conv_3',
    type: 'order' as const,
  },
];

const mockQuickActions = [
  {
    id: '1',
    label: '发布新项目',
    description: '创建新的项目需求',
    icon: Plus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    href: '/projects/create',
  },
  {
    id: '2',
    label: '寻找自由职业者',
    description: '浏览和搜索专业人才',
    icon: Search,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    href: '/freelancers',
  },
  {
    id: '3',
    label: '管理项目',
    description: '查看所有项目状态',
    icon: ShoppingBag,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    href: '/projects',
    badge: 2,
  },
  {
    id: '4',
    label: '收藏列表',
    description: '查看收藏的服务',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    href: '/favorites',
    badge: 5,
  },
  {
    id: '5',
    label: '消息中心',
    description: '与自由职业者沟通',
    icon: MessageSquare,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    href: '/messages',
    badge: 2,
  },
  {
    id: '6',
    label: '财务报表',
    description: '查看支出统计',
    icon: BarChart3,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    href: '/analytics',
  },
];

const mockNotifications = [
  {
    id: '1',
    type: 'success' as const,
    title: '项目交付',
    message: '张明已提交网站开发项目的最终版本',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    action: {
      label: '查看项目',
      url: '/projects/12345',
    },
  },
  {
    id: '2',
    type: 'info' as const,
    title: '新的申请',
    message: '有5位自由职业者申请了您的UI设计项目',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    metadata: {
      projectId: 'design_123',
    },
  },
  {
    id: '3',
    type: 'warning' as const,
    title: '预算提醒',
    message: '本月的支出已达到预算的80%',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
  },
];

const mockCalendarEvents = [
  {
    id: '1',
    title: '项目评审会议',
    date: new Date(),
    time: '15:00',
    type: 'meeting' as const,
    description: '与开发团队讨论项目进度',
    location: '线上会议',
  },
  {
    id: '2',
    title: '设计稿验收',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    time: '10:00',
    type: 'deadline' as const,
    description: 'UI设计最终稿验收',
  },
  {
    id: '3',
    title: '项目启动',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: '14:00',
    type: 'milestone' as const,
    description: '新移动应用项目启动',
  },
];

const mockRecentActivities = [
  {
    id: '1',
    type: 'order' as const,
    title: '创建新项目',
    description: '发布了移动应用开发项目',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'pending' as const,
    amount: 25000,
    metadata: {
      projectId: 'proj_001',
    },
  },
  {
    id: '2',
    type: 'message' as const,
    title: '项目沟通',
    description: '与张明讨论了技术方案',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    user: {
      name: '张明',
      id: 'freelancer_1',
    },
    metadata: {
      projectId: 'proj_002',
    },
  },
  {
    id: '3',
    type: 'payment' as const,
    title: '支付款项',
    description: '支付了设计项目的首付款',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    amount: 5000,
    metadata: {
      projectId: 'proj_003',
    },
  },
];

const mockSpendingByCategory = [
  { name: 'Web开发', value: 45000 },
  { name: 'UI/UX设计', value: 28000 },
  { name: '移动应用', value: 32000 },
  { name: '内容创作', value: 15000 },
  { name: '市场营销', value: 12000 },
];

const mockFavoriteFreelancers = [
  {
    id: '1',
    name: '张明',
    title: '全栈开发工程师',
    avatar: '/api/placeholder/200/200',
    rating: 4.9,
    completedOrders: 156,
    hourlyRate: 350,
    skills: ['React', 'Node.js', 'TypeScript'],
  },
  {
    id: '2',
    name: '李设计师',
    title: 'UI/UX设计师',
    avatar: '/api/placeholder/200/200',
    rating: 4.8,
    completedOrders: 89,
    hourlyRate: 280,
    skills: ['Figma', 'Sketch', 'Adobe XD'],
  },
  {
    id: '3',
    name: '王营销',
    title: '数字营销专家',
    avatar: '/api/placeholder/200/200',
    rating: 4.7,
    completedOrders: 67,
    hourlyRate: 200,
    skills: ['SEO', 'SEM', '社交媒体营销'],
  },
];

const ClientDashboard: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">客户仪表板</h1>
            <p className="text-gray-600">管理您的项目和自由职业者合作</p>
          </div>

          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <DateRangeSelector
              selectedValue={dateRange.value}
              onChange={(option) => setDateRange(option)}
            />
            <ExportData
              data={mockSpendingData}
              filename={`spending_${dateRange.value}`}
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
            {/* Spending Analytics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">支出分析</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">支出趋势</h4>
                  <BarChart
                    data={mockSpendingData}
                    bars={[
                      { dataKey: 'spending', fill: '#ef4444', name: '支出' },
                    ]}
                    xAxisDataKey="date"
                    height={250}
                    showGrid={true}
                    showLegend={false}
                  />
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">分类支出</h4>
                  <PieChart
                    data={mockSpendingByCategory}
                    height={250}
                    showLegend={true}
                    showLabels={true}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <QuickAction
              actions={mockQuickActions}
              title="快速操作"
              columns={3}
              variant="grid"
            />

            {/* Favorite Freelancers */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">收藏的自由职业者</h3>
                <Link
                  to="/freelancers"
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  查看全部
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockFavoriteFreelancers.map((freelancer) => (
                  <div
                    key={freelancer.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                      <img
                        src={freelancer.avatar}
                        alt={freelancer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {freelancer.name}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        {freelancer.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">
                            {freelancer.rating}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {freelancer.completedOrders} 个项目
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ¥{freelancer.hourlyRate}/h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Order Status */}
            <OrderStatusCard
              orders={mockOrderStatus}
              title="项目状态"
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
            title="项目日程"
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

export default ClientDashboard;