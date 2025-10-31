import React, { useState, useEffect } from 'react';
import { Review } from '@/types';
import { ReviewCard, ReviewSummary, ReviewFilter, ReviewPagination, ReviewFilters } from '@/components/reviews';
import { serviceService } from '@/services/services';
import { useI18n } from '@/i18n';

interface ServiceReviewsProps {
  serviceId: string;
  initialReviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  className?: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export const ServiceReviews: React.FC<ServiceReviewsProps> = ({
  serviceId,
  initialReviews = [],
  averageRating = 0,
  totalReviews = 0,
  className = ''
}) => {
  const { formatNumber } = useI18n();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating,
    totalReviews,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReviewFilters>({
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10
  });

  // Calculate rating distribution
  const calculateRatingDistribution = (reviewList: Review[]) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewList.forEach(review => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  // Load reviews
  const loadReviews = async (page = 1, newFilters?: ReviewFilters) => {
    setLoading(true);
    try {
      const response = await serviceService.getServiceReviews(serviceId, {
        ...filters,
        ...newFilters,
        page,
        pageSize: pagination.itemsPerPage
      });

      if (response.success && response.data) {
        setReviews(response.data.results);
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalPages: Math.ceil(response.data!.count / prev.itemsPerPage)
        }));

        // Update stats if this is the first page or no filters
        if (page === 1 && !newFilters?.rating && !newFilters?.search) {
          const avgRating = response.data.results.reduce((sum, review) => sum + review.rating, 0) / response.data.results.length;
          setStats({
            averageRating: avgRating || 0,
            totalReviews: response.data.count,
            ratingDistribution: calculateRatingDistribution(response.data.results)
          });
        }
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: ReviewFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadReviews(1, newFilters);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    loadReviews(page, filters);
  };

  // Handle page size changes
  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, itemsPerPage: pageSize, currentPage: 1 }));
    // Reload with new page size
    setTimeout(() => loadReviews(1, filters), 0);
  };

  // Handle helpful click
  const handleHelpfulClick = async (reviewId: number) => {
    try {
      await serviceService.markReviewHelpful(reviewId.toString());
      // Update the local review
      setReviews(prev => prev.map(review =>
        review.id === reviewId
          ? { ...review, helpfulCount: review.helpfulCount + 1 }
          : review
      ));
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  // Handle reply click
  const handleReplyClick = (reviewId: number) => {
    // This would open a reply modal or expand reply form
    console.log('Reply to review:', reviewId);
  };

  // Handle report click
  const handleReportClick = (reviewId: number) => {
    // This would open a report modal
    console.log('Report review:', reviewId);
  };

  // Load initial data
  useEffect(() => {
    if (initialReviews.length === 0) {
      loadReviews();
    } else {
      setStats({
        averageRating,
        totalReviews,
        ratingDistribution: calculateRatingDistribution(initialReviews)
      });
    }
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">客户评价</h2>
        {stats.totalReviews > 0 && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="text-3xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </span>
              <span className="text-gray-500">/ 5.0</span>
            </div>
            <div className="text-sm text-gray-600">
              ({formatNumber(stats.totalReviews)} 条评价)
            </div>
          </div>
        )}
      </div>

      {/* Reviews Summary */}
      {stats.totalReviews > 0 && (
        <ReviewSummary
          averageRating={stats.averageRating}
          totalReviews={stats.totalReviews}
          ratingDistribution={stats.ratingDistribution}
        />
      )}

      {/* Filters */}
      {stats.totalReviews > 0 && (
        <ReviewFilter
          onFilterChange={handleFilterChange}
          totalReviews={stats.totalReviews}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          // Loading State
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpfulClick={handleHelpfulClick}
              onReplyClick={handleReplyClick}
              onReportClick={handleReportClick}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filters.rating || filters.search ? '没有找到匹配的评价' : '暂无评价'}
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.rating || filters.search
                ? '尝试调整筛选条件查看更多评价'
                : '成为第一个评价此服务的人'
              }
            </p>
            {filters.rating || filters.search ? (
              <button
                onClick={() => handleFilterChange({ sortBy: 'date', sortOrder: 'desc' })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                清除筛选
              </button>
            ) : (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                购买服务后评价
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && reviews.length > 0 && pagination.totalPages > 1 && (
        <ReviewPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={stats.totalReviews}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Write Review CTA */}
      {!loading && stats.totalReviews === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            分享您的体验
          </h3>
          <p className="text-blue-800 mb-4">
            您的评价将帮助其他买家做出更好的决定
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            购买服务后评价
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceReviews;