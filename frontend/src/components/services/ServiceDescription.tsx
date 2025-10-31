import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Play, Download, Eye } from 'lucide-react';
import { useI18n } from '@/i18n';

interface ServiceDescriptionProps {
  title: string;
  description: string;
  features?: string[];
  requirements?: string[];
  deliveryInfo?: string;
  revisions?: number;
  files?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  videos?: {
    title: string;
    url: string;
    thumbnail?: string;
    duration?: string;
  }[];
  className?: string;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <h4 className="font-medium text-gray-900">{title}</h4>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

const FileAttachments: React.FC<{ files: ServiceDescriptionProps['files'] }> = ({ files }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  };

  if (!files?.length) return null;

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getFileIcon(file.type)}</span>
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.open(file.url, '_blank')}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="预览"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = file.url;
                link.download = file.name;
                link.click();
              }}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
              title="下载"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const VideoGallery: React.FC<{ videos: ServiceDescriptionProps['videos'] }> = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  if (!videos?.length) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video, index) => (
          <div
            key={index}
            className="relative group cursor-pointer rounded-lg overflow-hidden"
            onClick={() => setSelectedVideo(video.url)}
          >
            <div className="aspect-video bg-gray-200 relative">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Play className="w-12 h-12 text-white" />
              </div>
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              )}
            </div>
            <div className="p-3 bg-white">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">{video.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
          >
            ×
          </button>
          <video
            src={selectedVideo}
            className="max-w-full max-h-full"
            controls
            autoPlay
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export const ServiceDescription: React.FC<ServiceDescriptionProps> = ({
  title,
  description,
  features,
  requirements,
  deliveryInfo,
  revisions,
  files,
  videos,
  className = ''
}) => {
  const { t } = useI18n();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Description */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>

      {/* Features */}
      {features?.length > 0 && (
        <CollapsibleSection title="服务特性" defaultOpen={true}>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Requirements */}
      {requirements?.length > 0 && (
        <CollapsibleSection title="客户需求">
          <ul className="space-y-2">
            {requirements.map((requirement, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{requirement}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Delivery Info */}
      {deliveryInfo && (
        <CollapsibleSection title="交付说明">
          <div className="text-gray-700">
            <p>{deliveryInfo}</p>
            {revisions !== undefined && (
              <p className="mt-2 text-sm text-gray-600">
                <strong>修改次数:</strong> {revisions} 次
              </p>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Videos */}
      {videos?.length > 0 && (
        <CollapsibleSection title="视频介绍">
          <VideoGallery videos={videos} />
        </CollapsibleSection>
      )}

      {/* File Attachments */}
      {files?.length > 0 && (
        <CollapsibleSection title="相关文件">
          <FileAttachments files={files} />
        </CollapsibleSection>
      )}

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">温馨提示</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 如有任何疑问，请在购买前联系卖家咨询</li>
          <li>• 请详细描述您的需求，以便卖家提供更好的服务</li>
          <li>• 交付时间从收到完整需求并确认开始计算</li>
          <li>• 如需额外修改，可能产生额外费用</li>
        </ul>
      </div>
    </div>
  );
};

export default ServiceDescription;