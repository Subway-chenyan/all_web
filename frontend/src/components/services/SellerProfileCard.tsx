import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  Award,
  Calendar,
  Users,
  TrendingUp,
  ExternalLink,
  Shield,
  Globe,
  Languages
} from 'lucide-react';
import { User, UserProfile } from '@/types';
import { useI18n } from '@/i18n';

interface SellerProfileCardProps {
  seller: User;
  sellerProfile: UserProfile;
  className?: string;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: string;
}

const SellerBadges: React.FC<{ badges: Badge[] }> = ({ badges }) => {
  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'silver': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'platinum': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getBadgeIcon = (level: string) => {
    switch (level) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '🏆';
    }
  };

  if (!badges.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.slice(0, 3).map((badge) => (
        <div
          key={badge.id}
          className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getBadgeColor(badge.level)}`}
          title={badge.description}
        >
          <span>{getBadgeIcon(badge.level)}</span>
          <span>{badge.name}</span>
        </div>
      ))}
      {badges.length > 3 && (
        <div className="flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
          +{badges.length - 3}
        </div>
      )}
    </div>
  );
};

const LanguageSkills: React.FC<{ languages: any[] }> = ({ languages }) => {
  const getProficiencyLabel = (proficiency: string) => {
    switch (proficiency) {
      case 'native': return '母语';
      case 'fluent': return '流利';
      case 'conversational': return '日常对话';
      case 'basic': return '基础';
      default: return proficiency;
    }
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'native': return 'text-green-600 bg-green-50';
      case 'fluent': return 'text-blue-600 bg-blue-50';
      case 'conversational': return 'text-yellow-600 bg-yellow-50';
      case 'basic': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center text-sm font-medium text-gray-900 mb-2">
        <Languages className="w-4 h-4 mr-1" />
        语言能力
      </div>
      <div className="flex flex-wrap gap-2">
        {languages.map((lang, index) => (
          <div
            key={index}
            className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(lang.proficiency)}`}
          >
            {lang.language} ({getProficiencyLabel(lang.proficiency)})
          </div>
        ))}
      </div>
    </div>
  );
};

export const SellerProfileCard: React.FC<SellerProfileCardProps> = ({
  seller,
  sellerProfile,
  className = ''
}) => {
  const { t, formatCurrency, formatDate } = useI18n();
  const [isContacting, setIsContacting] = useState(false);

  const handleContactSeller = () => {
    setIsContacting(true);
    // This would open a contact modal or navigate to messages
    setTimeout(() => setIsContacting(false), 1000);
  };

  const completionRate = sellerProfile.completedProjects
    ? Math.round((sellerProfile.completedProjects / Math.max(sellerProfile.completedProjects + 5, 1)) * 100)
    : 0;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-6">
          <Link to={`/profile/${seller.id}`}>
            <img
              src={sellerProfile.avatar || '/default-avatar.png'}
              alt={sellerProfile.displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/profile/${seller.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200"
            >
              {sellerProfile.displayName}
            </Link>
            {sellerProfile.isVerified && (
              <div className="flex items-center mt-1">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">已认证</span>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {sellerProfile.bio}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-900">
              {sellerProfile.averageRating?.toFixed(1) || '0.0'}
            </div>
            <div className="flex items-center justify-center mt-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {sellerProfile.totalReviews || 0} 评价
              </span>
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-900">
              {sellerProfile.completedProjects || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">已完成订单</div>
          </div>
        </div>

        {/* Response Stats */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              平均响应时间
            </div>
            <span className="font-medium text-gray-900">
              {sellerProfile.responseTime || 1}小时内
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              完成率
            </div>
            <span className="font-medium text-gray-900">{completionRate}%</span>
          </div>
          {sellerProfile.location && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                位置
              </div>
              <span className="font-medium text-gray-900">{sellerProfile.location}</span>
            </div>
          )}
        </div>

        {/* Languages */}
        {sellerProfile.languages?.length > 0 && (
          <div className="mb-6">
            <LanguageSkills languages={sellerProfile.languages} />
          </div>
        )}

        {/* Badges */}
        {sellerProfile.badges?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center text-sm font-medium text-gray-900 mb-2">
              <Award className="w-4 h-4 mr-1" />
              成就徽章
            </div>
            <SellerBadges badges={sellerProfile.badges} />
          </div>
        )}

        {/* Member Since */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <Calendar className="w-4 h-4 mr-2" />
          <span>加入时间: {formatDate(seller.createdAt)}</span>
        </div>

        {/* Skills */}
        {sellerProfile.skills?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">技能专长</h4>
            <div className="flex flex-wrap gap-2">
              {sellerProfile.skills.slice(0, 6).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
              {sellerProfile.skills.length > 6 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  +{sellerProfile.skills.length - 6}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact & View Profile */}
        <div className="space-y-3">
          <button
            onClick={handleContactSeller}
            disabled={isContacting}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{isContacting ? '连接中...' : '联系卖家'}</span>
          </button>

          <Link
            to={`/profile/${seller.id}`}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <ExternalLink className="w-5 h-5" />
            <span>查看完整资料</span>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              身份验证
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {sellerProfile.totalReviews || 0} 位客户
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfileCard;