import React, { useState } from 'react';
import { cn } from '@/utils';
import { ServiceFormData, FormValidationError } from '@/types/services';
import { ImageUpload, VideoUpload, FileUpload } from '@/components/forms';
import Button from '@/components/ui/Button';

export interface MediaUploadProps {
  data: Partial<ServiceFormData>;
  onChange: (data: Partial<ServiceFormData>) => void;
  errors: FormValidationError[];
  className?: string;
  disabled?: boolean;
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  data,
  onChange,
  errors = [],
  className = '',
  disabled = false
}) => {
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'documents'>('images');

  const handleImagesChange = (images: any[]) => {
    onChange({ ...data, images });
  };

  const handleVideosChange = (videos: any[]) => {
    onChange({ ...data, videos });
  };

  const handleDocumentsChange = (documents: any[]) => {
    onChange({ ...data, documents });
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field);
  };

  const tabs = [
    { id: 'images' as const, label: '图片', count: data.images?.length || 0 },
    { id: 'videos' as const, label: '视频', count: data.videos?.length || 0 },
    { id: 'documents' as const, label: '文档', count: data.documents?.length || 0 }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">媒体资料</h2>
        <p className="text-gray-600">
          上传图片、视频和文档来展示您的服务质量和专业能力。高质量的媒体资料能显著提升服务吸引力。
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
              disabled={disabled}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  )}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                服务图片
              </h3>
              <p className="text-sm text-gray-600">
                上传高质量的服务展示图片，建议尺寸 1280x720 像素，支持 JPG、PNG、GIF、WebP 格式。
              </p>
            </div>

            <ImageUpload
              images={data.images || []}
              onChange={handleImagesChange}
              maxImages={8}
              maxFileSize={10 * 1024 * 1024} // 10MB
              acceptedFormats={['jpg', 'jpeg', 'png', 'gif', 'webp']}
              requiredDimensions={{ width: 1280, height: 720 }}
              disabled={disabled}
              showPreview={true}
              allowReorder={true}
            />

            {getFieldError('images') && (
              <p className="mt-2 text-sm text-red-600">
                {getFieldError('images')!.message}
              </p>
            )}

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">图片上传建议</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 上传真实的服务成果展示图</li>
                <li>• 确保图片清晰度高，内容专业</li>
                <li>• 第一张图片将作为服务封面图</li>
                <li>• 避免包含水印或联系方式</li>
                <li>• 可以上传工作过程截图增加可信度</li>
              </ul>
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                服务视频
              </h3>
              <p className="text-sm text-gray-600">
                上传服务介绍视频，有助于客户更直观地了解您的服务。支持 MP4、AVI、MOV 等格式。
              </p>
            </div>

            <VideoUpload
              videos={data.videos || []}
              onChange={handleVideosChange}
              maxVideos={3}
              maxFileSize={200 * 1024 * 1024} // 200MB
              acceptedFormats={['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']}
              disabled={disabled}
              showPreview={true}
              autoGenerateThumbnail={true}
            />

            {getFieldError('videos') && (
              <p className="mt-2 text-sm text-red-600">
                {getFieldError('videos')!.message}
              </p>
            )}

            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-2">视频制作建议</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 视频时长建议在 1-3 分钟之间</li>
                <li>• 开头 10 秒要能吸引观众注意力</li>
                <li>• 介绍您的服务流程和专业优势</li>
                <li>• 展示实际案例和客户反馈</li>
                <li>• 确保音频清晰，画面稳定</li>
                <li>• 添加字幕提高观看体验</li>
              </ul>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                相关文档
              </h3>
              <p className="text-sm text-gray-600">
                上传相关文档，如服务说明、案例分析、资质证书等，增强服务的可信度。
              </p>
            </div>

            <FileUpload
              files={data.documents || []}
              onChange={handleDocumentsChange}
              maxFiles={10}
              maxFileSize={50 * 1024 * 1024} // 50MB
              acceptedFormats={['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar']}
              disabled={disabled}
              showPreview={true}
              allowReorder={true}
            />

            {getFieldError('documents') && (
              <p className="mt-2 text-sm text-red-600">
                {getFieldError('documents')!.message}
              </p>
            )}

            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="text-sm font-medium text-purple-900 mb-2">文档上传建议</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• 上传 PDF 格式的服务介绍文档</li>
                <li>• 包含详细的案例分析和成果展示</li>
                <li>• 可以上传相关资质证书</li>
                <li>• 确保文档内容专业、格式规范</li>
                <li>• 避免包含个人联系信息</li>
                <li>• 重要文档建议添加水印保护</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Media Guidelines */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-900 mb-2">📸 媒体资料指南</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-800">
          <div>
            <h4 className="font-medium mb-1">质量要求</h4>
            <ul className="space-y-1">
              <li>• 图片分辨率 ≥ 1280x720</li>
              <li>• 视频时长 ≤ 10 分钟</li>
              <li>• 文件大小合理控制</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">内容规范</h4>
            <ul className="space-y-1">
              <li>• 真实展示服务成果</li>
              <li>• 避免虚假或夸大宣传</li>
              <li>• 保护客户隐私信息</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">最佳实践</h4>
            <ul className="space-y-1">
              <li>• 多角度展示服务</li>
              <li>• 包含前后对比效果</li>
              <li>• 展示工作流程细节</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Media Statistics */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.images?.length || 0}
            </div>
            <div className="text-sm text-gray-600">张图片</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.videos?.length || 0}
            </div>
            <div className="text-sm text-gray-600">个视频</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data.documents?.length || 0}
            </div>
            <div className="text-sm text-gray-600">份文档</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;