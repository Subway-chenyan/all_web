import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '@/types';
import { useI18n } from '@/i18n';
import { formatCurrency } from '@/i18n';
import { Star, MapPin, Clock } from 'lucide-react';

interface RelatedServicesProps {
  services: Service[];
  title?: string;
  className?: string;
}

interface ServiceCardProps {
  service: Service;
  showSeller?: boolean;
  compact?: boolean;
}

const RelatedServiceCard: React.FC<ServiceCardProps> = ({
  service,
  showSeller = true,
  compact = false
}) => {
  const { formatDate } = useI18n();

  return (
    <Link
      to={`/services/${service.id}`}
      className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300"
    >
      {/* Service Image */}
      <div className={`relative ${compact ? 'h-32' : 'h-48'} bg-gray-100`}>
        {service.images.length > 0 ? (
          <img
            src={service.images[0]}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}

        {/* Featured Badge */}
        {service.isFeatured && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
              推荐
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.preventDefault();
              // Add to favorites
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Service Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {service.title}
        </h3>

        {/* Description */}
        {!compact && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {service.description}
          </p>
        )}

        {/* Tags */}
        {service.tags.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1 mb-3">
            {service.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {service.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{service.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Seller Info */}
        {showSeller && (
          <div className="flex items-center space-x-2 mb-3">
            <img
              src={service.seller.profile.avatar || '/default-avatar.png'}
              alt={service.seller.profile.displayName}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600">
              {service.seller.profile.displayName}
            </span>
            {service.seller.profile.isVerified && (
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{service.averageRating.toFixed(1)}</span>
            <span>({service.totalReviews})</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{service.orderCount}</span>
            <span>订单</span>
          </div>
        </div>

        {/* Price and Delivery */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(service.price)}
            </span>
            {service.priceType !== 'fixed' && (
              <span className="text-sm text-gray-600 ml-1">
                /{service.priceType === 'hourly' ? '小时' : '起'}
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{service.deliveryTime}天</span>
          </div>
        </div>

        {/* Category */}
        {service.category && !compact && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              {service.category.name} {service.subcategory && `> ${service.subcategory.name}`}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export const RelatedServices: React.FC<RelatedServicesProps> = ({
  services,
  title = '相关服务',
  className = ''
}) => {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">
          共 {services.length} 个服务
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => (
          <RelatedServiceCard
            key={service.id}
            service={service}
            showSeller={true}
            compact={false}
          />
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center">
        <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200">
          查看更多相关服务
        </button>
      </div>
    </div>
  );
};

export default RelatedServices;