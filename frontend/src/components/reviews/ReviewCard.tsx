import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, Flag, MoreHorizontal, User } from 'lucide-react';
import { Review } from '@/types';
import { useI18n } from '@/i18n';

interface ReviewCardProps {
  review: Review;
  showServiceInfo?: boolean;
  onHelpfulClick?: (reviewId: number) => void;
  onReplyClick?: (reviewId: number) => void;
  onReportClick?: (reviewId: number) => void;
  className?: string;
}

interface RatingDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  size = 'md',
  showValue = true
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${getSizeClass()} ${
            star <= rating
              ? 'text-yellow-500 fill-current'
              : 'text-gray-300'
          }`}
        />
      ))}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-gray-900">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showServiceInfo = false,
  onHelpfulClick,
  onReplyClick,
  onReportClick,
  className = ''
}) => {
  const { formatDate } = useI18n();
  const [hasVoted, setHasVoted] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const handleHelpfulClick = () => {
    if (!hasVoted && onHelpfulClick) {
      onHelpfulClick(review.id);
      setHasVoted(true);
    }
  };

  const handleReply = () => {
    setIsReplying(!isReplying);
    onReplyClick?.(review.id);
  };

  const handleReport = () => {
    onReportClick?.(review.id);
    setShowActions(false);
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return '今天';
    if (diffInDays === 1) return '昨天';
    if (diffInDays < 7) return `${diffInDays}天前`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}周前`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}个月前`;
    return `${Math.floor(diffInDays / 365)}年前`;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Review Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {review.reviewer.avatar ? (
              <img
                src={review.reviewer.avatar}
                alt={review.reviewer.profile.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">
                {review.reviewer.profile.displayName}
              </h4>
              {review.reviewer.isVerified && (
                <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <RatingDisplay rating={review.rating} size="sm" />
              <span className="text-sm text-gray-500">
                {getRelativeTime(review.createdAt)}
              </span>
              {showServiceInfo && review.order && (
                <span className="text-sm text-gray-500">
                  购买了 {review.order.service.title}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={handleReport}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <Flag className="w-4 h-4" />
                <span>举报评价</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {review.comment}
        </p>
      </div>

      {/* Seller Response */}
      {review.response && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900">卖家回复</span>
                <span className="text-xs text-gray-500">
                  {getRelativeTime(review.updatedAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {review.response}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleHelpfulClick}
            disabled={hasVoted}
            className={`flex items-center space-x-1 text-sm transition-colors duration-200 ${
              hasVoted
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
            <span>有帮助 ({review.helpfulCount})</span>
          </button>

          <button
            onClick={handleReply}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <MessageSquare className="w-4 h-4" />
            <span>回复</span>
          </button>
        </div>

        <div className="text-xs text-gray-500">
          {formatDate(review.createdAt)}
        </div>
      </div>

      {/* Reply Form (simplified) */}
      {isReplying && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <textarea
            placeholder="写下您的回复..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
          <div className="flex items-center justify-end space-x-2 mt-2">
            <button
              onClick={() => setIsReplying(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              取消
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
              发送回复
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;