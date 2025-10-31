import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';
import { ServiceFormData, FormValidationError, ServicePreview } from '@/types/services';
import { formatCurrency, formatDate } from '@/utils';
import Button from '@/components/ui/Button';

export interface ReviewAndPublishProps {
  data: ServiceFormData;
  onPublish: (options: PublishOptions) => void;
  onSaveDraft: () => void;
  errors: FormValidationError[];
  warnings: FormValidationError[];
  isValid: boolean;
  className?: string;
  disabled?: boolean;
}

export interface PublishOptions {
  publishImmediately: boolean;
  publishAt?: Date;
  status: 'active' | 'draft' | 'paused';
}

const ReviewAndPublish: React.FC<ReviewAndPublishProps> = ({
  data,
  onPublish,
  onSaveDraft,
  errors = [],
  warnings = [],
  isValid,
  className = '',
  disabled = false
}) => {
  const [publishOptions, setPublishOptions] = useState<PublishOptions>({
    publishImmediately: true,
    status: 'active'
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    const total = 7;

    if (data.title && data.title.length >= 10) completed++;
    if (data.category && data.subcategory) completed++;
    if (data.description && data.description.length >= 100) completed++;
    if (data.packages && data.packages.length > 0) completed++;
    if (data.images && data.images.length > 0) completed++;
    if (data.seoTitle && data.seoDescription) completed++;
    if (data.requirements && data.requirements.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  const handlePublish = async () => {
    if (!isValid) return;

    setIsPublishing(true);
    try {
      await onPublish(publishOptions);
    } finally {
      setIsPublishing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '立即发布';
      case 'draft': return '保存草稿';
      case 'paused': return '暂不发布';
      default: return '保存草稿';
    }
  };

  const popularPackage = data.packages?.find(pkg => pkg.isPopular);

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">审核与发布</h2>
        <p className="text-gray-600">
          请仔细检查您的服务信息，确认无误后即可发布。
        </p>
      </div>

      {/* Completion Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">完成度评估</h3>
            <p className="text-sm text-gray-600">服务信息完整性检查</p>
          </div>
          <div className="text-right">
            <div className={cn(
              'text-3xl font-bold',
              completionPercentage >= 90 ? 'text-green-600' :
              completionPercentage >= 70 ? 'text-yellow-600' : 'text-red-600'
            )}>
              {completionPercentage}%
            </div>
            <div className="text-sm text-gray-600">
              {completionPercentage >= 90 ? '完整' :
               completionPercentage >= 70 ? '基本完整' : '需要完善'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              completionPercentage >= 90 ? 'bg-green-500' :
              completionPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <span className={data.title && data.title.length >= 10 ? 'text-green-600' : 'text-gray-400'}>
              ✓
            </span>
            <span className={data.title && data.title.length >= 10 ? 'text-gray-700' : 'text-gray-500'}>
              服务标题 (≥10字)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={data.category && data.subcategory ? 'text-green-600' : 'text-gray-400'}>
              ✓
            </span>
            <span className={data.category && data.subcategory ? 'text-gray-700' : 'text-gray-500'}>
              分类选择
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={data.description && data.description.length >= 100 ? 'text-green-600' : 'text-gray-400'}>
              ✓
            </span>
            <span className={data.description && data.description.length >= 100 ? 'text-gray-700' : 'text-gray-500'}>
              详细描述 (≥100字)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={data.packages && data.packages.length > 0 ? 'text-green-600' : 'text-gray-400'}>
              ✓
            </span>
            <span className={data.packages && data.packages.length > 0 ? 'text-gray-700' : 'text-gray-500'}>
              定价套餐
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={data.images && data.images.length > 0 ? 'text-green-600' : 'text-gray-400'}>
              ✓
            </span>
            <span className={data.images && data.images.length > 0 ? 'text-gray-700' : 'text-gray-500'}>
              服务图片
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={data.seoTitle && data.seoDescription ? 'text-green-600' : 'text-gray-400'}>
              ✓
            </span>
            <span className={data.seoTitle && data.seoDescription ? 'text-gray-700' : 'text-gray-500'}>
              SEO 设置
            </span>
          </div>
        </div>
      </div>

      {/* Errors and Warnings */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="space-y-3">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-900 mb-2">
                ⚠️ 需要解决的问题 ({errors.length})
              </h4>
              <ul className="space-y-1 text-sm text-red-800">
                {errors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">
                💡 建议优化项 ({warnings.length})
              </h4>
              <ul className="space-y-1 text-sm text-yellow-800">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Service Preview */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">服务预览</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '收起' : '展开'}
          </Button>
        </div>

        {showPreview && (
          <div className="p-6">
            {/* Basic Info */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{data.title}</h4>
              <p className="text-gray-600 mb-3">
                {data.category && data.subcategory && `${data.category} > ${data.subcategory}`}
              </p>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: data.description || '' }}
              />
            </div>

            {/* Pricing */}
            {data.packages && data.packages.length > 0 && (
              <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-3">定价方案</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.packages.map((pkg, index) => (
                    <div
                      key={pkg.id}
                      className={cn(
                        'border rounded-lg p-4',
                        pkg.isPopular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      )}
                    >
                      {pkg.isPopular && (
                        <div className="text-sm font-medium text-blue-600 mb-2">热门</div>
                      )}
                      <h6 className="font-semibold text-gray-900 mb-1">{pkg.name}</h6>
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {formatCurrency(pkg.price)}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {pkg.deliveryTime}天交付 • {pkg.revisions}次修改
                      </div>
                      {pkg.features.length > 0 && (
                        <ul className="space-y-1 text-sm">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start space-x-1">
                              <span className="text-green-500 mt-0.5">✓</span>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media */}
            {data.images && data.images.length > 0 && (
              <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-3">服务展示</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data.images.slice(0, 4).map((image) => (
                    <div key={image.id} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">服务标签</h5>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Publishing Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">发布选项</h3>

        <div className="space-y-4">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              发布状态
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'active', label: '立即发布', desc: '发布后客户可以立即购买' },
                { value: 'draft', label: '保存草稿', desc: '保存但暂不发布' },
                { value: 'paused', label: '暂不发布', desc: '暂时不对外展示' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPublishOptions({ ...publishOptions, status: option.value as any })}
                  className={cn(
                    'p-3 border-2 rounded-lg text-left transition-colors',
                    publishOptions.status === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  disabled={disabled}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduled Publishing */}
          {publishOptions.status === 'active' && (
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!publishOptions.publishImmediately}
                  onChange={(e) => setPublishOptions({
                    ...publishOptions,
                    publishImmediately: !e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={disabled}
                />
                <span className="text-sm text-gray-700">定时发布</span>
              </label>

              {!publishOptions.publishImmediately && (
                <div className="mt-3">
                  <input
                    type="datetime-local"
                    value={publishOptions.publishAt?.toISOString().slice(0, 16) || ''}
                    onChange={(e) => setPublishOptions({
                      ...publishOptions,
                      publishAt: new Date(e.target.value)
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().slice(0, 16)}
                    disabled={disabled}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Final Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handlePublish}
          disabled={!isValid || disabled || isPublishing}
          loading={isPublishing}
          className="flex-1"
        >
          {getStatusLabel(publishOptions.status)}
        </Button>

        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={disabled}
          className="flex-1"
        >
          保存草稿
        </Button>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">发布须知</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 请确保服务信息真实、准确，不包含虚假或误导性内容</li>
          <li>• 发布的服务必须符合平台规范和相关法律法规</li>
          <li>• 平台有权对违规服务进行下架处理</li>
          <li>• 发布后您可以在服务管理页面修改服务信息</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewAndPublish;