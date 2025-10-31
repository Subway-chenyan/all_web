import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/utils';
import { ServiceFormData, ServiceDraft } from '@/types/services';
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils';
import Button from '@/components/ui/Button';

// Mock data - in real app, this would come from API
interface Service extends ServiceFormData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  orders: number;
  rating: number;
  reviews: number;
  revenue: number;
}

const mockServices: Service[] = [
  {
    id: '1',
    title: '专业Logo设计服务',
    category: '设计服务',
    subcategory: 'Logo设计',
    description: '提供专业的品牌Logo设计服务，包含多个设计方案和修改机会。',
    tags: ['Logo设计', '品牌设计', 'VI设计'],
    packages: [
      {
        id: 'pkg1',
        name: '基础版',
        description: '2个设计方案，3次修改',
        price: 299,
        deliveryTime: 3,
        revisions: 3,
        features: ['2个原创设计', '3次修改机会', '源文件提供', '商用授权'],
        isPopular: false
      },
      {
        id: 'pkg2',
        name: '标准版',
        description: '5个设计方案，无限修改',
        price: 599,
        deliveryTime: 5,
        revisions: 10,
        features: ['5个原创设计', '无限修改', '全套VI文件', '品牌指导手册', '优先支持'],
        isPopular: true
      }
    ],
    requirements: ['公司名称', '行业类型', '设计风格偏好', '参考案例'],
    deliverables: ['AI源文件', 'PNG文件', 'PDF文件', '使用说明'],
    revisionCount: 3,
    deliveryTime: 3,
    images: [],
    videos: [],
    documents: [],
    seoTitle: '专业Logo设计服务 - 品牌标识定制设计',
    seoDescription: '专业的Logo设计服务，提供多个原创设计方案，支持多次修改，包含源文件和商用授权。',
    keywords: ['Logo设计', '品牌设计', 'VI设计', '商标设计'],
    status: 'active',
    featured: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    views: 1250,
    orders: 45,
    rating: 4.8,
    reviews: 23,
    revenue: 18900
  },
  {
    id: '2',
    title: '网站UI/UX设计服务',
    category: '设计服务',
    subcategory: 'UI/UX设计',
    description: '专业的网站界面设计服务，注重用户体验和视觉效果。',
    tags: ['UI设计', 'UX设计', '网页设计'],
    packages: [
      {
        id: 'pkg3',
        name: '企业官网',
        description: '5个页面设计，响应式布局',
        price: 2999,
        deliveryTime: 7,
        revisions: 3,
        features: ['首页设计', '关于页面', '服务页面', '联系页面', '响应式设计'],
        isPopular: true
      }
    ],
    requirements: ['网站类型', '目标用户', '功能需求', '参考网站'],
    deliverables: ['设计稿文件', '交互原型', '设计规范'],
    revisionCount: 3,
    deliveryTime: 7,
    images: [],
    videos: [],
    documents: [],
    seoTitle: '网站UI/UX设计服务 - 专业界面设计',
    seoDescription: '专业的网站UI/UX设计服务，提供完整的界面设计方案，包含响应式设计和交互原型。',
    keywords: ['UI设计', 'UX设计', '网页设计', '界面设计'],
    status: 'active',
    featured: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    views: 890,
    orders: 12,
    rating: 4.9,
    reviews: 8,
    revenue: 35988
  },
  {
    id: '3',
    title: '移动应用开发服务',
    category: '开发服务',
    subcategory: '移动应用',
    description: 'iOS和Android原生应用开发服务。',
    tags: ['APP开发', 'iOS开发', 'Android开发'],
    packages: [
      {
        id: 'pkg4',
        name: '基础版',
        description: '单平台应用开发',
        price: 15000,
        deliveryTime: 30,
        revisions: 2,
        features: ['iOS或Android开发', '基础功能实现', '应用上架支持'],
        isPopular: false
      }
    ],
    requirements: ['应用功能需求', '设计稿', '目标平台'],
    deliverables: ['APP安装包', '源代码', '技术文档'],
    revisionCount: 2,
    deliveryTime: 30,
    images: [],
    videos: [],
    documents: [],
    seoTitle: '移动应用开发服务 - iOS/Android APP开发',
    seoDescription: '专业的移动应用开发服务，支持iOS和Android平台，提供完整的应用开发和技术支持。',
    keywords: ['APP开发', 'iOS开发', 'Android开发', '移动应用'],
    status: 'draft',
    featured: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    views: 120,
    orders: 0,
    rating: 0,
    reviews: 0,
    revenue: 0
  }
];

type SortOption = 'newest' | 'oldest' | 'popular' | 'revenue' | 'rating';
type FilterOption = 'all' | 'active' | 'draft' | 'paused' | 'inactive';

const ManageServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [services, setServices] = useState<Service[]>(mockServices);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Show success message if coming from create page
  const [showMessage, setShowMessage] = useState(false);
  useEffect(() => {
    if (location.state?.message) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Filter and sort services
  const filteredServices = services
    .filter(service => {
      // Search filter
      if (searchTerm && !service.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !service.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all' && service.status !== filterStatus) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'oldest':
          return a.updatedAt.getTime() - b.updatedAt.getTime();
        case 'popular':
          return b.views - a.views;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  // Calculate statistics
  const stats = {
    total: services.length,
    active: services.filter(s => s.status === 'active').length,
    draft: services.filter(s => s.status === 'draft').length,
    paused: services.filter(s => s.status === 'paused').length,
    totalRevenue: services.reduce((sum, s) => sum + s.revenue, 0),
    totalOrders: services.reduce((sum, s) => sum + s.orders, 0),
    totalViews: services.reduce((sum, s) => sum + s.views, 0)
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map(s => s.id));
    }
  };

  const handleBulkAction = (action: 'activate' | 'pause' | 'delete' | 'duplicate') => {
    // Handle bulk actions
    console.log(`Bulk action: ${action}`, selectedServices);
    setSelectedServices([]);
  };

  const handleStatusChange = (serviceId: string, newStatus: Service['status']) => {
    setServices(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { ...service, status: newStatus, updatedAt: new Date() }
          : service
      )
    );
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('确定要删除这个服务吗？此操作不可恢复。')) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
    }
  };

  const handleDuplicateService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const newService: Service = {
        ...service,
        id: Date.now().toString(),
        title: `${service.title} (副本)`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        orders: 0,
        rating: 0,
        reviews: 0,
        revenue: 0
      };
      setServices(prev => [newService, ...prev]);
    }
  };

  const getStatusBadge = (status: Service['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      paused: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };

    const labels = {
      active: '已发布',
      draft: '草稿',
      paused: '已暂停',
      inactive: '已下架'
    };

    return (
      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', styles[status])}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">服务管理</h1>
              <span className="text-sm text-gray-500">
                共 {stats.total} 个服务
              </span>
            </div>
            <Button onClick={() => navigate('/services/create')}>
              创建新服务
            </Button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800">{location.state?.message}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总收入</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总订单</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总浏览</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">活跃服务</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索服务..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有状态</option>
                <option value="active">已发布</option>
                <option value="draft">草稿</option>
                <option value="paused">已暂停</option>
                <option value="inactive">已下架</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">最新更新</option>
                <option value="oldest">最早更新</option>
                <option value="popular">最受欢迎</option>
                <option value="revenue">收入最高</option>
                <option value="rating">评分最高</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedServices.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  已选择 {selectedServices.length} 个服务
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  批量激活
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('pause')}
                >
                  批量暂停
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  批量删除
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无服务</h3>
              <p className="text-gray-500 mb-4">开始创建您的第一个服务吧</p>
              <Button onClick={() => navigate('/services/create')}>
                创建新服务
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedServices.length === filteredServices.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      服务信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      价格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      统计
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      更新时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => handleSelectService(service.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {service.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {service.category} › {service.subcategory}
                          </div>
                          {service.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                              推荐
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(service.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(service.packages[0]?.price || 0)}
                        </div>
                        {service.packages.length > 1 && (
                          <div className="text-xs text-gray-500">
                            {service.packages.length} 个套餐
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div>📊 {service.orders} 订单</div>
                          <div>👁️ {service.views} 浏览</div>
                          {service.rating > 0 && (
                            <div>⭐ {service.rating} ({service.reviews})</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatRelativeTime(service.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/services/${service.id}/edit`)}
                          >
                            编辑
                          </Button>
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowBulkActions(!showBulkActions)}
                            >
                              更多
                            </Button>
                            {/* Dropdown Menu */}
                            {showBulkActions && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateService(service.id)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    复制服务
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/services/${service.id}/analytics`)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    查看分析
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/services/${service.id}`)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    预览服务
                                  </button>
                                  <div className="border-t border-gray-100"></div>
                                  {service.status === 'active' && (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(service.id, 'paused')}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      暂停服务
                                    </button>
                                  )}
                                  {service.status === 'paused' && (
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(service.id, 'active')}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      激活服务
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteService(service.id)}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    删除服务
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageServicesPage;