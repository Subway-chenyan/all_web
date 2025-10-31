import React from 'react';
import { Shield, CheckCircle, Award, Star, Users, Zap, Globe, School, Briefcase } from 'lucide-react';
import { cn } from '@/utils';

export interface VerificationBadge {
  type: 'identity' | 'email' | 'phone' | 'professional' | 'top_rated' | 'rising_talent' | 'expert_vetted' | 'language' | 'education' | 'work_experience';
  label: string;
  description: string;
  verified: boolean;
  verifiedDate?: Date;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
}

export interface VerificationBadgesProps {
  badges: VerificationBadge[];
  title?: string;
  layout?: 'grid' | 'list' | 'compact';
  showUnverified?: boolean;
  className?: string;
  onBadgeClick?: (badge: VerificationBadge) => void;
}

const VerificationBadges: React.FC<VerificationBadgesProps> = ({
  badges,
  title = '认证与徽章',
  layout = 'grid',
  showUnverified = true,
  className = '',
  onBadgeClick,
}) => {
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'identity':
        return <Shield className="w-5 h-5" />;
      case 'email':
      case 'phone':
        return <CheckCircle className="w-5 h-5" />;
      case 'professional':
        return <Briefcase className="w-5 h-5" />;
      case 'top_rated':
        return <Star className="w-5 h-5" />;
      case 'rising_talent':
        return <Zap className="w-5 h-5" />;
      case 'expert_vetted':
        return <Award className="w-5 h-5" />;
      case 'language':
        return <Globe className="w-5 h-5" />;
      case 'education':
        return <School className="w-5 h-5" />;
      case 'work_experience':
        return <Briefcase className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getBadgeStyle = (type: string, verified: boolean) => {
    if (!verified) {
      return {
        color: 'text-gray-400',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: <CheckCircle className="w-5 h-5" />
      };
    }

    switch (type) {
      case 'identity':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: <Shield className="w-5 h-5" />
        };
      case 'email':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'phone':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'professional':
        return {
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          icon: <Briefcase className="w-5 h-5" />
        };
      case 'top_rated':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: <Star className="w-5 h-5" />
        };
      case 'rising_talent':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: <Zap className="w-5 h-5" />
        };
      case 'expert_vetted':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <Award className="w-5 h-5" />
        };
      case 'language':
        return {
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
          borderColor: 'border-cyan-200',
          icon: <Globe className="w-5 h-5" />
        };
      case 'education':
        return {
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
          icon: <School className="w-5 h-5" />
        };
      case 'work_experience':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          icon: <Briefcase className="w-5 h-5" />
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <CheckCircle className="w-5 h-5" />
        };
    }
  };

  const visibleBadges = showUnverified
    ? badges
    : badges.filter(badge => badge.verified);

  const renderBadge = (badge: VerificationBadge) => {
    const style = getBadgeStyle(badge.type, badge.verified);
    const Icon = badge.icon || style.icon;

    if (layout === 'compact') {
      return (
        <div
          key={badge.type}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm font-medium cursor-pointer transition-all duration-200',
            style.bgColor,
            style.color,
            style.borderColor,
            'hover:shadow-sm'
          )}
          onClick={() => onBadgeClick?.(badge)}
          title={badge.description}
        >
          <Icon className="w-4 h-4" />
          <span>{badge.label}</span>
          {badge.verified && (
            <CheckCircle className="w-3 h-3" />
          )}
        </div>
      );
    }

    if (layout === 'list') {
      return (
        <div
          key={badge.type}
          className={cn(
            'flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
            style.bgColor,
            style.borderColor
          )}
          onClick={() => onBadgeClick?.(badge)}
        >
          <div className={cn('p-2 rounded-lg', style.bgColor)}>
            <Icon className={cn('w-6 h-6', style.color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn('font-semibold', badge.verified ? 'text-gray-900' : 'text-gray-500')}>
                {badge.label}
              </h4>
              {badge.verified && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
            <p className="text-sm text-gray-600">{badge.description}</p>
            {badge.verifiedDate && (
              <p className="text-xs text-gray-500 mt-1">
                认证时间: {badge.verifiedDate.toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Default grid layout
    return (
      <div
        key={badge.type}
        className={cn(
          'flex flex-col items-center text-center p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
          style.bgColor,
          style.borderColor
        )}
        onClick={() => onBadgeClick?.(badge)}
      >
        <div className={cn('p-3 rounded-full mb-3', style.bgColor)}>
          <Icon className={cn('w-8 h-8', style.color)} />
        </div>
        <h4 className={cn(
          'font-semibold text-sm mb-2 leading-chinese',
          badge.verified ? 'text-gray-900' : 'text-gray-500'
        )}>
          {badge.label}
        </h4>
        <p className="text-xs text-gray-600 leading-chinese line-clamp-2">
          {badge.description}
        </p>
        {badge.verified && (
          <CheckCircle className="w-4 h-4 text-green-600 mt-2" />
        )}
        {badge.verifiedDate && (
          <p className="text-xs text-gray-500 mt-1">
            {badge.verifiedDate.toLocaleDateString('zh-CN')}
          </p>
        )}
      </div>
    );
  };

  if (visibleBadges.length === 0) {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>暂无认证徽章</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      <div className={cn(
        layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' :
        layout === 'list' ? 'space-y-3' :
        'flex flex-wrap gap-2'
      )}>
        {visibleBadges.map(renderBadge)}
      </div>

      {!showUnverified && badges.some(b => !b.verified) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="text-sm text-gray-600 hover:text-gray-900">
            显示未完成的认证 ({badges.filter(b => !b.verified).length})
          </button>
        </div>
      )}
    </div>
  );
};

export default VerificationBadges;