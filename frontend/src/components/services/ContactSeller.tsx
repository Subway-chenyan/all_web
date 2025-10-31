import React, { useState } from 'react';
import { MessageCircle, X, Upload, Paperclip, Clock, DollarSign } from 'lucide-react';
import { serviceService, ContactSellerData } from '@/services/services';
import { useI18n } from '@/i18n';

interface ContactSellerProps {
  serviceId: string;
  serviceTitle: string;
  sellerId: string;
  sellerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (conversationId: number) => void;
}

interface QuickQuestionProps {
  question: string;
  onSelect: (question: string) => void;
}

const QuickQuestion: React.FC<QuickQuestionProps> = ({ question, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(question)}
      className="p-3 text-left bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
    >
      {question}
    </button>
  );
};

export const ContactSeller: React.FC<ContactSellerProps> = ({
  serviceId,
  serviceTitle,
  sellerId,
  sellerName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t, formatCurrency } = useI18n();
  const [formData, setFormData] = useState({
    message: '',
    budget: '',
    timeline: ''
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const quickQuestions = [
    '您好，这个服务包含哪些具体内容？',
    '可以提供一些之前的案例参考吗？',
    '交付时间是否可以调整？',
    '支持分期付款吗？',
    '如果需要额外功能，如何计费？'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleQuickQuestionSelect = (question: string) => {
    setFormData(prev => ({ ...prev, message: question }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validTypes = ['image/', 'application/pdf', 'text/', 'application/msword', 'application/vnd.openxmlformats-officedocument.'];

      if (file.size > maxSize) {
        alert('文件大小不能超过10MB');
        return false;
      }

      if (!validTypes.some(type => file.type.startsWith(type))) {
        alert('仅支持图片、PDF、Word和文本文件');
        return false;
      }

      return true;
    });

    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.message.trim()) {
      setError('请输入消息内容');
      return false;
    }
    if (formData.message.trim().length < 10) {
      setError('消息内容至少需要10个字符');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const contactData: ContactSellerData = {
        serviceId: parseInt(serviceId),
        message: formData.message,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        timeline: formData.timeline || undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      };

      const response = await serviceService.contactSeller(contactData);

      if (response.success && response.data) {
        onSuccess?.(response.data.conversationId);
        onClose();
        // Reset form
        setFormData({ message: '', budget: '', timeline: '' });
        setAttachments([]);
      } else {
        setError(response.error || '发送失败，请重试');
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
        <div className="relative bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    联系卖家
                  </h3>
                  <p className="text-sm text-gray-600">
                    向 {sellerName} 咨询服务: {serviceTitle}
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
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Quick Questions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                常见问题
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickQuestions.map((question, index) => (
                  <QuickQuestion
                    key={index}
                    question={question}
                    onSelect={handleQuickQuestionSelect}
                  />
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                您的消息 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="请详细描述您的需求，以便卖家更好地为您服务..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={5}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.message.length}/500 字符
              </p>
            </div>

            {/* Budget and Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  预算范围
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="您的预算"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  期望时间
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    placeholder="例如: 2周内"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                附件 (可选)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    拖拽文件到此处或
                    <span className="text-blue-600 hover:text-blue-700"> 点击上传</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    支持图片、PDF、Word文档，最大10MB，最多5个文件
                  </p>
                </label>
              </div>

              {/* Attached Files */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <Paperclip className="w-4 h-4 text-gray-500" />
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
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Tips */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                温馨提示
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 请详细描述您的需求，以便卖家准确报价</li>
                <li>• 如有参考文件，建议一并提供</li>
                <li>• 卖家通常会在24小时内回复</li>
                <li>• 请勿在此处发送付款或个人敏感信息</li>
              </ul>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                取消
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '发送中...' : '发送消息'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSeller;