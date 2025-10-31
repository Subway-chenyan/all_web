import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/utils';
import { ServiceImage } from '@/types/services';
import Button from '@/components/ui/Button';

export interface ImageUploadProps {
  images: ServiceImage[];
  onChange: (images: ServiceImage[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in bytes
  acceptedFormats?: string[];
  requiredDimensions?: {
    width: number;
    height: number;
  };
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  allowReorder?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images = [],
  onChange,
  maxImages = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  requiredDimensions,
  className = '',
  disabled = false,
  showPreview = true,
  allowReorder = true
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
      newErrors.push(`不支持的文件格式。请使用: ${acceptedFormats.join(', ')}`);
    }

    // Check file size
    if (file.size > maxFileSize) {
      newErrors.push(`文件大小不能超过 ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // Check image dimensions if required
    if (requiredDimensions) {
      const img = new Image();
      img.onload = () => {
        if (img.width !== requiredDimensions.width || img.height !== requiredDimensions.height) {
          newErrors.push(`图片尺寸必须为 ${requiredDimensions.width}x${requiredDimensions.height}px`);
        }
        setErrors(prev => [...prev, ...newErrors]);
      };
      img.src = URL.createObjectURL(file);
    }

    return newErrors;
  };

  const processFile = async (file: File): Promise<ServiceImage | null> => {
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return null;
    }

    try {
      setUploading(true);

      // Create image element to get dimensions
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
      });

      // In a real application, you would upload to a server here
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);

      const newImage: ServiceImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url,
        alt: file.name,
        order: images.length,
        size: file.size,
        dimensions
      };

      return newImage;
    } catch (error) {
      setErrors(['图片处理失败，请重试']);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || disabled) return;

    const newErrors: string[] = [];
    const newImages: ServiceImage[] = [];

    for (let i = 0; i < Math.min(files.length, maxImages - images.length); i++) {
      const file = files[i];
      const processedImage = await processFile(file);
      if (processedImage) {
        newImages.push(processedImage);
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
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
  }, [disabled, images.length]);

  const removeImage = (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      // Revoke object URL to free memory
      URL.revokeObjectURL(imageToRemove.url);
    }
    onChange(images.filter(img => img.id !== imageId));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (!allowReorder) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    // Update order property
    newImages.forEach((img, index) => {
      img.order = index;
    });

    onChange(newImages);
  };

  const updateImageAlt = (imageId: string, alt: string) => {
    onChange(images.map(img =>
      img.id === imageId ? { ...img, alt } : img
    ));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {images.length < maxImages && (
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                拖拽图片到这里，或者
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
                {requiredDimensions && `，推荐尺寸 ${requiredDimensions.width}x${requiredDimensions.height}px`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              loading={uploading}
            >
              {uploading ? '上传中...' : '选择图片'}
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

      {/* Image Preview */}
      {showPreview && images.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">
              已上传图片 ({images.length}/{maxImages})
            </h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images
              .sort((a, b) => a.order - b.order)
              .map((image, index) => (
                <div
                  key={image.id}
                  className="relative group border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      {allowReorder && index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index - 1)}
                          className="p-1 bg-white rounded hover:bg-gray-100"
                          title="向左移动"
                        >
                          ←
                        </button>
                      )}
                      {allowReorder && index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index + 1)}
                          className="p-1 bg-white rounded hover:bg-gray-100"
                          title="向右移动"
                        >
                          →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                        title="删除"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="p-2">
                    <input
                      type="text"
                      value={image.alt}
                      onChange={(e) => updateImageAlt(image.id, e.target.value)}
                      placeholder="图片描述"
                      className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={disabled}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {image.dimensions.width} × {image.dimensions.height}
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

export default ImageUpload;