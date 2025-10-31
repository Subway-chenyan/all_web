import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Service } from '@/types';
import { useI18n } from '@/i18n';
import { useServicesStore } from '@/store/servicesStore';
import ServiceCard from './ServiceCard';
import { cn } from '@/utils';

interface FeaturedServicesProps {
  className?: string;
  limit?: number;
  title?: string;
  showViewAll?: boolean;
}

export const FeaturedServices: React.FC<FeaturedServicesProps> = ({
  className = '',
  limit = 8,
  title = '推荐服务',
  showViewAll = true,
}) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { featuredServices, fetchFeaturedServices } = useServicesStore();

  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const loadFeaturedServices = async () => {
      setIsLoading(true);
      try {
        await fetchFeaturedServices();
      } catch (error) {
        console.error('Failed to load featured services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedServices();
  }, [fetchFeaturedServices]);

  const handleViewAll = () => {
    navigate('/services?featured=true');
  };

  const handleQuickView = (service: Service) => {
    // This would typically open a quick view modal
    // For now, navigate to service detail
    navigate(`/services/${service.id}`);
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {showViewAll && (
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              查看全部
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const servicesToShow = featuredServices.slice(0, limit);

  if (servicesToShow.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1">
            精选的优质服务，满足您的各种需求
          </p>
        </div>
        {showViewAll && (
          <button
            onClick={handleViewAll}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            <span>查看全部</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {servicesToShow.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            viewMode="grid"
            onQuickView={handleQuickView}
          />
        ))}
      </div>

      {/* View All Button (Mobile) */}
      {showViewAll && (
        <div className="flex justify-center md:hidden">
          <button
            onClick={handleViewAll}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            查看所有推荐服务
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturedServices;