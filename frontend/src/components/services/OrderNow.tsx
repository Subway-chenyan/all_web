import React, { useState } from 'react';
import { ShoppingCart, X, Upload, Calendar, Info, Check } from 'lucide-react';
import { ServicePackage, ServiceRequirement } from '@/types';
import { serviceService, CreateOrderData } from '@/services/services';
import { useI18n } from '@/i18n';

interface OrderNowProps {
  serviceId: string;
  serviceTitle: string;
  packages: ServicePackage[];
  requirements: ServiceRequirement[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (orderId: number) => void;
}

interface RequirementInputProps {
  requirement: ServiceRequirement;
  value: any;
  onChange: (value: any) => void;
}

const RequirementInput: React.FC<RequirementInputProps> = ({
  requirement,
  value,
  onChange
}) => {
  const renderInput = () => {
    switch (requirement.type) {
      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={requirement.placeholder || `请输入${requirement.title}`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            maxLength={requirement.maxCharacters}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={requirement.placeholder || `请输入${requirement.title}`}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">{requirement.title}</span>
          </label>
        );

      case 'file':
        return (
          <FileUpload
            value={value}
            onChange={onChange}
            allowedTypes={requirement.allowedFileTypes}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {requirement.title}
        {requirement.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {requirement.type === 'text' && requirement.maxCharacters && (
        <p className="text-xs text-gray-500 text-right">
          {value?.length || 0}/{requirement.maxCharacters} 字符
        </p>
      )}
    </div>
  );
};

interface FileUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  allowedTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  allowedTypes = ['image/*', '.pdf', '.doc', '.docx']
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert('文件大小不能超过50MB');
        return;
      }
      onChange(file);
    }
  };

  const removeFile = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          type="file"
          onChange={handleFileChange}
          accept={allowedTypes.join(',')}
          className="hidden"
          id={`file-upload-${Math.random()}`}
        />
        {!value ? (
          <label
            htmlFor={`file-upload-${Math.random()}`}
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">点击上传文件</span>
            <span className="text-xs text-gray-500 mt-1">
              支持图片、PDF、Word文档，最大50MB
            </span>
          </label>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{value.name}</p>
                <p className="text-xs text-gray-500">
                  {(value.size / 1024 / 1024).toFixed(2)}MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const OrderNow: React.FC<OrderNowProps> = ({
  serviceId,
  serviceTitle,
  packages,
  requirements,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t, formatCurrency, formatDate } = useI18n();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(
    packages.length === 1 ? packages[0].id : null
  );
  const [requirementValues, setRequirementValues] = useState<Record<string, any>>({});
  const [customRequirements, setCustomRequirements] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'package' | 'requirements' | 'review'>('package');

  const selectedPackageData = packages.find(pkg => pkg.id === selectedPackage);

  const handlePackageSelect = (packageId: number) => {
    setSelectedPackage(packageId);
    setStep('requirements');
  };

  const handleRequirementChange = (requirementId: string, value: any) => {
    setRequirementValues(prev => ({
      ...prev,
      [requirementId]: value
    }));
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`文件 ${file.name} 大小超过10MB`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = () => {
    if (step === 'package') {
      if (!selectedPackage) {
        setError('请选择一个套餐');
        return false;
      }
    } else if (step === 'requirements') {
      const requiredFields = requirements.filter(req => req.required);
      for (const field of requiredFields) {
        if (!requirementValues[field.id]) {
          setError(`请填写必填项: ${field.title}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 'package') {
        setStep('requirements');
      } else if (step === 'requirements') {
        setStep('review');
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const orderData: CreateOrderData = {
        serviceId: parseInt(serviceId),
        packageId: selectedPackage || undefined,
        requirements: requirementValues,
        customRequirements: customRequirements || undefined,
        deliveryDate: deliveryDate || undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      };

      const response = await serviceService.createOrder(orderData);

      if (response.success && response.data) {
        onSuccess?.(response.data.orderId);
        onClose();
        // Reset form
        setSelectedPackage(packages.length === 1 ? packages[0].id : null);
        setRequirementValues({});
        setCustomRequirements('');
        setDeliveryDate('');
        setAttachments([]);
        setStep('package');
      } else {
        setError(response.error || '创建订单失败，请重试');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    下单购买
                  </h3>
                  <p className="text-sm text-gray-600">
                    {serviceTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {[
                { key: 'package', label: '选择套餐' },
                { key: 'requirements', label: '填写需求' },
                { key: 'review', label: '确认订单' }
              ].map((item, index) => (
                <React.Fragment key={item.key}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === item.key
                        ? 'bg-blue-600 text-white'
                        : step === 'review' && ['package', 'requirements'].includes(item.key)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step === 'review' && ['package', 'requirements'].includes(item.key) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`text-xs mt-1 ${
                      step === item.key ? 'text-blue-600 font-medium' : 'text-gray-600'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-px mx-2 ${
                      step === 'review' || (step === 'requirements' && item.key === 'package')
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Package Selection */}
            {step === 'package' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">选择套餐</h4>
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedPackage === pkg.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900">{pkg.name}</h5>
                            {pkg.isPopular && (
                              <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                                推荐
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>📅 {pkg.deliveryTime}天</span>
                            <span>🔄 {pkg.revisions}次修改</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            {formatCurrency(pkg.price)}
                          </div>
                          <input
                            type="radio"
                            checked={selectedPackage === pkg.id}
                            onChange={() => setSelectedPackage(pkg.id)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Requirements */}
            {step === 'requirements' && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">填写需求</h4>

                {/* Package Info */}
                {selectedPackageData && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">已选套餐</h5>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-800 font-medium">{selectedPackageData.name}</p>
                        <p className="text-sm text-blue-700">{selectedPackageData.description}</p>
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {formatCurrency(selectedPackageData.price)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Required Fields */}
                {requirements.length > 0 && (
                  <div className="space-y-4">
                    {requirements.map((requirement) => (
                      <RequirementInput
                        key={requirement.id}
                        requirement={requirement}
                        value={requirementValues[requirement.id]}
                        onChange={(value) => handleRequirementChange(requirement.id, value)}
                      />
                    ))}
                  </div>
                )}

                {/* Custom Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    补充说明
                  </label>
                  <textarea
                    value={customRequirements}
                    onChange={(e) => setCustomRequirements(e.target.value)}
                    placeholder="请补充说明您的具体需求、期望效果等..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                  />
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    期望交付日期
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    相关文件
                  </label>
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        onChange={handleAttachmentChange}
                        className="hidden"
                        id="attachments-upload"
                      />
                      <label
                        htmlFor="attachments-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">点击上传附件</span>
                        <span className="text-xs text-gray-500 mt-1">
                          最多3个文件，每个不超过10MB
                        </span>
                      </label>
                    </div>

                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <Info className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)}MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 'review' && (
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">确认订单信息</h4>

                {/* Order Summary */}
                <div className="space-y-4">
                  {/* Package */}
                  {selectedPackageData && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">套餐信息</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{selectedPackageData.name}</span>
                          <span className="font-medium">{formatCurrency(selectedPackageData.price)}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          交付时间: {selectedPackageData.deliveryTime}天
                        </div>
                        <div className="text-sm text-gray-500">
                          修改次数: {selectedPackageData.revisions}次
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Requirements Summary */}
                  {Object.keys(requirementValues).length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">需求信息</h5>
                      <div className="space-y-2">
                        {Object.entries(requirementValues).map(([key, value]) => {
                          const requirement = requirements.find(req => req.id === key);
                          if (!requirement) return null;

                          let displayValue = value;
                          if (requirement.type === 'file' && value instanceof File) {
                            displayValue = value.name;
                          } else if (requirement.type === 'boolean') {
                            displayValue = value ? '是' : '否';
                          }

                          return (
                            <div key={key} className="text-sm">
                              <span className="text-gray-600">{requirement.title}: </span>
                              <span className="text-gray-900">{displayValue}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom Requirements */}
                  {customRequirements && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">补充说明</h5>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {customRequirements}
                      </p>
                    </div>
                  )}

                  {/* Delivery Date */}
                  {deliveryDate && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">交付日期</h5>
                      <p className="text-sm text-gray-700">{formatDate(deliveryDate)}</p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">总计</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(selectedPackageData?.price || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-medium text-yellow-900 mb-2">下单须知</h5>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• 付款后卖家将根据您的需求开始工作</li>
                    <li>• 请确保需求描述清晰完整</li>
                    <li>• 交付时间从确认需求后开始计算</li>
                    <li>• 如有疑问，请在下单前联系卖家</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 pb-0">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (step === 'requirements') {
                    setStep('package');
                  } else if (step === 'review') {
                    setStep('requirements');
                  }
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {step === 'package' ? '取消' : '上一步'}
              </button>

              <div className="flex items-center space-x-3">
                {step !== 'review' ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    下一步
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '创建订单中...' : '确认下单'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderNow;