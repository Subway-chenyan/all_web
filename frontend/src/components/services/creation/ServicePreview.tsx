import React, { useState } from 'react';
import { cn } from '@/utils';
import { ServiceFormData, ServicePreview as ServicePreviewType } from '@/types/services';
import { formatCurrency } from '@/utils';
import Button from '@/components/ui/Button';

export interface ServicePreviewProps {
  service: ServiceFormData;
  preview: ServicePreviewType;
  className?: string;
  onEdit?: (step: number) => void;
  disabled?: boolean;
}

const ServicePreview: React.FC<ServicePreviewProps> = ({
  service,
  preview,
  className = '',
  onEdit,
  disabled = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'details'>('overview');

  const popularPackage = service.packages?.find(pkg => pkg.isPopular);

  const getValidationStatus = () => {
    if (preview.isValid) {
      return {
        color: 'text-green-600 bg-green-100',
        icon: '✓',
        text: '服务信息完整，可以发布'
      };
    } else if (preview.errors.length > 0) {
      return {
        color: 'text-red-600 bg-red-100',
        icon: '⚠',
        text: `需要修复 ${preview.errors.length} 个问题`
      };
    } else {
      return {
        color: 'text-yellow-600 bg-yellow-100',
        icon: '💡',
        text: `建议优化 ${preview.warnings.length} 项内容`
      };
    }
  };

  const status = getValidationStatus();

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">服务预览</h2>
            <p className="text-blue-100">
              这是客户看到的服务页面展示效果
            </p>
          </div>
          <div className={cn('px-4 py-2 rounded-full text-sm font-medium', status.color)}>
            <span className="mr-2">{status.icon}</span>
            {status.text}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'overview' as const, label: '概览' },
            { id: 'packages' as const, label: '套餐' },
            { id: 'details' as const, label: '详情' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {service.title || '服务标题'}
              </h3>

              {/* Category */}
              {service.category && service.subcategory && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <span>{service.category}</span>
                  <span>›</span>
                  <span>{service.subcategory}</span>
                </div>
              )}

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                {service.description ? (
                  <div
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: service.description }}
                  />
                ) : (
                  <div className="text-gray-400 italic">
                    服务描述将在这里显示...
                  </div>
                )}
              </div>
            </div>

            {/* Media Gallery */}
            {service.images && service.images.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">服务展示</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {service.images.slice(0, 8).map((image, index) => (
                    <div key={image.id} className="aspect-square rounded-lg overflow-hidden group">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ))}
                  {service.images.length > 8 && (
                    <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">
                          +{service.images.length - 8}
                        </div>
                        <div className="text-xs text-gray-500">更多图片</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">服务标签</h4>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            {service.packages && service.packages.length > 0 ? (
              <>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">定价方案</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {service.packages.map((pkg, index) => (
                      <div
                        key={pkg.id}
                        className={cn(
                          'border-2 rounded-lg p-6 transition-all hover:shadow-lg',
                          pkg.isPopular
                            ? 'border-blue-500 relative transform scale-105'
                            : 'border-gray-200'
                        )}
                      >
                        {pkg.isPopular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              热门推荐
                            </span>
                          </div>
                        )}

                        <div className="text-center mb-4">
                          <h5 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h5>
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {formatCurrency(pkg.price)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {pkg.deliveryTime}天交付 • {pkg.revisions}次修改
                          </div>
                        </div>

                        {pkg.description && (
                          <p className="text-gray-600 text-sm mb-4 text-center">
                            {pkg.description}
                          </p>
                        )}

                        {pkg.features.length > 0 && (
                          <ul className="space-y-2 mb-6">
                            {pkg.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                <span className="text-sm text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <button
                          type="button"
                          className={cn(
                            'w-full py-2 px-4 rounded-lg font-medium transition-colors',
                            pkg.isPopular
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          )}
                        >
                          选择此套餐
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">💰</div>
                <p>尚未设置定价套餐</p>
              </div>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Requirements */}
            {service.requirements && service.requirements.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">客户需求</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {service.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Deliverables */}
            {service.deliverables && service.deliverables.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">交付物</h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {service.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-medium">
                          ✓
                        </span>
                        <span className="text-gray-700">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Videos */}
            {service.videos && service.videos.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">服务视频</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.videos.map((video) => (
                    <div key={video.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {video.thumbnail ? (
                        <div className="relative">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                              <svg
                                className="w-6 h-6 text-gray-800 ml-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <svg
                              className="w-12 h-12 mx-auto mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="text-sm">{video.title}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {service.documents && service.documents.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">相关文档</h4>
                <div className="space-y-2">
                  {service.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {doc.type.includes('pdf') ? '📄' :
                           doc.type.includes('word') ? '📝' :
                           doc.type.includes('excel') ? '📊' :
                           doc.type.includes('image') ? '🖼️' : '📎'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        下载
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Preview */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">搜索引擎预览</h4>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="max-w-xl">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer mb-1">
                    {service.seoTitle || service.title || '服务标题'} - 专业服务平台
                  </div>
                  <div className="text-green-700 text-sm mb-1">
                    https://platform.com/services/service-link
                  </div>
                  <div className="text-gray-600 text-sm">
                    {service.seoDescription ||
                     (service.description ? service.description.replace(/<[^>]*>/g, '').substring(0, 160) + '...' :
                      '服务描述将显示在搜索结果中...')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {onEdit && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              发现问题？点击下方按钮返回编辑
            </div>
            <Button
              onClick={() => onEdit(0)}
              disabled={disabled}
            >
              返回编辑
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePreview;