import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  Camera,
  X,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Crop,
  RotateCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

import type { ProfileImage, ImageUploadOptions } from '@/types/profile';

interface ProfileAvatarUploadProps {
  value?: string;
  onChange: (avatar: string) => void;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  cropAspectRatio?: number;
  showPreview?: boolean;
  className?: string;
}

const DEFAULT_UPLOAD_OPTIONS: ImageUploadOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  cropRatio: 1, // Square for avatars
  compressQuality: 0.8,
  multiple: false
};

export const ProfileAvatarUpload: React.FC<ProfileAvatarUploadProps> = ({
  value,
  onChange,
  maxSize = DEFAULT_UPLOAD_OPTIONS.maxSize,
  acceptedTypes = DEFAULT_UPLOAD_OPTIONS.allowedTypes,
  cropAspectRatio = DEFAULT_UPLOAD_OPTIONS.cropRatio,
  showPreview = true,
  className = ''
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<ProfileImage | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(t('profile.avatar.invalidType'));
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(t('profile.avatar.fileTooLarge', {
        maxSize: (maxSize / 1024 / 1024).toFixed(1)
      }));
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowCropDialog(true);
  }, [acceptedTypes, maxSize, t]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const compressImage = async (file: File, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const maxDimension = 1200; // Max dimension for compression

        if (width > height) {
          if (width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(resolve, 'image/jpeg', quality);
        }
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (croppedBlob: Blob) => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Compress image
      const compressedBlob = await compressImage(croppedBlob, DEFAULT_UPLOAD_OPTIONS.compressQuality);

      // Create form data
      const formData = new FormData();
      const uploadFile = new File([compressedBlob], selectedFile.name, {
        type: 'image/jpeg'
      });
      formData.append('avatar', uploadFile);
      formData.append('type', 'avatar');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 100);

      // TODO: Replace with actual API call
      const response = await new Promise<{ url: string }>((resolve) => {
        setTimeout(() => {
          clearInterval(progressInterval);
          setUploadProgress(100);
          resolve({
            url: URL.createObjectURL(uploadFile)
          });
        }, 2000);
      });

      // Update state
      onChange(response.url);
      setUploadedImage({
        id: Date.now().toString(),
        url: response.url,
        type: 'avatar',
        name: selectedFile.name,
        size: uploadFile.size,
        uploadedAt: new Date().toISOString()
      });

      toast.success(t('profile.avatar.uploadSuccess'));
      setShowCropDialog(false);

    } catch (error) {
      console.error('Upload error:', error);
      setError(t('profile.avatar.uploadError'));
      toast.error(t('profile.avatar.uploadError'));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveAvatar = () => {
    onChange('');
    setUploadedImage(null);
    toast.success(t('profile.avatar.removeSuccess'));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar Display */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={value} alt="Profile avatar" />
            <AvatarFallback className="text-lg">
              {t('profile.avatar.placeholder')}
            </AvatarFallback>
          </Avatar>

          {value && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemoveAvatar}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-medium">{t('profile.avatar.title')}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {t('profile.avatar.description')}
          </p>
          <p className="text-xs text-gray-500">
            {t('profile.avatar.requirements', {
              types: acceptedTypes.join(', '),
              maxSize: formatFileSize(maxSize)
            })}
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Upload className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              {t('profile.avatar.uploadTitle')}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {t('profile.avatar.uploadDescription')}
            </p>
            <Button variant="outline" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              {t('profile.avatar.selectFile')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">
                  {t('profile.avatar.uploading')}
                </p>
                <Progress value={uploadProgress} className="h-2" />
              </div>
              <span className="text-sm text-gray-600">
                {Math.round(uploadProgress)}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('profile.avatar.cropTitle')}</DialogTitle>
          </DialogHeader>

          {previewUrl && (
            <div className="space-y-4">
              {/* Simple crop preview (in production, use a proper cropping library) */}
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Crop preview"
                    className="max-w-full max-h-96 object-contain"
                  />
                  <div
                    className="absolute border-2 border-blue-500 border-dashed"
                    style={{
                      width: '200px',
                      height: '200px',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCropDialog(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => {
                    // In production, get cropped blob from cropping library
                    fetch(previewUrl)
                      .then(res => res.blob())
                      .then(blob => handleUpload(blob));
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {t('profile.avatar.confirmCrop')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Uploaded Image Info */}
      {uploadedImage && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">{uploadedImage.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadedImage.size)} •
                  {new Date(uploadedImage.uploadedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};