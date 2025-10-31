import React from 'react';
import { Users, Star, TrendingUp, Award, Briefcase, Globe, Clock, Heart, MessageSquare } from 'lucide-react';
import { cn } from '@/utils';

export interface SocialProofProps {
  profile: {
    totalEarnings?: number;
    totalOrders?: number;
    totalClients?: number;
    repeatClientRate?: number;
    averageOrderValue?: number;
    responseTime?: string;
    memberSince: Date;
    totalReviews?: number;
    averageRating?: number;
    featuredIn?: string[];
    certifications?: string[];
    languages?: string[];
  };
  title?: string;
  layout?: 'grid' | 'list' | 'compact';
  showEarnings?: boolean;
  showRatings?: boolean;
  className?: string;
}

const SocialProof: React.FC<SocialProofProps> = ({
  profile,
  title = '信任指标',
  layout = 'grid',
  showEarnings = true,
  showRatings = true,
  className = '',
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toLocaleString();
  };

  const getDuration = (startDate: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years}年${months > 0 ? months + '个月' : ''}`;
    }
    return `${months}个月`;
  };

  const stats = [
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: '完成订单',
      value: profile.totalOrders || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: '服务客户',
      value: profile.totalClients || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: '回头客率',
      value: `${profile.repeatClientRate || 0}%`,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: '平均订单价值',
      value: formatCurrency(profile.averageOrderValue || 0),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (showEarnings && profile.totalEarnings) {
    stats.unshift({
      icon: <Award className="w-5 h-5" />,
      label: '总收入',
      value: formatCurrency(profile.totalEarnings),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    });
  }

  if (showRatings && profile.averageRating) {
    stats.push({
      icon: <Star className="w-5 h-5" />,
      label: '平均评分',
      value: `${profile.averageRating.toFixed(1)}/5.0`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    });
  }

  const renderCompact = () => (
    <div className="flex flex-wrap gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded', stat.bgColor)}>
            <div className={cn('w-4 h-4', stat.color)}>
              {stat.icon}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">{stat.label}</div>
            <div className="text-sm font-semibold text-gray-900">{stat.value}</div>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-gray-50">
          <Clock className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <div className="text-xs text-gray-600">平台经验</div>
          <div className="text-sm font-semibold text-gray-900">
            {getDuration(profile.memberSince)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-4">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', stat.bgColor)}>
              <div className={cn('w-5 h-5', stat.color)}>
                {stat.icon}
              </div>
            </div>
            <span className="font-medium text-gray-900">{stat.label}</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{stat.value}</span>
        </div>
      ))}

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <span className="font-medium text-gray-900">平台经验</span>
        </div>
        <span className="text-lg font-bold text-gray-900">
          {getDuration(profile.memberSince)}
        </span>
      </div>

      {profile.responseTime && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">平均响应时间</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {profile.responseTime}
          </span>
        </div>
      )}
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
          <div className={cn('p-3 rounded-lg mx-auto w-fit mb-3', stat.bgColor)}>
            <div className={cn('w-6 h-6', stat.color)}>
              {stat.icon}
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}

      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="p-3 rounded-lg mx-auto w-fit mb-3 bg-gray-100">
          <Clock className="w-6 h-6 text-gray-600" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {getDuration(profile.memberSince)}
        </div>
        <div className="text-sm text-gray-600">平台经验</div>
      </div>
    </div>
  );

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      {layout === 'compact' && renderCompact()}
      {layout === 'list' && renderList()}
      {layout === 'grid' && renderGrid()}

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {profile.totalReviews && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{formatNumber(profile.totalReviews)} 条评价</span>
            </div>
          )}
          {profile.languages && profile.languages.length > 0 && (
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>{profile.languages.join(', ')}</span>
            </div>
          )}
        </div>

        {profile.certifications && profile.certifications.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">专业认证</h4>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map((cert, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.featuredIn && profile.featuredIn.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">媒体报道</h4>
            <div className="flex flex-wrap gap-2">
              {profile.featuredIn.map((media, index) => (
                <span
                  key={index}
                  className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {media}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialProof;