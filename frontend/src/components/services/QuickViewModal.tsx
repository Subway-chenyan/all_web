import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '@/types';
import { useI18n } from '@/i18n';
import { useAuthStore } from '@/store';
import { useServicesStore } from '@/store/servicesStore';
import { cn } from '@/utils';

interface QuickViewModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { t, formatCurrency } = useI18n();
  const { user } = useAuthStore();
  const { toggleFavorite, isFavorite } = useServicesStore();

  const [imageError, setImageError] = React.useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  if (!service || !isOpen) return null;

  const handleViewDetails = () => {
    navigate(`/services/${service.id}`);
    onClose();
  };

  const handleContactSeller = () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    navigate(`/messages/new?seller=${service.seller.id}`);
    onClose();
  };

  const handleFavoriteClick = () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    toggleFavorite(service.id);
  };

  const handleOrderNow = () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    navigate(`/services/${service.id}?action=order`);
    onClose();
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" opacity="0.5" />
            <path d="M10 15V0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545L10 15z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 ml-1">
          ({service.totalReviews})
        </span>
      </div>
    );
  };

  const renderPrice = () => {
    if (service.priceType === 'fixed') {
      return (
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(service.price)}
          </span>
        </div>
      );
    } else if (service.priceType === 'hourly') {
      return (
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(service.price)}
          </span>
          <span className="text-sm text-gray-500">/小时</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(service.price)}
          </span>
          <span className="text-sm text-gray-500">起</span>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">服务预览</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {!imageError && service.images?.length > 0 ? (
                <img
                  src={service.images[selectedImageIndex]}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Featured Badge */}
              {service.isFeatured && (
                <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
                  推荐
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {service.images && service.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {service.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2',
                      selectedImageIndex === index
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <img
                      src={image}
                      alt={`${service.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            {/* Title */}
            <h1 className="text-xl font-bold text-gray-900">{service.title}</h1>

            {/* Seller Info */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                {service.seller.profile?.avatar ? (
                  <img
                    src={service.seller.profile.avatar}
                    alt={service.seller.profile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {service.seller.firstName?.[0] || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {service.seller.profile?.displayName || service.seller.username}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {service.seller.profile?.averageRating && renderStars(service.seller.profile.averageRating)}
                  {service.seller.profile?.totalReviews && (
                    <span>({service.seller.profile.totalReviews} 评价)</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate(`/sellers/${service.seller.id}`)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                查看资料
              </button>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">服务描述</h3>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                {service.description}
              </p>
            </div>

            {/* Features */}
            {service.features && service.features.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">服务特色</h3>
                <ul className="space-y-1">
                  {service.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Service Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm text-gray-500">交付时间</span>
                <p className="font-medium text-gray-900">{service.deliveryTime} 天</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">修改次数</span>
                <p className="font-medium text-gray-900">{service.revisions} 次</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">订单数量</span>
                <p className="font-medium text-gray-900">{service.orderCount}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">浏览次数</span>
                <p className="font-medium text-gray-900">{service.viewCount}</p>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                {renderPrice()}
                <button
                  onClick={handleFavoriteClick}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <svg
                    className={cn(
                      'w-6 h-6',
                      isFavorite(service.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleContactSeller}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  联系卖家
                </button>
                <button
                  onClick={handleViewDetails}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  查看详情
                </button>
                <button
                  onClick={handleOrderNow}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  立即下单
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;