import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '@/types';
import { useI18n } from '@/i18n';
import { useServicesStore } from '@/store/servicesStore';
import { useAuthStore } from '@/store';
import { cn } from '@/utils';

interface ServiceCardProps {
  service: Service;
  viewMode?: 'grid' | 'list';
  className?: string;
  showQuickView?: boolean;
  onQuickView?: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  viewMode = 'grid',
  className = '',
  showQuickView = true,
  onQuickView,
}) => {
  const navigate = useNavigate();
  const { t, formatCurrency } = useI18n();
  const { user } = useAuthStore();
  const { toggleFavorite, isFavorite } = useServicesStore();

  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleCardClick = () => {
    navigate(`/services/${service.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/auth/login');
      return;
    }

    toggleFavorite(service.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onQuickView) {
      onQuickView(service);
    }
  };

  const handleSellerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/sellers/${service.seller.id}`);
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

  const cardClasses = cn(
    'bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group',
    viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row',
    className
  );

  const imageContainerClasses = cn(
    'relative overflow-hidden bg-gray-100',
    viewMode === 'grid' ? 'h-48' : 'w-48 h-full min-h-[192px]'
  );

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      {/* Service Image */}
      <div className={imageContainerClasses}>
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="animate-pulse w-full h-full bg-gray-300"></div>
          </div>
        )}

        {!imageError && service.images?.length > 0 ? (
          <img
            src={service.images[0]}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              setImageError(true);
              setIsImageLoading(false);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          {showQuickView && (
            <button
              onClick={handleQuickViewClick}
              className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              {t('common.view')}
            </button>
          )}
        </div>

        {/* Featured Badge */}
        {service.isFeatured && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
            推荐
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 group/favorite"
        >
          <svg
            className={cn(
              'w-5 h-5 transition-colors duration-200',
              isFavorite(service.id) ? 'text-red-500 fill-current' : 'text-gray-400 group-hover/favorite:text-red-500'
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

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Seller Info */}
        <div className="flex items-center space-x-2 mb-2">
          <div
            className="flex items-center space-x-2 cursor-pointer group/seller"
            onClick={handleSellerClick}
          >
            <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden">
              {service.seller.profile?.avatar ? (
                <img
                  src={service.seller.profile.avatar}
                  alt={service.seller.profile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                  <span className="text-xs text-white">
                    {service.seller.firstName?.[0] || 'U'}
                  </span>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600 group-hover/seller:text-blue-600 transition-colors duration-200">
              {service.seller.profile?.displayName || service.seller.username}
            </span>
          </div>

          {service.seller.profile?.averageRating && (
            <>
              <span className="text-gray-400">•</span>
              {renderStars(service.seller.profile.averageRating)}
              <span className="text-sm text-gray-600">
                ({service.seller.profile.totalReviews})
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
          {service.description}
        </p>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {service.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {service.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{service.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Price */}
          <div className="flex flex-col">
            {renderPrice()}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{service.deliveryTime}天交付</span>
              <span>•</span>
              <span>{service.orderCount}个订单</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {viewMode === 'list' && showQuickView && (
              <button
                onClick={handleQuickViewClick}
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                title="快速查看"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;