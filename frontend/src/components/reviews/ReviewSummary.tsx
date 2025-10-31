import React from 'react';
import { Star } from 'lucide-react';
import { useI18n } from '@/i18n';

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  className?: string;
}

interface RatingBarProps {
  rating: number;
  count: number;
  percentage: number;
}

const RatingBar: React.FC<RatingBarProps> = ({ rating, count, percentage }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-1 text-sm text-gray-600 w-12">
        <span>{rating}</span>
        <Star className="w-4 h-4 text-yellow-500 fill-current" />
      </div>
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-yellow-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 w-12 text-right">
        {count}
      </span>
    </div>
  );
};

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  totalReviews,
  ratingDistribution,
  className = ''
}) => {
  const { formatNumber } = useI18n();

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5: return '非常满意';
      case 4: return '满意';
      case 3: return '一般';
      case 2: return '不满意';
      case 1: return '非常不满意';
      default: return '';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    if (rating >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">评价统计</h3>

      {/* Overall Rating */}
      <div className="flex items-center justify-center mb-8">
        <div className="text-center">
          <div className={`text-5xl font-bold ${getRatingColor(averageRating)} mb-2`}>
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= averageRating
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-gray-600">
            基于 {formatNumber(totalReviews)} 条评价
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingDistribution[rating as keyof typeof ratingDistribution];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <RatingBar
              key={rating}
              rating={rating}
              count={count}
              percentage={percentage}
            />
          );
        })}
      </div>

      {/* Rating Labels */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span className="text-gray-600">4-5星 满意</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-100 rounded"></div>
            <span className="text-gray-600">3星 一般</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-100 rounded"></div>
            <span className="text-gray-600">1-2星 不满意</span>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      {totalReviews >= 10 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>可信评价</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>已验证买家</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;