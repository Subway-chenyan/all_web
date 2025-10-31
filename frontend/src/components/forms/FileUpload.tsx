import React, { useRef, useState, useCallback } from 'react';
import { cn } from '@/utils';
import { ServiceDocument } from '@/types/services';
import Button from '@/components/ui/Button';

export interface FileUploadProps {
  files: ServiceDocument[];
  onChange: (files: ServiceDocument[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  acceptedFormats?: string[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  allowReorder?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  files = [],
  onChange,
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = [],
  acceptedFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar'],
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
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      newErrors.push(`不支持的文件类型。请使用: ${acceptedTypes.join(', ')}`);
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && !acceptedFormats.includes(extension)) {
      newErrors.push(`不支持的文件格式。请使用: ${acceptedFormats.join(', ')}`);
    }

    // Check file size
    if (file.size > maxFileSize) {
      newErrors.push(`文件大小不能超过 ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`);
    }

    return newErrors;
  };

  const getFileTypeIcon = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📽️';
      case 'txt':
        return '📃';
      case 'zip':
      case 'rar':
      case '7z':
        return '📦';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥';
      case 'mp3':
      case 'wav':
        return '🎵';
      default:
        return '📄';
    }
  };

  const processFile = async (file: File): Promise<ServiceDocument | null> => {
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return null;
    }

    try {
      setUploading(true);

      // In a real application, you would upload to a server here
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);

      const newFile: ServiceDocument = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url,
        size: file.size,
        type: file.type,
        order: files.length
      };

      return newFile;
    } catch (error) {
      setErrors(['文件处理失败，请重试']);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || disabled) return;

    const newErrors: string[] = [];
    const newFiles: ServiceDocument[] = [];

    for (let i = 0; i < Math.min(files.length, maxFiles - files.length); i++) {
      const file = files[i];
      const processedFile = await processFile(file);
      if (processedFile) {
        newFiles.push(processedFile);
      }
    }

    if (newFiles.length > 0) {
      onChange([...files, ...newFiles]);
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [disabled, files.length, maxFiles, onChange]);

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

    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [disabled, files.length, handleFileSelect]);

  const removeFile = (fileId: string) => {
    const fileToRemove = files.find(file => file.id === fileId);
    if (fileToRemove) {
      // Revoke object URL to free memory
      URL.revokeObjectURL(fileToRemove.url);
    }
    onChange(files.filter(file => file.id !== fileId));
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    if (!allowReorder) return;

    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);

    // Update order property
    newFiles.forEach((file, index) => {
      file.order = index;
    });

    onChange(newFiles);
  };

  const downloadFile = (file: ServiceDocument) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      {files.length < maxFiles && (
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                拖拽文件到这里，或者
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
              {uploading ? '上传中...' : '选择文件'}
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

      {/* File List */}
      {showPreview && files.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">
              已上传文件 ({files.length}/{maxFiles})
            </h4>
          </div>

          <div className="space-y-2">
            {files
              .sort((a, b) => a.order - b.order)
              .map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {/* File Icon */}
                    <div className="text-2xl">
                      {getFileTypeIcon(file.name)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {allowReorder && (
                      <div className="flex items-center space-x-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveFile(index, index - 1)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            title="向上移动"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>
                        )}
                        {index < files.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveFile(index, index + 1)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            title="向下移动"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => downloadFile(file)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="下载"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="删除"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;