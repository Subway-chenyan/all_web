import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Trophy,
  Star,
  Target,
  TrendingUp,
  Zap,
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { ProfileCompletion as ProfileCompletionType } from '@/types/profile';

interface ProfileCompletionProps {
  completion: ProfileCompletionType;
  onNavigateToSection?: (section: string) => void;
  showTips?: boolean;
  compact?: boolean;
}

const COMPLETION_LEVELS = [
  { threshold: 0, level: 'beginner', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Circle, title: '初级' },
  { threshold: 25, level: 'starter', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Star, title: '入门' },
  { threshold: 50, level: 'intermediate', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: TrendingUp, title: '进阶' },
  { threshold: 75, level: 'advanced', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Target, title: '高级' },
  { threshold: 90, level: 'expert', color: 'text-green-600', bgColor: 'bg-green-100', icon: Trophy, title: '专家' },
  { threshold: 100, level: 'master', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Award, title: '大师' }
];

const SECTION_INFO = {
  basicInfo: {
    title: '基本信息',
    description: '完善个人基本资料',
    icon: '👤',
    weight: 20,
    tips: [
      '上传清晰的头像照片',
      '填写完整的个人简介',
      '设置专业的职位头衔',
      '添加地理位置信息'
    ]
  },
  professionalInfo: {
    title: '职业信息',
    description: '展示您的专业背景',
    icon: '💼',
    weight: 15,
    tips: [
      '设置专业职位头衔',
      '填写时薪或项目报价',
      '说明您的可用状态',
      '添加行业经验年限'
    ]
  },
  contactInfo: {
    title: '联系信息',
    description: '方便客户联系您',
    icon: '📞',
    weight: 10,
    tips: [
      '验证邮箱地址',
      '添加联系电话',
      '设置时区信息',
      '完善网站链接'
    ]
  },
  skills: {
    title: '技能专长',
    description: '展示您的专业能力',
    icon: '⚡',
    weight: 15,
    tips: [
      '添加核心技能标签',
      '设置技能熟练程度',
      '说明技能使用年限',
      '上传技能认证证书'
    ]
  },
  experience: {
    title: '工作经历',
    description: '分享您的职业历程',
    icon: '📋',
    weight: 15,
    tips: [
      '添加相关工作经历',
      '详细描述工作职责',
      '说明工作成就',
      '按时间倒序排列'
    ]
  },
  education: {
    title: '教育背景',
    description: '展示您的学历信息',
    icon: '🎓',
    weight: 10,
    tips: [
      '添加最高学历',
      '说明专业领域',
      '上传学历证书',
      '包含在校时间'
    ]
  },
  portfolio: {
    title: '作品集',
    description: '展示您的最佳作品',
    icon: '🎨',
    weight: 10,
    tips: [
      '上传高质量作品',
      '详细描述项目内容',
          '添加使用技术标签',
          '提供项目链接'
    ]
  },
  socialMedia: {
    title: '社交媒体',
    description: '链接您的社交账号',
    icon: '🔗',
    weight: 5,
    tips: [
      '添加专业社交账号',
      '链接作品集平台',
      '验证社交媒体账号',
      '保持账号活跃度'
    ]
  }
};

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  completion,
  onNavigateToSection,
  showTips = true,
  compact = false
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const getCurrentLevel = useCallback(() => {
    return COMPLETION_LEVELS.reduce((prev, current) =>
      completion.percentage >= current.threshold ? current : prev
    );
  }, [completion.percentage]);

  const getRemainingPercentage = useCallback(() => {
    const remainingSections = completion.incompleteSections.length;
    if (remainingSections === 0) return 0;

    const totalRemainingWeight = completion.incompleteSections.reduce((sum, section) => {
      return sum + (SECTION_INFO[section as keyof typeof SECTION_INFO]?.weight || 0);
    }, 0);

    return Math.min(totalRemainingWeight, 100 - completion.percentage);
  }, [completion]);

  const getPrioritySuggestions = useCallback(() => {
    return completion.suggestions
      .filter(suggestion => suggestion.priority === 'high')
      .slice(0, 3);
  }, [completion.suggestions]);

  const currentLevel = getCurrentLevel();
  const remainingPercentage = getRemainingPercentage();
  const prioritySuggestions = getPrioritySuggestions();

  if (compact) {
    return (
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {React.createElement(currentLevel.icon, {
                className: `h-8 w-8 ${currentLevel.color}`
              })}
              <div>
                <div className="text-2xl font-bold">{completion.percentage}%</div>
                <div className="text-xs text-gray-600">{currentLevel.title}</div>
              </div>
            </div>

            <div className="flex-1">
              <Progress value={completion.percentage} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>完成度</span>
                <span>{completion.completedSections.length}/{completion.completedSections.length + completion.incompleteSections.length}</span>
              </div>
            </div>

            <Button variant="outline" size="sm">
              {t('profile.completion.improve')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Overview Card */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              {t('profile.completion.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Progress */}
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-gray-200">
                  <div
                    className="w-32 h-32 rounded-full border-8 border-blue-600 border-t-transparent border-r-transparent transform -rotate-45"
                    style={{
                      borderRightColor: 'transparent',
                      borderTopColor: 'transparent',
                      borderBottomColor: completion.percentage > 50 ? '#2563eb' : 'transparent',
                      borderLeftColor: completion.percentage > 75 ? '#2563eb' : 'transparent',
                      transform: `rotate(${(completion.percentage / 100) * 360 - 45}deg)`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {completion.percentage}%
                      </div>
                      <div className="text-sm text-gray-600">{currentLevel.title}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {t('profile.completion.currentLevel', { level: currentLevel.title })}
                </h3>
                <p className="text-gray-600">
                  {t('profile.completion.sectionsCompleted', {
                    completed: completion.completedSections.length,
                    total: completion.completedSections.length + completion.incompleteSections.length
                  })}
                </p>
              </div>

              <div className="w-full max-w-md mx-auto">
                <Progress value={completion.percentage} className="h-3" />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{t('profile.completion.started')}</span>
                  <span>{t('profile.completion.almostDone')}</span>
                  <span>{t('profile.completion.completed')}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-xl font-bold text-green-600">
                  {completion.completedSections.length}
                </div>
                <div className="text-xs text-gray-600">{t('profile.completion.completed')}</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                <div className="text-xl font-bold text-yellow-600">
                  {completion.incompleteSections.length}
                </div>
                <div className="text-xs text-gray-600">{t('profile.completion.remaining')}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-xl font-bold text-blue-600">
                  {remainingPercentage}%
                </div>
                <div className="text-xs text-gray-600">{t('profile.completion.potential')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{t('profile.completion.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="suggestions">{t('profile.completion.tabs.suggestions')}</TabsTrigger>
            <TabsTrigger value="sections">{t('profile.completion.tabs.sections')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4">
              {/* Level Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('profile.completion.levelProgress')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {COMPLETION_LEVELS.map((level, index) => {
                      const Icon = level.icon;
                      const isUnlocked = completion.percentage >= level.threshold;
                      const isCurrent = currentLevel.threshold === level.threshold;

                      return (
                        <div
                          key={level.level}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isCurrent ? 'bg-blue-50 border border-blue-200' :
                            isUnlocked ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 ${
                              isUnlocked ? 'text-green-600' : 'text-gray-400'
                            }`}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{level.title}</div>
                            <div className="text-sm text-gray-600">
                              {t('profile.completion.levelRequirements', { threshold: level.threshold })}
                            </div>
                          </div>
                          {isUnlocked && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          {isCurrent && (
                            <Badge variant="default">{t('profile.completion.current')}</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Priority Suggestions */}
              {prioritySuggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      {t('profile.completion.priorityActions')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {prioritySuggestions.map((suggestion, index) => (
                        <Alert key={index} className="border-yellow-200 bg-yellow-50">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="flex items-center justify-between">
                            <span>{suggestion.message}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onNavigateToSection?.(suggestion.section)}
                            >
                              {t('profile.completion.improve')}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('profile.completion.suggestions.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completion.suggestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <h3 className="text-lg font-medium mb-1">
                        {t('profile.completion.suggestions.noSuggestions')}
                      </h3>
                      <p className="text-sm">{t('profile.completion.suggestions.profileComplete')}</p>
                    </div>
                  ) : (
                    completion.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant={
                                  suggestion.priority === 'high' ? 'destructive' :
                                  suggestion.priority === 'medium' ? 'default' : 'secondary'
                                }
                              >
                                {t(`profile.completion.suggestions.priority.${suggestion.priority}`)}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {SECTION_INFO[suggestion.section as keyof typeof SECTION_INFO]?.title}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{suggestion.message}</p>
                            {showTips && (
                              <div className="text-xs text-gray-500">
                                {t('profile.completion.suggestions.impact')} +{SECTION_INFO[suggestion.section as keyof typeof SECTION_INFO]?.weight}%
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigateToSection?.(suggestion.section)}
                          >
                            {t('profile.completion.improve')}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-6">
            <div className="grid gap-4">
              {Object.entries(SECTION_INFO).map(([sectionKey, info]) => {
                const isCompleted = completion.completedSections.includes(sectionKey);
                const isIncomplete = completion.incompleteSections.includes(sectionKey);

                return (
                  <Card key={sectionKey} className={`${
                      isCompleted ? 'border-green-200 bg-green-50' :
                      isIncomplete ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200'
                    }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{info.icon}</div>
                          <div>
                            <h3 className="font-semibold">{info.title}</h3>
                            <p className="text-sm text-gray-600">{info.description}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {t('profile.completion.sections.weight')}: +{info.weight}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t('profile.completion.sections.completed')}
                            </Badge>
                          )}
                          {isIncomplete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onNavigateToSection?.(sectionKey)}
                            >
                              {t('profile.completion.sections.complete')}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Tips */}
                      {showTips && isIncomplete && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm font-medium mb-2">
                            {t('profile.completion.sections.tips')}:
                          </div>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {info.tips.slice(0, 3).map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start gap-1">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        {showTips && completion.percentage < 100 && (
          <Alert>
            <Trophy className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{t('profile.completion.tips.title')}:</p>
                <ul className="space-y-1 text-sm">
                  <li>• {t('profile.completion.tips.beSpecific')}</li>
                  <li>• {t('profile.completion.tips.showcaseBest')}</li>
                  <li>• {t('profile.completion.tips.keepUpdated')}</li>
                  <li>• {t('profile.completion.tips.addMedia')}</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </TooltipProvider>
  );
};