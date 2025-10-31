import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import {
  Heart,
  Share2,
  Bookmark,
  Eye,
  MessageCircle,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';

// Components
import { BreadcrumbNavigation, useServiceBreadcrumbs } from '@/components/services/BreadcrumbNavigation';
import { ServiceGallery } from '@/components/services/ServiceGallery';
import { ServicePricing } from '@/components/services/ServicePricing';
import { SellerProfileCard } from '@/components/services/SellerProfileCard';
import { ServiceDescription } from '@/components/services/ServiceDescription';
import { ServiceFAQs } from '@/components/services/ServiceFAQs';
import { ServiceReviews } from '@/components/services/ServiceReviews';
import { RelatedServices } from '@/components/services/RelatedServices';
import { ContactSeller } from '@/components/services/ContactSeller';
import { OrderNow } from '@/components/services/OrderNow';

// Services and Types
import { serviceService, ServiceDetail } from '@/services/services';
import { ServicePackage, Review } from '@/types';

// Hooks
import { useI18n } from '@/i18n';

export const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { t, formatCurrency, formatDate, formatNumber } = useI18n();

  // State
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);

  // Load service data
  const loadService = async () => {
    if (!serviceId) return;

    setLoading(true);
    setError('');

    try {
      const response = await serviceService.getServiceDetail(serviceId);
      if (response.success && response.data) {
        setService(response.data);
        setIsFavorited(response.data.isFavorited);

        // Track view
        serviceService.trackView(serviceId);

        // Add to recently viewed
        updateRecentlyViewed(response.data.id);

        // Set default package if single package
        if (response.data.packages.length === 1) {
          setSelectedPackage(response.data.packages[0].id);
        }
      } else {
        setError(response.error || '服务不存在');
      }
    } catch (err) {
      setError('加载服务信息失败');
    } finally {
      setLoading(false);
    }
  };

  // Update recently viewed services
  const updateRecentlyViewed = (serviceId: number) => {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const updated = [serviceId, ...viewed.filter((id: number) => id !== serviceId)].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    setRecentlyViewed(updated);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!service || !serviceId) return;

    try {
      if (isFavorited) {
        await serviceService.removeFromFavorites(serviceId);
        setIsFavorited(false);
        toast.success('已取消收藏');
      } else {
        await serviceService.addToFavorites(serviceId);
        setIsFavorited(true);
        toast.success('已添加到收藏');
      }
    } catch (error) {
      toast.error('操作失败，请重试');
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!service) return;

    try {
      const shareUrl = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: service.title,
          text: service.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Handle contact seller
  const handleContactSeller = () => {
    setIsContactModalOpen(true);
  };

  // Handle order now
  const handleOrderNow = () => {
    if (!service) return;

    // Check if user is logged in (simplified check)
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    setIsOrderModalOpen(true);
  };

  // Handle contact success
  const handleContactSuccess = (conversationId: number) => {
    toast.success('消息已发送');
    navigate(`/messages/${conversationId}`);
  };

  // Handle order success
  const handleOrderSuccess = (orderId: number) => {
    toast.success('订单创建成功');
    navigate(`/orders/${orderId}`);
  };

  // Handle package selection
  const handlePackageSelect = (packageId: number) => {
    setSelectedPackage(packageId);
  };

  // Generate breadcrumbs
  const breadcrumbs = useServiceBreadcrumbs(
    service?.category.name,
    service?.subcategory.name,
    service?.title
  );

  // Load data on mount
  useEffect(() => {
    loadService();
  }, [serviceId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg p-6">
                  <div className="h-96 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 h-64"></div>
                <div className="bg-white rounded-lg p-6 h-96"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || '服务不存在'}
          </h2>
          <button
            onClick={() => navigate('/services')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            返回服务列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{service.title} - 专业服务 | 威客平台</title>
        <meta name="description" content={service.description.substring(0, 160)} />
        <meta name="keywords" content={service.tags.join(', ')} />
        <meta property="og:title" content={service.title} />
        <meta property="og:description" content={service.description} />
        <meta property="og:image" content={service.images[0] || '/default-service.jpg'} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.title,
            description: service.description,
            provider: {
              '@type': 'Person',
              name: service.seller.profile.displayName,
            },
            offers: {
              '@type': 'Offer',
              price: service.price,
              priceCurrency: 'CNY',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: service.averageRating,
              reviewCount: service.totalReviews,
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <BreadcrumbNavigation items={breadcrumbs} />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Gallery */}
              <ServiceGallery items={service.gallery} />

              {/* Title and Basic Info */}
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleFavoriteToggle}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        isFavorited
                          ? 'bg-red-50 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={isFavorited ? '取消收藏' : '收藏服务'}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      title="分享服务"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      title="书签"
                    >
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Rating and Stats */}
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-900">
                      {service.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">({formatNumber(service.totalReviews)})</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <ShoppingCart className="w-4 h-4" />
                    <span>{formatNumber(service.orderCount)} 订单</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(service.viewCount)} 浏览</span>
                  </div>
                </div>

                {/* Tags */}
                {service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing */}
              <ServicePricing
                packages={service.packages}
                selectedPackage={selectedPackage || undefined}
                onPackageSelect={handlePackageSelect}
              />

              {/* Description */}
              <ServiceDescription
                title="服务详情"
                description={service.description}
                features={service.features}
                requirements={service.requirements.map(req => req.title)}
                deliveryInfo={`平均交付时间: ${service.deliveryTime}天`}
                revisions={service.revisions}
              />

              {/* FAQs */}
              {service.faqs.length > 0 && (
                <ServiceFAQs
                  faqs={service.faqs}
                  onQuestionClick={(faq) => {
                    // Could scroll to contact form or open contact modal
                    console.log('FAQ clicked:', faq);
                  }}
                  onHelpfulClick={(faqId) => {
                    serviceService.markReviewHelpful(faqId.toString());
                  }}
                />
              )}

              {/* Reviews */}
              <ServiceReviews
                serviceId={service.id}
                averageRating={service.averageRating}
                totalReviews={service.totalReviews}
              />

              {/* Related Services */}
              {service.relatedServices.length > 0 && (
                <RelatedServices
                  services={service.relatedServices}
                  title="相关服务推荐"
                />
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Seller Profile */}
              <SellerProfileCard
                seller={service.seller}
                sellerProfile={service.sellerProfile}
              />

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleOrderNow}
                    disabled={!selectedPackage}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{selectedPackage ? '立即下单' : '请选择套餐'}</span>
                  </button>
                  <button
                    onClick={handleContactSeller}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>联系卖家</span>
                  </button>
                </div>
              </div>

              {/* Service Stats */}
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">服务统计</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">响应时间</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {service.statistics.averageResponseTime}小时
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">回头客</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {service.statistics.repeatCustomers}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">准时交付</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {service.statistics.onTimeDelivery}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">安全提示</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• 请通过平台进行交易和沟通</li>
                  <li>• 仔细查看卖家评价和服务描述</li>
                  <li>• 要求卖家提供详细的工作计划</li>
                  <li>• 不要直接转账到个人账户</li>
                  <li>• 如有问题，及时联系客服</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ContactSeller
          serviceId={service.id}
          serviceTitle={service.title}
          sellerId={service.seller.id}
          sellerName={service.seller.profile.displayName}
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          onSuccess={handleContactSuccess}
        />

        <OrderNow
          serviceId={service.id}
          serviceTitle={service.title}
          packages={service.packages}
          requirements={service.requirements}
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          onSuccess={handleOrderSuccess}
        />
      </div>
    </>
  );
};
