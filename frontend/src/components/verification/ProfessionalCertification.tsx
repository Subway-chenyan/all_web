import React, { useState, useCallback } from 'react';
import { Upload, FileText, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { verificationService } from '../../services/verification';
import { CertificationItem } from '../../types';

interface ProfessionalCertificationProps {
  onCertificationsUpdate: (certifications: CertificationItem[]) => void;
  onVerificationError: (error: string) => void;
}

interface CertificationForm {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  document?: File;
}

export const ProfessionalCertification: React.FC<ProfessionalCertificationProps> = ({
  onCertificationsUpdate,
  onVerificationError,
}) => {
  const [certifications, setCertifications] = useState<CertificationForm[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const [newCertification, setNewCertification] = useState<CertificationForm>({
    id: Date.now().toString(),
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  });

  const handleInputChange = useCallback((
    field: keyof CertificationForm,
    value: string | File
  ) => {
    setNewCertification(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      onVerificationError('请上传 PDF、JPG、PNG 或 WebP 格式的文件');
      return;
    }

    if (file.size > maxSize) {
      onVerificationError('文件大小不能超过 10MB');
      return;
    }

    handleInputChange('document', file);
  }, [handleInputChange, onVerificationError]);

  const addCertification = useCallback(() => {
    // Validate required fields
    if (!newCertification.name.trim()) {
      onVerificationError('请输入证书名称');
      return;
    }

    if (!newCertification.issuingOrganization.trim()) {
      onVerificationError('请输入颁发机构');
      return;
    }

    if (!newCertification.issueDate) {
      onVerificationError('请选择颁发日期');
      return;
    }

    if (!newCertification.document) {
      onVerificationError('请上传证书文件');
      return;
    }

    setCertifications(prev => [...prev, newCertification]);
    setNewCertification({
      id: Date.now().toString(),
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
    });
    setIsAdding(false);
  }, [newCertification, onVerificationError]);

  const removeCertification = useCallback((id: string) => {
    setCertifications(prev => prev.filter(cert => cert.id !== id));
  }, []);

  const uploadCertifications = useCallback(async () => {
    if (certifications.length === 0) {
      onVerificationError('请至少添加一个专业证书');
      return;
    }

    setIsUploading(true);

    try {
      const uploadedCertifications: CertificationItem[] = [];

      for (const cert of certifications) {
        if (!cert.document) continue;

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [cert.id]: progress }));
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        const documentUrl = await verificationService.uploadDocument(
          'professional_cert',
          cert.document,
          {
            name: cert.name,
            issuing_organization: cert.issuingOrganization,
            issue_date: cert.issueDate,
            expiry_date: cert.expiryDate,
            credential_id: cert.credentialId,
            credential_url: cert.credentialUrl,
          }
        );

        uploadedCertifications.push({
          id: cert.id,
          name: cert.name,
          issuingOrganization: cert.issuingOrganization,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate || undefined,
          credentialId: cert.credentialId || undefined,
          credentialUrl: cert.credentialUrl || undefined,
          document: documentUrl.fileUrl,
          status: 'pending',
        });
      }

      onCertificationsUpdate(uploadedCertifications);

    } catch (error: any) {
      onVerificationError(error.message || '上传失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  }, [certifications, onCertificationsUpdate, onVerificationError]);

  const CertificationCard: React.FC<{ certification: CertificationForm }> = ({
    certification,
  }) => (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{certification.name}</h4>
          <p className="text-sm text-gray-600">{certification.issuingOrganization}</p>
        </div>
        <button
          onClick={() => removeCertification(certification.id)}
          className="text-red-500 hover:text-red-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">颁发日期：</span>
          <span className="text-gray-900">{certification.issueDate}</span>
        </div>
        {certification.expiryDate && (
          <div>
            <span className="text-gray-500">到期日期：</span>
            <span className="text-gray-900">{certification.expiryDate}</span>
          </div>
        )}
        {certification.credentialId && (
          <div>
            <span className="text-gray-500">证书编号：</span>
            <span className="text-gray-900">{certification.credentialId}</span>
          </div>
        )}
      </div>

      {certification.document && (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <FileText className="w-4 h-4" />
          <span>{certification.document.name}</span>
        </div>
      )}

      {uploadProgress[certification.id] !== undefined && (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress[certification.id]}%` }}
          />
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
            <h3 className="text-sm font-semibold text-blue-900">专业认证说明</h3>
            <p className="mt-1 text-sm text-blue-800">
              上传您的专业证书、资格认证或学历证明，这将帮助提高您的可信度和竞争力。
            </p>
          </div>
        </div>
      </div>

      {/* Existing Certifications */}
      {certifications.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">已添加的证书</h3>
          <div className="grid gap-3">
            {certifications.map(cert => (
              <CertificationCard key={cert.id} certification={cert} />
            ))}
          </div>
        </div>
      )}

      {/* Add New Certification Form */}
      {isAdding && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">添加专业证书</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                证书名称 *
              </label>
              <input
                type="text"
                value={newCertification.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：PMP项目管理认证"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                颁发机构 *
              </label>
              <input
                type="text"
                value={newCertification.issuingOrganization}
                onChange={(e) => handleInputChange('issuingOrganization', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：Project Management Institute"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                颁发日期 *
              </label>
              <input
                type="date"
                value={newCertification.issueDate}
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                到期日期
              </label>
              <input
                type="date"
                value={newCertification.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                证书编号
              </label>
              <input
                type="text"
                value={newCertification.credentialId}
                onChange={(e) => handleInputChange('credentialId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="证书上的唯一编号"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                验证链接
              </label>
              <input
                type="url"
                value={newCertification.credentialUrl}
                onChange={(e) => handleInputChange('credentialUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              证书文件 *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="cert-file"
              />
              <label
                htmlFor="cert-file"
                className="cursor-pointer flex flex-col items-center justify-center py-4"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {newCertification.document ? newCertification.document.name : '点击上传证书文件'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  支持 PDF、JPG、PNG、WebP 格式，最大 10MB
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={addCertification}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加证书
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          添加专业证书
        </button>
      )}

      {/* Upload Button */}
      {certifications.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={uploadCertifications}
            disabled={isUploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? '上传中...' : '提交所有证书'}
          </button>
        </div>
      )}
    </div>
  );
};