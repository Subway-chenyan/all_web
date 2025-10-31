import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, User, Briefcase } from 'lucide-react';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { IdentityVerification } from '../../components/verification/IdentityVerification';
import { PhoneVerification } from '../../components/verification/PhoneVerification';
import { SkillsVerification } from '../../components/verification/SkillsVerification';
import { PortfolioReview } from '../../components/verification/PortfolioReview';
import { ProfessionalCertification } from '../../components/verification/ProfessionalCertification';
import { verificationService } from '../../services/verification';
import { VerificationDocument, SkillItem, PortfolioItem, CertificationItem } from '../../types';

const REGISTRATION_STEPS = [
  '基本信息',
  '身份验证',
  '手机验证',
  '技能评估',
  '作品集',
  '专业认证',
  '完成'
];

interface RegistrationData {
  // Basic info will be collected in step 1
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  phone: string;
  agreeToTerms: boolean;
  // Verification data
  identityDocuments: VerificationDocument[];
  verifiedPhone: string;
  skills: SkillItem[];
  portfolio: PortfolioItem[];
  certifications: CertificationItem[];
}

export const FreelancerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    phone: '',
    agreeToTerms: false,
    identityDocuments: [],
    verifiedPhone: '',
    skills: [],
    portfolio: [],
    certifications: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = useCallback(() => {
    if (currentStep < REGISTRATION_STEPS.length) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  }, [currentStep]);

  const handleStepClick = useCallback((stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex + 1);
      setErrors({});
    }
  }, [currentStep]);

  const handleVerificationComplete = useCallback((
    type: 'identity' | 'phone' | 'skills' | 'portfolio' | 'certifications',
    data: any
  ) => {
    setRegistrationData(prev => ({
      ...prev,
      [type === 'identity' ? 'identityDocuments' :
       type === 'phone' ? 'verifiedPhone' :
       type === 'skills' ? 'skills' :
       type === 'portfolio' ? 'portfolio' :
       'certifications']: data
    }));
  }, []);

  const handleError = useCallback((error: string) => {
    setErrors({ general: error });
  }, []);

  const validateCurrentStep = useCallback(() => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!registrationData.firstName.trim()) {
          newErrors.firstName = '请输入姓名';
        }
        if (!registrationData.lastName.trim()) {
          newErrors.lastName = '请输入姓氏';
        }
        if (!registrationData.email.trim()) {
          newErrors.email = '请输入邮箱';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationData.email)) {
          newErrors.email = '请输入有效的邮箱地址';
        }
        if (!registrationData.password) {
          newErrors.password = '请输入密码';
        } else if (registrationData.password.length < 8) {
          newErrors.password = '密码至少需要8个字符';
        }
        if (registrationData.password !== registrationData.confirmPassword) {
          newErrors.confirmPassword = '密码确认不匹配';
        }
        if (!registrationData.username.trim()) {
          newErrors.username = '请输入用户名';
        } else if (registrationData.username.length < 3) {
          newErrors.username = '用户名至少需要3个字符';
        }
        if (!registrationData.agreeToTerms) {
          newErrors.agreeToTerms = '请同意服务条款';
        }
        break;

      case 2:
        if (registrationData.identityDocuments.length === 0) {
          newErrors.identity = '请完成身份验证';
        }
        break;

      case 3:
        if (!registrationData.verifiedPhone) {
          newErrors.phone = '请完成手机验证';
        }
        break;

      case 4:
        if (registrationData.skills.length === 0) {
          newErrors.skills = '请至少添加一个技能';
        }
        break;

      case 5:
        if (registrationData.portfolio.length === 0) {
          newErrors.portfolio = '请至少添加一个作品集项目';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, registrationData]);

  const handleStepSubmit = useCallback(async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === REGISTRATION_STEPS.length - 1) {
      // Final submission
      await handleSubmitRegistration();
    } else {
      handleNext();
    }
  }, [currentStep, validateCurrentStep, handleNext]);

  const handleSubmitRegistration = useCallback(async () => {
    setIsLoading(true);
    try {
      // Here you would integrate with your auth service
      // For now, we'll just submit verification data
      await verificationService.submitVerification();

      // Redirect to dashboard or onboarding completion page
      navigate('/dashboard/freelancer');
    } catch (error: any) {
      setErrors({ submit: error.message || '注册失败，请重试' });
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={registrationData} onChange={setRegistrationData} errors={errors} />;
      case 2:
        return (
          <IdentityVerification
            onVerificationComplete={(docs) => handleVerificationComplete('identity', docs)}
            onVerificationError={handleError}
          />
        );
      case 3:
        return (
          <PhoneVerification
            initialPhone={registrationData.phone}
            onVerificationComplete={(phone) => handleVerificationComplete('phone', phone)}
            onVerificationError={handleError}
          />
        );
      case 4:
        return (
          <SkillsVerification
            onSkillsUpdate={(skills) => handleVerificationComplete('skills', skills)}
            onVerificationError={handleError}
          />
        );
      case 5:
        return (
          <PortfolioReview
            onPortfolioUpdate={(portfolio) => handleVerificationComplete('portfolio', portfolio)}
            onVerificationError={handleError}
          />
        );
      case 6:
        return (
          <ProfessionalCertification
            onCertificationsUpdate={(certs) => handleVerificationComplete('certifications', certs)}
            onVerificationError={handleError}
          />
        );
      case 7:
        return <CompletionStep data={registrationData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">自由职业者注册</h1>
          </div>
          <p className="text-gray-600">
            加入我们的平台，展示您的专业技能，开启自由职业生涯
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={REGISTRATION_STEPS.length}
            stepTitles={REGISTRATION_STEPS}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Error Alert */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-800">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一步
          </button>

          <button
            onClick={handleStepSubmit}
            disabled={isLoading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '提交中...' : (
              <>
                {currentStep === REGISTRATION_STEPS.length ? '完成注册' : '下一步'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Basic Info Step Component
const BasicInfoStep: React.FC<{
  data: RegistrationData;
  onChange: (data: RegistrationData) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, errors }) => {
  const handleChange = (field: keyof RegistrationData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <User className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-900">基本信息</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            姓名 *
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入您的姓名"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            姓氏 *
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入您的姓氏"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            邮箱地址 *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            用户名 *
          </label>
          <input
            type="text"
            value={data.username}
            onChange={(e) => handleChange('username', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="选择一个用户名"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            密码 *
          </label>
          <input
            type="password"
            value={data.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="至少8个字符"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            确认密码 *
          </label>
          <input
            type="password"
            value={data.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="再次输入密码"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.agreeToTerms}
            onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            我同意{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-700">
              服务条款
            </a>{' '}
            和{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-700">
              隐私政策
            </a>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
        )}
      </div>
    </div>
  );
};

// Completion Step Component
const CompletionStep: React.FC<{ data: RegistrationData }> = ({ data }) => {
  return (
    <div className="text-center space-y-6">
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          注册完成！
        </h2>
        <p className="text-gray-600">
          恭喜您完成自由职业者注册，您的信息正在审核中
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-gray-900 mb-4">注册摘要</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">姓名:</span>
            <span className="font-medium">{data.firstName} {data.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">邮箱:</span>
            <span className="font-medium">{data.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">用户名:</span>
            <span className="font-medium">{data.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">技能:</span>
            <span className="font-medium">{data.skills.length} 项</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">作品集:</span>
            <span className="font-medium">{data.portfolio.length} 个项目</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">认证:</span>
            <span className="font-medium">{data.certifications.length} 个证书</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          我们会在24-48小时内审核您的申请，审核通过后您将收到邮件通知
        </p>
      </div>
    </div>
  );
};