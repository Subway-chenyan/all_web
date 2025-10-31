import React from 'react';
import { Star, TrendingUp, Award, Code, Palette, PenTool, Camera, Music, Video, Mic, Briefcase } from 'lucide-react';
import { cn } from '@/utils';

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
  category: string;
  experience?: string;
  description?: string;
  endorsements?: number;
  featured?: boolean;
}

export interface SkillsDisplayProps {
  skills: Skill[];
  title?: string;
  showEndorsements?: boolean;
  showLevel?: boolean;
  showCategories?: boolean;
  groupByCategory?: boolean;
  maxItems?: number;
  className?: string;
  onSkillClick?: (skill: Skill) => void;
  onEndorseClick?: (skillId: string) => void;
}

const SkillsDisplay: React.FC<SkillsDisplayProps> = ({
  skills,
  title = '技能专长',
  showEndorsements = true,
  showLevel = true,
  showCategories = true,
  groupByCategory = false,
  maxItems,
  className = '',
  onSkillClick,
  onEndorseClick,
}) => {
  const getSkillIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('program') || lowerCategory.includes('code') || lowerCategory.includes('开发')) {
      return <Code className="w-4 h-4" />;
    }
    if (lowerCategory.includes('design') || lowerCategory.includes('设计')) {
      return <Palette className="w-4 h-4" />;
    }
    if (lowerCategory.includes('write') || lowerCategory.includes('写作') || lowerCategory.includes('编辑')) {
      return <PenTool className="w-4 h-4" />;
    }
    if (lowerCategory.includes('photo') || lowerCategory.includes('摄影')) {
      return <Camera className="w-4 h-4" />;
    }
    if (lowerCategory.includes('music') || lowerCategory.includes('音乐')) {
      return <Music className="w-4 h-4" />;
    }
    if (lowerCategory.includes('video') || lowerCategory.includes('视频')) {
      return <Video className="w-4 h-4" />;
    }
    if (lowerCategory.includes('voice') || lowerCategory.includes('配音') || lowerCategory.includes('音频')) {
      return <Mic className="w-4 h-4" />;
    }
    return <Briefcase className="w-4 h-4" />;
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 5:
        return 'text-green-600 bg-green-100';
      case 4:
        return 'text-blue-600 bg-blue-100';
      case 3:
        return 'text-purple-600 bg-purple-100';
      case 2:
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 5:
        return '专家';
      case 4:
        return '高级';
      case 3:
        return '中级';
      case 2:
        return '初级';
      default:
        return '入门';
    }
  };

  const renderStars = (level: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-3 h-3',
              i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const displaySkills = maxItems ? skills.slice(0, maxItems) : skills;

  if (groupByCategory) {
    const skillsByCategory = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);

    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category} className="mb-6 last:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                {getSkillIcon(category)}
              </div>
              <h4 className="text-md font-semibold text-gray-900">
                {category}
              </h4>
              <span className="text-sm text-gray-500">
                ({categorySkills.length})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                    skill.featured
                      ? 'border-red-200 bg-red-50 hover:border-red-300'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                  onClick={() => onSkillClick?.(skill)}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">
                        {skill.name}
                      </h5>
                      {skill.experience && (
                        <p className="text-xs text-gray-600">{skill.experience}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {showLevel && (
                      <div className="flex items-center gap-1">
                        {renderStars(skill.level)}
                      </div>
                    )}
                    {showEndorsements && skill.endorsements && (
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-gray-600">
                          {skill.endorsements}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {maxItems && skills.length > maxItems && (
          <div className="mt-6 text-center">
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              查看全部 {skills.length} 项技能
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>

      {displaySkills.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>暂未添加技能</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displaySkills.map((skill) => (
            <div
              key={skill.id}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                skill.featured
                  ? 'border-red-200 bg-red-50 hover:border-red-300'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
              onClick={() => onSkillClick?.(skill)}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'p-3 rounded-lg',
                  skill.featured ? 'bg-red-100' : 'bg-gray-50'
                )}>
                  {getSkillIcon(skill.category)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {skill.name}
                    </h4>
                    {skill.featured && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        精选技能
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {showCategories && (
                      <span>{skill.category}</span>
                    )}
                    {skill.experience && (
                      <span>{skill.experience}</span>
                    )}
                    {showLevel && (
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        getLevelColor(skill.level)
                      )}>
                        {getLevelLabel(skill.level)}
                      </span>
                    )}
                  </div>

                  {skill.description && (
                    <p className="text-sm text-gray-600 mt-2 leading-chinese">
                      {skill.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {showLevel && (
                  <div className="flex flex-col items-end">
                    {renderStars(skill.level)}
                    <span className="text-xs text-gray-500 mt-1">
                      {getLevelLabel(skill.level)}
                    </span>
                  </div>
                )}

                {showEndorsements && (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {skill.endorsements || 0}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEndorseClick?.(skill.id);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 mt-1"
                    >
                      推荐
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>热门</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {maxItems && skills.length > maxItems && (
        <div className="mt-6 text-center">
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
            查看全部 {skills.length} 项技能
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillsDisplay;