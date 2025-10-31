import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { useI18n } from '@/i18n';
import { useServicesStore } from '@/store/servicesStore';
import { cn } from '@/utils';

interface TopSellersProps {
  className?: string;
  limit?: number;
  title?: string;
  showViewAll?: boolean;
}

export const TopSellers: React.FC<TopSellersProps> = ({
  className = '',
  limit = 8,
  title = '顶级卖家',
  showViewAll = true,
}) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { topSellers, fetchTopSellers } = useServicesStore();

  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const loadTopSellers = async () => {
      setIsLoading(true);
      try {
        await fetchTopSellers();
      } catch (error) {
        console.error('Failed to load top sellers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopSellers();
  }, [fetchTopSellers]);

  const handleViewAll = () => {
    navigate('/sellers?sort=rating');
  };

  const handleSellerClick = (seller: User) => {
    navigate(`/sellers/${seller.id}`);
  };

  const handleContactSeller = (e: React.MouseEvent, seller: User) => {
    e.stopPropagation();
    navigate(`/messages/new?seller=${seller.id}`);
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
              <div className="bg-white rounded-lg shadow-sm p-4 text-center space-y-3">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-full mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sellersToShow = topSellers.slice(0, limit);

  if (sellersToShow.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1">
            经验丰富的专业卖家，提供优质服务
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

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sellersToShow.map((seller, index) => (
          <div
            key={seller.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center cursor-pointer group"
            onClick={() => handleSellerClick(seller)}
          >
            {/* Rank Badge */}
            {index < 3 && (
              <div className={cn(
                'absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm',
                index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
              )}>
                {index + 1}
              </div>
            )}

            {/* Avatar */}
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-200">
                {seller.profile?.avatar ? (
                  <img
                    src={seller.profile.avatar}
                    alt={seller.profile.displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {seller.firstName?.[0] || seller.username?.[0] || 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* Online Indicator */}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            </div>

            {/* Seller Info */}
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
              {seller.profile?.displayName || seller.username}
            </h3>

            {/* Bio */}
            {seller.profile?.bio && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {seller.profile.bio}
              </p>
            )}

            {/* Rating */}
            {seller.profile?.averageRating && (
              <div className="flex items-center justify-center space-x-1 mb-3">
                {renderStars(seller.profile.averageRating)}
                <span className="text-sm text-gray-600">
                  ({seller.profile.totalReviews})
                </span>
              </div>
            )}

            {/* Skills */}
            {seller.profile?.skills && seller.profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center mb-4">
                {seller.profile.skills.slice(0, 3).map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {seller.profile.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{seller.profile.skills.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <div className="flex justify-between">
                <span>订单数</span>
                <span className="font-medium">{seller.profile?.completedProjects || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>响应时间</span>
                <span className="font-medium">{seller.profile?.responseTime || 1}小时</span>
              </div>
              {seller.profile?.hourlyRate && (
                <div className="flex justify-between">
                  <span>时薪</span>
                  <span className="font-medium">¥{seller.profile.hourlyRate}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSellerClick(seller);
                }}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                查看资料
              </button>
              <button
                onClick={(e) => handleContactSeller(e, seller)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                联系
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button (Mobile) */}
      {showViewAll && (
        <div className="flex justify-center md:hidden">
          <button
            onClick={handleViewAll}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            查看所有顶级卖家
          </button>
        </div>
      )}
    </div>
  );
};

export default TopSellers;