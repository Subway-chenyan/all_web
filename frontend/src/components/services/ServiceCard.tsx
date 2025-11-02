import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Clock, User } from 'lucide-react';
import type { Service } from '../../types';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface ServiceCardProps {
  service: Service;
  onLike?: (serviceId: string) => void;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onLike, className }) => {
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(service.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/services/${service.id}`} className={`block ${className}`}>
      <div className="service-card">
        {/* Service Image */}
        <div className="relative">
          {service.images && service.images.length > 0 ? (
            <img
              src={service.images[0]}
              alt={service.title}
              className="service-image"
            />
          ) : (
            <div className="service-image flex items-center justify-center">
              <div className="text-gray-400 text-4xl">📦</div>
            </div>
          )}

          {/* Like button */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
          </button>

          {/* Seller badge */}
          {service.seller.isVerified && (
            <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
              认证卖家
            </div>
          )}
        </div>

        <div className="service-content">
          {/* Seller info */}
          <div className="service-seller">
            {service.seller.avatar ? (
              <img
                src={service.seller.avatar}
                alt={service.seller.username}
                className="seller-avatar"
              />
            ) : (
              <div className="seller-avatar flex items-center justify-center">
                <User className="h-3 w-3 text-gray-600" />
              </div>
            )}
            <span className="seller-name">{service.seller.username}</span>
          </div>

          {/* Service title */}
          <h3 className="service-title hover:text-green-600 transition-colors">
            {service.title}
          </h3>

          {/* Service description */}
          <p className="service-description">
            {service.description}
          </p>

          {/* Rating and reviews */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium">{service.rating.toFixed(1)}</span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-sm text-gray-600">({service.reviewCount})</span>
            <span className="mx-2 text-gray-300">•</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 text-gray-400 mr-1" />
              <span className="text-sm text-gray-600">{service.deliveryTime}天</span>
            </div>
          </div>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {service.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {service.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{service.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Price and order button */}
          <div className="service-footer">
            <div>
              <span className="text-xs text-gray-500">起价</span>
              <div className="service-price">
                {formatPrice(service.price)}
              </div>
            </div>
            <button
              className="btn btn-small btn-primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              立即下单
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;