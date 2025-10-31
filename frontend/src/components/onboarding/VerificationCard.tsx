import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, FileText, Upload, Star } from 'lucide-react';
import { VerificationStep } from '../../types';

interface VerificationCardProps {
  step: VerificationStep;
  onStepSelect: () => void;
  isExpanded?: boolean;
  children?: React.ReactNode;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  step,
  onStepSelect,
  isExpanded = false,
  children,
}) => {
  const getIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in_progress':
        return 'border-blue-200 bg-blue-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getButtonText = () => {
    switch (step.status) {
      case 'completed':
        return '查看详情';
      case 'in_progress':
        return '继续完成';
      case 'failed':
        return '重新提交';
      default:
        return '开始验证';
    }
  };

  const getButtonColor = () => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-600 hover:bg-green-700';
      case 'failed':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-6 transition-all duration-300 ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {step.type === 'required' && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
              必需
            </span>
          )}
          {step.type === 'optional' && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
              可选
            </span>
          )}
        </div>
      </div>

      {/* Status Details */}
      {step.status === 'completed' && (
        <div className="bg-green-100 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">已完成验证</span>
          </div>
        </div>
      )}

      {step.status === 'failed' && (
        <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center text-red-800">
            <XCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">验证失败，请重新提交</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {step.estimatedTime && (
            <span>预计用时: {step.estimatedTime} 分钟</span>
          )}
        </div>

        <button
          onClick={onStepSelect}
          className={`px-4 py-2 text-white rounded-lg transition-colors ${getButtonColor()}`}
        >
          {getButtonText()}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && children && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

// Specialized verification cards for different types
export const IdentityVerificationCard: React.FC<{
  step: VerificationStep;
  onSelect: () => void;
}> = ({ step, onSelect }) => (
  <VerificationCard step={step} onStepSelect={onSelect}>
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <FileText className="w-4 h-4" />
        <span>需要上传: 身份证或护照</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Upload className="w-4 h-4" />
        <span>支持格式: JPG, PNG, PDF</span>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <p className="text-xs text-yellow-800">
          确保证件信息清晰可见，有效期内的证件照片
        </p>
      </div>
    </div>
  </VerificationCard>
);

export const SkillsVerificationCard: React.FC<{
  step: VerificationStep;
  onSelect: () => void;
}> = ({ step, onSelect }) => (
  <VerificationCard step={step} onStepSelect={onSelect}>
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Star className="w-4 h-4" />
        <span>选择您的专业技能领域</span>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-xs text-blue-800">
          选择您擅长的技能，诚实评估熟练程度和经验年限
        </p>
      </div>
    </div>
  </VerificationCard>
);

export const PortfolioVerificationCard: React.FC<{
  step: VerificationStep;
  onSelect: () => void;
}> = ({ step, onSelect }) => (
  <VerificationCard step={step} onStepSelect={onSelect}>
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Upload className="w-4 h-4" />
        <span>展示您最优秀的项目作品</span>
      </div>
      <div className="bg-green-50 border border-green-200 rounded p-3">
        <p className="text-xs text-green-800">
          上传项目截图、描述和技术栈，提高您的可信度
        </p>
      </div>
    </div>
  </VerificationCard>
);