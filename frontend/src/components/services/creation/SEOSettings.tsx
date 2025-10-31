import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';
import { ServiceFormData, FormValidationError, SEOAnalysis } from '@/types/services';
import { TagInput } from '@/components/forms';
import Button from '@/components/ui/Button';

export interface SEOSettingsProps {
  data: Partial<ServiceFormData>;
  onChange: (data: Partial<ServiceFormData>) => void;
  errors: FormValidationError[];
  className?: string;
  disabled?: boolean;
}

const SEOSettings: React.FC<SEOSettingsProps> = ({
  data,
  onChange,
  errors = [],
  className = '',
  disabled = false
}) => {
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const charLimits = {
    seoTitle: { min: 30, max: 60, optimal: [40, 55] },
    seoDescription: { min: 120, max: 160, optimal: [140, 155] }
  };

  const charCount = {
    seoTitle: data.seoTitle?.length || 0,
    seoDescription: data.seoDescription?.length || 0,
    keywords: data.keywords?.length || 0
  };

  // Auto-generate SEO from basic info
  const generateAutoSEO = () => {
    if (data.title) {
      const seoTitle = data.title.length > charLimits.seoTitle.max
        ? data.title.substring(0, charLimits.seoTitle.max - 3) + '...'
        : data.title;

      // Generate SEO description from service description
      let seoDescription = '';
      if (data.description) {
        const plainText = data.description.replace(/<[^>]*>/g, '');
        seoDescription = plainText.length > charLimits.seoDescription.max
          ? plainText.substring(0, charLimits.seoDescription.max - 3) + '...'
          : plainText;
      }

      onChange({
        ...data,
        seoTitle,
        seoDescription
      });
    }
  };

  // Analyze SEO
  const analyzeSEO = async () => {
    setIsAnalyzing(true);

    // Simulate SEO analysis (in real app, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const analysis: SEOAnalysis = {
      score: calculateSEOScore(),
      title: analyzeTitle(),
      description: analyzeDescription(),
      keywords: analyzeKeywords(),
      readability: analyzeReadability()
    };

    setSeoAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const calculateSEOScore = (): number => {
    let score = 0;

    // Title score (40%)
    if (data.seoTitle) {
      const length = data.seoTitle.length;
      if (length >= charLimits.seoTitle.optimal[0] && length <= charLimits.seoTitle.optimal[1]) {
        score += 40;
      } else if (length >= charLimits.seoTitle.min && length <= charLimits.seoTitle.max) {
        score += 25;
      } else {
        score += 10;
      }
    }

    // Description score (40%)
    if (data.seoDescription) {
      const length = data.seoDescription.length;
      if (length >= charLimits.seoDescription.optimal[0] && length <= charLimits.seoDescription.optimal[1]) {
        score += 40;
      } else if (length >= charLimits.seoDescription.min && length <= charLimits.seoDescription.max) {
        score += 25;
      } else {
        score += 10;
      }
    }

    // Keywords score (20%)
    if (data.keywords && data.keywords.length > 0) {
      score += Math.min(data.keywords.length * 5, 20);
    }

    return score;
  };

  const analyzeTitle = () => {
    const title = data.seoTitle || '';
    const length = title.length;

    const suggestions = [];
    if (length < charLimits.seoTitle.min) {
      suggestions.push('标题太短，建议增加更多关键词');
    } else if (length > charLimits.seoTitle.max) {
      suggestions.push('标题太长，可能被搜索引擎截断');
    }

    if (!title.toLowerCase().includes('服务') && !title.toLowerCase().includes('设计')) {
      suggestions.push('标题中包含核心服务关键词有助于SEO');
    }

    return {
      length,
      isOptimal: length >= charLimits.seoTitle.optimal[0] && length <= charLimits.seoTitle.optimal[1],
      suggestions
    };
  };

  const analyzeDescription = () => {
    const description = data.seoDescription || '';
    const length = description.length;

    const suggestions = [];
    if (length < charLimits.seoDescription.min) {
      suggestions.push('描述太短，建议更详细地介绍服务');
    } else if (length > charLimits.seoDescription.max) {
      suggestions.push('描述太长，可能被搜索引擎截断');
    }

    return {
      length,
      isOptimal: length >= charLimits.seoDescription.optimal[0] && length <= charLimits.seoDescription.optimal[1],
      suggestions
    };
  };

  const analyzeKeywords = () => {
    const keywords = data.keywords || [];
    const count = keywords.length;
    const density = count > 0 ? (count / 10) * 100 : 0; // Simplified density calculation

    const suggestions = [];
    if (count < 3) {
      suggestions.push('建议添加更多相关关键词');
    } else if (count > 8) {
      suggestions.push('关键词过多，建议精选最重要的几个');
    }

    return {
      count,
      density,
      suggestions
    };
  };

  const analyzeReadability = () => {
    const description = data.seoDescription || '';
    const sentences = description.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0
      ? description.replace(/[。，！？.!?]/g, '').length / sentences.length
      : 0;

    const suggestions = [];
    if (avgSentenceLength > 30) {
      suggestions.push('句子过长，建议使用更简短的句子');
    }
    if (sentences.length < 2) {
      suggestions.push('建议使用多个句子来提高可读性');
    }

    const score = Math.max(0, 100 - Math.abs(avgSentenceLength - 20) * 2);

    return {
      score,
      suggestions
    };
  };

  const handleSEOTitleChange = (seoTitle: string) => {
    if (seoTitle.length <= charLimits.seoTitle.max) {
      onChange({ ...data, seoTitle });
    }
  };

  const handleSEODescriptionChange = (seoDescription: string) => {
    if (seoDescription.length <= charLimits.seoDescription.max) {
      onChange({ ...data, seoDescription });
    }
  };

  const handleKeywordsChange = (keywords: string[]) => {
    onChange({ ...data, keywords });
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCharCountColor = (current: number, limits: typeof charLimits.seoTitle) => {
    if (current >= limits.optimal[0] && current <= limits.optimal[1]) {
      return 'text-green-600';
    }
    if (current < limits.min || current > limits.max) {
      return 'text-red-600';
    }
    return 'text-yellow-600';
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">SEO 优化设置</h2>
        <p className="text-gray-600">
          优化您的服务页面搜索引擎排名，提高曝光率和访问量。
        </p>
      </div>

      {/* SEO Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SEO 评分</h3>
            <p className="text-sm text-gray-600">基于搜索引擎优化最佳实践</p>
          </div>
          <div className="text-right">
            <div className={cn('text-3xl font-bold', getScoreColor(seoAnalysis?.score || 0))}>
              {seoAnalysis?.score || 0}%
            </div>
            <Button
              size="sm"
              onClick={analyzeSEO}
              loading={isAnalyzing}
              disabled={disabled}
            >
              {isAnalyzing ? '分析中...' : '重新分析'}
            </Button>
          </div>
        </div>

        {seoAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">标题</div>
              <div className={cn('font-medium', getCharCountColor(seoAnalysis.title.length, charLimits.seoTitle))}>
                {seoAnalysis.title.isOptimal ? '✓ 优化' : '需改进'}
              </div>
            </div>
            <div>
              <div className="text-gray-600">描述</div>
              <div className={cn('font-medium', getCharCountColor(seoAnalysis.description.length, charLimits.seoDescription))}>
                {seoAnalysis.description.isOptimal ? '✓ 优化' : '需改进'}
              </div>
            </div>
            <div>
              <div className="text-gray-600">关键词</div>
              <div className={cn('font-medium', seoAnalysis.keywords.count >= 3 ? 'text-green-600' : 'text-yellow-600')}>
                {seoAnalysis.keywords.count >= 3 ? '✓ 良好' : '需添加'}
              </div>
            </div>
            <div>
              <div className="text-gray-600">可读性</div>
              <div className={cn('font-medium', seoAnalysis.readability.score >= 70 ? 'text-green-600' : 'text-yellow-600')}>
                {seoAnalysis.readability.score >= 70 ? '✓ 良好' : '需改进'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auto Generate */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div>
          <h4 className="font-medium text-gray-900">智能生成 SEO</h4>
          <p className="text-sm text-gray-600">根据基本信息自动生成优化的标题和描述</p>
        </div>
        <Button
          variant="outline"
          onClick={generateAutoSEO}
          disabled={disabled || !data.title}
        >
          自动生成
        </Button>
      </div>

      {/* SEO Title */}
      <div>
        <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
          SEO 标题
        </label>
        <input
          id="seoTitle"
          type="text"
          value={data.seoTitle || ''}
          onChange={(e) => handleSEOTitleChange(e.target.value)}
          placeholder="搜索引擎显示的标题，建议包含核心关键词"
          className={cn(
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            getFieldError('seoTitle') ? 'border-red-300' : 'border-gray-300',
            disabled && 'bg-gray-100 cursor-not-allowed'
          )}
          disabled={disabled}
        />
        <div className="mt-1 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            建议长度 {charLimits.seoTitle.optimal[0]}-{charLimits.seoTitle.optimal[1]} 字符
          </div>
          <div className={cn('text-xs', getCharCountColor(charCount.seoTitle, charLimits.seoTitle))}>
            {charCount.seoTitle} / {charLimits.seoTitle.max}
          </div>
        </div>
        {getFieldError('seoTitle') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('seoTitle')!.message}</p>
        )}
        {seoAnalysis?.title.suggestions && seoAnalysis.title.suggestions.length > 0 && (
          <div className="mt-2 text-xs text-yellow-600">
            💡 {seoAnalysis.title.suggestions.join('；')}
          </div>
        )}
      </div>

      {/* SEO Description */}
      <div>
        <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">
          SEO 描述
        </label>
        <textarea
          id="seoDescription"
          value={data.seoDescription || ''}
          onChange={(e) => handleSEODescriptionChange(e.target.value)}
          placeholder="搜索引擎结果中显示的描述，建议简洁明了地介绍服务价值"
          rows={3}
          className={cn(
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            getFieldError('seoDescription') ? 'border-red-300' : 'border-gray-300',
            disabled && 'bg-gray-100 cursor-not-allowed'
          )}
          disabled={disabled}
        />
        <div className="mt-1 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            建议长度 {charLimits.seoDescription.optimal[0]}-{charLimits.seoDescription.optimal[1]} 字符
          </div>
          <div className={cn('text-xs', getCharCountColor(charCount.seoDescription, charLimits.seoDescription))}>
            {charCount.seoDescription} / {charLimits.seoDescription.max}
          </div>
        </div>
        {getFieldError('seoDescription') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('seoDescription')!.message}</p>
        )}
        {seoAnalysis?.description.suggestions && seoAnalysis.description.suggestions.length > 0 && (
          <div className="mt-2 text-xs text-yellow-600">
            💡 {seoAnalysis.description.suggestions.join('；')}
          </div>
        )}
      </div>

      {/* Keywords */}
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
          关键词标签
        </label>
        <TagInput
          tags={data.keywords || []}
          onChange={handleKeywordsChange}
          placeholder="添加 SEO 关键词..."
          maxTags={8}
          maxLength={20}
          suggestions={[
            '专业设计', '定制服务', '快速交付', '质量保证', '原创作品',
            '性价比高', '经验丰富', '客户满意', '商业可用', '源文件'
          ]}
          disabled={disabled}
        />
        <div className="mt-1 text-xs text-gray-500">
          添加 3-8 个相关关键词，有助于搜索引擎理解和分类您的服务
        </div>
        {getFieldError('keywords') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('keywords')!.message}</p>
        )}
        {seoAnalysis?.keywords.suggestions && seoAnalysis.keywords.suggestions.length > 0 && (
          <div className="mt-2 text-xs text-yellow-600">
            💡 {seoAnalysis.keywords.suggestions.join('；')}
          </div>
        )}
      </div>

      {/* SEO Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-900 mb-2">🎯 SEO 优化建议</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <div>
            <h4 className="font-medium mb-1">标题优化</h4>
            <ul className="space-y-1">
              <li>• 包含核心服务关键词</li>
              <li>• 控制在 60 字符以内</li>
              <li>• 突出服务独特卖点</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">描述优化</h4>
            <ul className="space-y-1">
              <li>• 详细说明服务价值</li>
              <li>• 包含相关关键词</li>
              <li>• 控制在 160 字符以内</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview */}
      {data.seoTitle && data.seoDescription && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">搜索结果预览</h3>
          <div className="max-w-xl">
            <div className="text-blue-600 text-lg hover:underline cursor-pointer mb-1">
              {data.seoTitle} - 专业服务平台
            </div>
            <div className="text-green-700 text-sm mb-1">
              https://platform.com/services/{data.slug || 'service-link'}
            </div>
            <div className="text-gray-600 text-sm">
              {data.seoDescription}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOSettings;