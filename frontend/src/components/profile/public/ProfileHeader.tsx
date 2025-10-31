import React from 'react';
import { MapPin, Star, Calendar, Shield, Award, CheckCircle, Mail, Phone, Globe, TrendingUp } from 'lucide-react';
import { cn } from '@/utils';

export interface ProfileHeaderProps {
  profile: {
    name: string;
    title: string;
    avatar: string;
    coverImage?: string;
    bio: string;
    location?: string;
    joinedDate: Date;
    rating: number;
    totalReviews: number;
    completedOrders: number;
    responseTime?: string;
    languages?: string[];
    verificationStatus: {
      email: boolean;
      phone: boolean;
      identity: boolean;
      professional?: boolean;
    };
    badges?: {
      type: 'top_rated' | 'rising_talent' | 'expert' | 'verified';
      label: string;
      description?: string;
    }[];
    contact?: {
      email?: string;
      phone?: string;
      website?: string;
    };
  };
  showContact?: boolean;
  className?: string;
  onContactClick?: () => void;
  onFollowClick?: () => void;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  showContact = true,
  className = '',
  onContactClick,
  onFollowClick,
  isFollowing = false,
  isOwnProfile = false,
}) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
        ))}
        {hasHalfStar && (
          <Star className="w-4 h-4 text-yellow-400 fill-current opacity-50" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  const getBadgeInfo = (type: string) => {
    switch (type) {
      case 'top_rated':
        return {
          icon: <Award className="w-4 h-4" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-300',
        };
      case 'rising_talent':
        return {
          icon: <TrendingUp className="w-4 h-4" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
        };
      case 'expert':
        return {
          icon: <Shield className="w-4 h-4" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
        };
      case 'verified':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
        };
      default:
        return {
          icon: <Award className="w-4 h-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
        };
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Cover Image */}
      {profile.coverImage ? (
        <div className="h-48 md:h-64 bg-gray-200 relative overflow-hidden">
          <img
            src={profile.coverImage}
            alt={`${profile.name} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-r from-red-500 to-pink-500" />
      )}

      <div className="container mx-auto px-4 -mt-16 md:-mt-20">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {profile.verificationStatus.identity && (
                  <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-2 border-2 border-white">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Name and Title */}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-chinese">
                    {profile.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-3 leading-chinese">
                    {profile.title}
                  </p>

                  {/* Bio */}
                  <p className="text-gray-700 mb-4 leading-chinese line-clamp-3">
                    {profile.bio}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {renderStars(profile.rating)}
                      <span className="ml-1 text-sm font-medium text-gray-900">
                        {profile.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({profile.totalReviews} 条评价)
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">
                        {profile.completedOrders}
                      </span>
                      {' '}个已完成订单
                    </div>
                    {profile.responseTime && (
                      <div className="text-sm text-gray-600">
                        响应时间: <span className="font-medium text-gray-900">{profile.responseTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Location and Join Date */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {profile.joinedDate.toLocaleDateString('zh-CN')} 加入
                      </span>
                    </div>
                    {profile.languages && profile.languages.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <span>{profile.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Verification Status */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {profile.verificationStatus.email && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>邮箱已验证</span>
                      </div>
                    )}
                    {profile.verificationStatus.phone && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>手机已验证</span>
                      </div>
                    )}
                    {profile.verificationStatus.professional && (
                      <div className="flex items-center gap-1 text-sm text-blue-600">
                        <Shield className="w-4 h-4" />
                        <span>专业认证</span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  {profile.badges && profile.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.badges.map((badge, index) => {
                        const badgeInfo = getBadgeInfo(badge.type);
                        return (
                          <div
                            key={index}
                            className={cn(
                              'inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 text-sm font-medium',
                              badgeInfo.bgColor,
                              badgeInfo.color,
                              badgeInfo.borderColor
                            )}
                            title={badge.description}
                          >
                            {badgeInfo.icon}
                            <span>{badge.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  {!isOwnProfile && (
                    <>
                      {showContact && (
                        <button
                          onClick={onContactClick}
                          className="px-6 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
                        >
                          联系卖家
                        </button>
                      )}
                      {onFollowClick && (
                        <button
                          onClick={onFollowClick}
                          className={cn(
                            'px-6 py-2 font-medium rounded-lg transition-colors duration-200 border-2',
                            isFollowing
                              ? 'bg-white text-red-600 border-red-600 hover:bg-red-50'
                              : 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                          )}
                        >
                          {isFollowing ? '已关注' : '关注'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              {showContact && profile.contact && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">联系方式</h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {profile.contact.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{profile.contact.email}</span>
                      </div>
                    )}
                    {profile.contact.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{profile.contact.phone}</span>
                      </div>
                    )}
                    {profile.contact.website && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <a
                          href={profile.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {profile.contact.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;