import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/utils';
import { ServiceVideo } from '@/types/services';
import Button from '@/components/ui/Button';

export interface VideoUploadProps {
  videos: ServiceVideo[];
  onChange: (videos: ServiceVideo[]) => void;
  maxVideos?: number;
  maxFileSize?: number; // in bytes
  acceptedFormats?: string[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  autoGenerateThumbnail?: boolean;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  videos = [],
  onChange,
  maxVideos = 3,
  maxFileSize = 100 * 1024 * 1024, // 100MB
  acceptedFormats = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  className = '',
  disabled = false,
  showPreview = true,
  autoGenerateThumbnail = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string[] => {
    const newErrors: string[] = [];

    // Check file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !acceptedFormats.includes(extension)) {
      newErrors.push(`不支持的视频格式。请使用: ${acceptedFormats.join(', ')}`);
    }

    // Check file size
    if (file.size > maxFileSize) {
      newErrors.push(`文件大小不能超过 ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`);
    }

    return newErrors;
  };

  const generateThumbnail = (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;

      video.addEventListener('loadeddata', () => {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Seek to 1 second or 10% of video duration
        const seekTime = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTime;
      });

      video.addEventListener('seeked', () => {
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob and then to URL
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            // Fallback: return empty string
            resolve('');
          }
        }, 'image/jpeg', 0.8);
      });

      video.addEventListener('error', () => {
        // Fallback: return empty string
        resolve('');
      });

      video.src = URL.createObjectURL(videoFile);
    });
  };

  const getVideoDuration = (videoFile: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');

      video.addEventListener('loadedmetadata', () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      });

      video.addEventListener('error', () => {
        resolve(0);
      });

      video.src = URL.createObjectURL(videoFile);
    });
  };

  const processFile = async (file: File): Promise<ServiceVideo | null> => {
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return null;
    }

    try {
      setUploading(true);

      // Get video duration
      const duration = await getVideoDuration(file);

      // Generate thumbnail
      let thumbnail = '';
      if (autoGenerateThumbnail) {
        thumbnail = await generateThumbnail(file);
      }

      // In a real application, you would upload to a server here
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);

      const newVideo: ServiceVideo = {
        id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url,
        thumbnail,
        duration,
        size: file.size,
        title: file.name,
        order: videos.length
      };

      return newVideo;
    } catch (error) {
      setErrors(['视频处理失败，请重试']);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || disabled) return;

    const newErrors: string[] = [];
    const newVideos: ServiceVideo[] = [];

    for (let i = 0; i < Math.min(files.length, maxVideos - videos.length); i++) {
      const file = files[i];
      const processedVideo = await processFile(file);
      if (processedVideo) {
        newVideos.push(processedVideo);
      }
    }

    if (newVideos.length > 0) {
      onChange([...videos, ...newVideos]);
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, videos.length]);

  const removeVideo = (videoId: string) => {
    const videoToRemove = videos.find(vid => vid.id === videoId);
    if (videoToRemove) {
      // Revoke object URLs to free memory
      URL.revokeObjectURL(videoToRemove.url);
      if (videoToRemove.thumbnail) {
        URL.revokeObjectURL(videoToRemove.thumbnail);
      }
    }
    onChange(videos.filter(vid => vid.id !== videoId));
  };

  const updateVideoTitle = (videoId: string, title: string) => {
    onChange(videos.map(vid =>
      vid.id === videoId ? { ...vid, title } : vid
    ));
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {videos.length < maxVideos && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-3">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12"
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
            </div>
            <div>
              <p className="text-sm text-gray-600">
                拖拽视频到这里，或者
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={disabled}
                >
                  点击选择
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                支持 {acceptedFormats.join(', ')} 格式，最大 {(maxFileSize / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              loading={uploading}
            >
              {uploading ? '上传中...' : '选择视频'}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.map(format => `.${format}`).join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Video Preview */}
      {showPreview && videos.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">
              已上传视频 ({videos.length}/{maxVideos})
            </h4>
          </div>

          <div className="space-y-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start space-x-4">
                  {/* Video Thumbnail */}
                  <div className="flex-shrink-0">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-32 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
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
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => updateVideoTitle(video.id, e.target.value)}
                      placeholder="视频标题"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={disabled}
                    />

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>时长: {formatDuration(video.duration)}</span>
                      <span>大小: {formatFileSize(video.size)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Open video in new tab
                          window.open(video.url, '_blank');
                        }}
                      >
                        预览
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVideo(video.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;