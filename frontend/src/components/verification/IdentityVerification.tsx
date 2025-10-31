import React, { useState, useCallback } from 'react';
import { Upload, Camera, AlertCircle, CheckCircle, X } from 'lucide-react';
import { verificationService } from '../../services/verification';
import { VerificationDocument } from '../../types';

interface IdentityVerificationProps {
  onVerificationComplete: (document: VerificationDocument) => void;
  onVerificationError: (error: string) => void;
}

export const IdentityVerification: React.FC<IdentityVerificationProps> = ({
  onVerificationComplete,
  onVerificationError,
}) => {
  const [documents, setDocuments] = useState<{
    idCard?: File;
    passport?: File;
    selfie?: File;
  }>({});

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFileSelect = useCallback((type: 'idCard' | 'passport' | 'selfie', file: File) => {
    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      onVerificationError('请上传 JPG、PNG 或 WebP 格式的图片');
      return;
    }

    if (file.size > maxSize) {
      onVerificationError('文件大小不能超过 10MB');
      return;
    }

    setDocuments(prev => ({ ...prev, [type]: file }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
  }, [onVerificationError]);

  const handleDrop = useCallback((e: React.DragEvent, type: 'idCard' | 'passport' | 'selfie') => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(type, files[0]);
    }
  }, [handleFileSelect]);

  const removeDocument = useCallback((type: 'idCard' | 'passport' | 'selfie') => {
    setDocuments(prev => {
      const newDocs = { ...prev };
      delete newDocs[type];
      return newDocs;
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[type];
      return newProgress;
    });
  }, []);

  const uploadDocuments = useCallback(async () => {
    if (Object.keys(documents).length === 0) {
      onVerificationError('请至少上传一份身份证明文件');
      return;
    }

    setIsUploading(true);
    setVerificationStatus('uploading');

    try {
      const uploadedDocs: VerificationDocument[] = [];

      for (const [type, file] of Object.entries(documents)) {
        const documentType = type === 'idCard' ? 'id_card' : type === 'passport' ? 'passport' : 'selfie';

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [type]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const uploadedDoc = await verificationService.uploadDocument(
          documentType,
          file,
          {
            purpose: 'identity_verification',
            metadata: JSON.stringify({
              originalName: file.name,
              fileSize: file.size,
              uploadedAt: new Date().toISOString(),
            }),
          }
        );

        uploadedDocs.push(uploadedDoc);
      }

      setVerificationStatus('success');
      onVerificationComplete(uploadedDocs[0]); // Return the primary document

    } catch (error: any) {
      setVerificationStatus('error');
      onVerificationError(error.message || '上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  }, [documents, onVerificationComplete, onVerificationError]);

  const DocumentUploadArea: React.FC<{
    type: 'idCard' | 'passport' | 'selfie';
    title: string;
    description: string;
    example: string;
  }> = ({ type, title, description, example }) => (
    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        {documents[type] && (
          <button
            onClick={() => removeDocument(type)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {!documents[type] ? (
        <div
          onDrop={(e) => handleDrop(e, type)}
          onDragOver={(e) => e.preventDefault()}
          className="relative"
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(type, e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center py-8">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">
                  点击上传
                </span>
                <span className="text-gray-600"> 或拖拽文件到此处</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              支持 JPG、PNG、WebP 格式，最大 10MB
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">{example}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">已选择文件</p>
              <p className="text-xs text-green-700">{documents[type]?.name}</p>
              <p className="text-xs text-green-600">
                {((documents[type]?.size || 0) / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {uploadProgress[type] !== undefined && uploadProgress[type] > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress[type]}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">身份验证要求</h3>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• 请确保文件清晰可见，所有信息完整</li>
              <li>• 文件上的姓名必须与您注册时的姓名一致</li>
              <li>• 所有文件必须是有效的且在有效期内</li>
              <li>• 我们将通过加密方式安全处理您的个人信息</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <DocumentUploadArea
          type="idCard"
          title="身份证"
          description="上传身份证正反面照片"
          example="示例：身份证应包含姓名、身份证号、出生日期、住址等信息"
        />

        <DocumentUploadArea
          type="passport"
          title="护照"
          description="上传护照信息页照片"
          example="示例：护照应包含姓名、护照号、出生日期、国籍等信息"
        />
      </div>

      <DocumentUploadArea
        type="selfie"
        title="手持证件自拍"
        description="手持身份证或护照的自拍照片"
        example="示例：手持证件放在胸前，面部和证件信息都清晰可见"
      />

      {verificationStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">上传失败，请检查文件后重试</p>
          </div>
        </div>
      )}

      {verificationStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-green-800">文件上传成功，正在审核中</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={uploadDocuments}
          disabled={isUploading || Object.keys(documents).length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? '上传中...' : '提交验证'}
        </button>
      </div>
    </div>
  );
};