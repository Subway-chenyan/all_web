import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Building, User } from 'lucide-react';
import { StepGuide } from '../../components/onboarding/StepGuide';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { ProfessionalInfoForm } from '../../components/onboarding/ProfessionalInfoForm';
import { SkillAssessment } from '../../components/onboarding/SkillAssessment';
import { PortfolioUpload } from '../../components/onboarding/PortfolioUpload';
import { PricingWizard } from '../../components/onboarding/PricingWizard';
import { verificationService } from '../../services/verification';
import { FreelancerProfile, OnboardingProgress, VerificationStep } from '../../types';

const ONBOARDING_STEPS = [
  { id: 'account_type', title: '账户类型', description: '选择个人或企业账户', type: 'required' as const, order: 1, estimatedTime: 5 },
  { id: 'professional_info', title: '专业信息', description: '完善个人或企业资料', type: 'required' as const, order: 2, estimatedTime: 15 },
  { id: 'skills_assessment', title: '技能评估', description: '选择和评估您的专业技能', type: 'required' as const, order: 3, estimatedTime: 20 },
  { id: 'portfolio', title: '作品集', description: '上传和展示您的作品', type: 'required' as const, order: 4, estimatedTime: 30 },
  { id: 'pricing', title: '定价策略', description: '设置服务价格和套餐', type: 'required' as const, order: 5, estimatedTime: 15 },
  { id: 'verification', title: '身份验证', description: '完成身份和专业认证', type: 'required' as const, order: 6, estimatedTime: 20 },
  { id: 'review', title: '最终审核', description: '检查并提交申请', type: 'required' as const, order: 7, estimatedTime: 10 },
];

export const FreelancerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('account_type');
  const [profileData, setProfileData] = useState<Partial<FreelancerProfile>>({});
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress>({
    currentStep: 'account_type',
    completedSteps: [],
    savedData: {},
    isCompleted: false,
    startedAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await verificationService.getOnboardingProgress();
        setOnboardingProgress(progress);
        if (progress.currentStep) {
          setCurrentStep(progress.currentStep);
        }
        if (progress.savedData) {
          setProfileData(progress.savedData);
        }
      } catch (error) {
        console.error('Failed to load onboarding progress:', error);
      }
    };
    loadProgress();
  }, []);

  const saveProgress = useCallback(async (stepData?: Record<string, any>) => {
    setSaveStatus('saving');
    try {
      const dataToSave = stepData || profileData;
      await verificationService.saveOnboardingProgress(currentStep, dataToSave);

      setOnboardingProgress(prev => ({
        ...prev,
        currentStep,
        completedSteps: prev.completedSteps.includes(currentStep)
          ? prev.completedSteps
          : [...prev.completedSteps, currentStep],
        savedData: { ...prev.savedData, ...dataToSave },
      }));

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save progress:', error);
    }
  }, [currentStep, profileData]);

  const handleStepChange = useCallback((stepId: string) => {
    const currentStepIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep);
    const targetStepIndex = ONBOARDING_STEPS.findIndex(step => step.id === stepId);

    // Only allow moving forward or to completed steps
    if (targetStepIndex <= currentStepIndex || onboardingProgress.completedSteps.includes(stepId)) {
      setCurrentStep(stepId);
    }
  }, [currentStep, onboardingProgress.completedSteps]);

  const handleNext = useCallback(async () => {
    await saveProgress();

    const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      const nextStep = ONBOARDING_STEPS[currentIndex + 1];
      setCurrentStep(nextStep.id);
    }
  }, [currentStep, saveProgress]);

  const handlePrevious = useCallback(() => {
    const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = ONBOARDING_STEPS[currentIndex - 1];
      setCurrentStep(prevStep.id);
    }
  }, [currentStep]);

  const handleDataUpdate = useCallback((data: Partial<FreelancerProfile>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  }, []);

  const handleSubmitApplication = useCallback(async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      // Complete onboarding
      await verificationService.completeOnboarding();

      // Submit freelancer profile
      if (Object.keys(profileData).length > 0) {
        await verificationService.updateFreelancerProfile(profileData as FreelancerProfile);
      }

      setOnboardingProgress(prev => ({
        ...prev,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      }));

      navigate('/dashboard/freelancer');
    } catch (error: any) {
      setErrors([error.message || '提交失败，请重试']);
    } finally {
      setIsLoading(false);
    }
  }, [profileData, navigate]);

  const validateCurrentStep = useCallback(() => {
    const validationErrors: string[] = [];

    switch (currentStep) {
      case 'account_type':
        if (!profileData.accountType) {
          validationErrors.push('请选择账户类型');
        }
        if (profileData.accountType === 'company' && !profileData.companyName) {
          validationErrors.push('请输入公司名称');
        }
        break;

      case 'professional_info':
        if (!profileData.professionalTitle) {
          validationErrors.push('请输入职业头衔');
        }
        if (!profileData.bio || profileData.bio.length < 50) {
          validationErrors.push('个人简介至少需要50个字符');
        }
        break;

      case 'skills_assessment':
        if (!profileData.skills || profileData.skills.length === 0) {
          validationErrors.push('请至少添加一个技能');
        }
        break;

      case 'portfolio':
        if (!profileData.portfolio || profileData.portfolio.length === 0) {
          validationErrors.push('请至少添加一个作品集项目');
        }
        break;

      case 'pricing':
        if (!profileData.hourlyRate || profileData.hourlyRate <= 0) {
          validationErrors.push('请设置有效的小时费率');
        }
        break;
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  }, [currentStep, profileData]);

  const renderStepContent = () => {
    const stepIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep);
    const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

    switch (currentStep) {
      case 'account_type':
        return <AccountTypeSelection data={profileData} onUpdate={handleDataUpdate} />;
      case 'professional_info':
        return <ProfessionalInfoForm data={profileData} onUpdate={handleDataUpdate} />;
      case 'skills_assessment':
        return <SkillAssessment data={profileData} onUpdate={handleDataUpdate} />;
      case 'portfolio':
        return <PortfolioUpload data={profileData} onUpdate={handleDataUpdate} />;
      case 'pricing':
        return <PricingWizard data={profileData} onUpdate={handleDataUpdate} />;
      case 'verification':
        return <VerificationSummary data={profileData} onUpdate={handleDataUpdate} />;
      case 'review':
        return <FinalReview data={profileData} isCompleted={onboardingProgress.isCompleted} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    return validateCurrentStep();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">自由职业者入驻</h1>
          <p className="text-gray-600">
            完成以下步骤，建立您的专业档案，开始接单
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Step Guide */}
          <div className="lg:col-span-1">
            <StepGuide
              steps={ONBOARDING_STEPS}
              currentStep={currentStep}
              completedSteps={onboardingProgress.completedSteps}
              onStepClick={handleStepChange}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Progress Bar */}
            <div className="mb-6">
              <ProgressBar
                currentStep={ONBOARDING_STEPS.findIndex(step => step.id === currentStep) + 1}
                totalSteps={ONBOARDING_STEPS.length}
                stepTitles={ONBOARDING_STEPS.map(step => step.title)}
                onStepClick={(index) => handleStepChange(ONBOARDING_STEPS[index - 1]?.id)}
              />
            </div>

            {/* Save Status Indicator */}
            <div className="flex justify-end mb-4">
              {saveStatus === 'saving' && (
                <span className="text-sm text-blue-600 flex items-center">
                  <Save className="w-4 h-4 mr-1 animate-spin" />
                  保存中...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  已保存
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  保存失败
                </span>
              )}
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-900 mb-1">请完成以下必填项</h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
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
                disabled={currentStep === 'account_type'}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                上一步
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => saveProgress()}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存进度
                </button>

                {currentStep === 'review' ? (
                  <button
                    onClick={handleSubmitApplication}
                    disabled={isLoading || !canProceed()}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '提交中...' : '提交申请'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    下一步
                    <ArrowRight className="w-4 h-4 ml-2" />
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

// Account Type Selection Component
const AccountTypeSelection: React.FC<{
  data: Partial<FreelancerProfile>;
  onUpdate: (data: Partial<FreelancerProfile>) => void;
}> = ({ data, onUpdate }) => {
  const handleAccountTypeSelect = (type: 'individual' | 'company') => {
    onUpdate({ ...data, accountType: type });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">选择账户类型</h2>
        <p className="text-gray-600">请选择适合您的账户类型</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => handleAccountTypeSelect('individual')}
          className={`p-6 border-2 rounded-lg transition-all ${
            data.accountType === 'individual'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">个人账户</h3>
          <p className="text-sm text-gray-600 text-left">
            适合自由职业者、独立设计师、开发者等个人专业人士
          </p>
          <ul className="text-sm text-gray-600 text-left mt-3 space-y-1">
            <li>• 个人税务处理</li>
            <li>• 个人品牌展示</li>
            <li>• 简单快捷的认证流程</li>
          </ul>
        </button>

        <button
          onClick={() => handleAccountTypeSelect('company')}
          className={`p-6 border-2 rounded-lg transition-all ${
            data.accountType === 'company'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Building className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">企业账户</h3>
          <p className="text-sm text-gray-600 text-left">
            适合工作室、设计公司、技术服务企业等商业实体
          </p>
          <ul className="text-sm text-gray-600 text-left mt-3 space-y-1">
            <li>• 企业税务处理</li>
            <li>• 企业品牌展示</li>
            <li>• 团队协作功能</li>
            <li>• 需要营业执照等企业资质</li>
          </ul>
        </button>
      </div>

      {data.accountType === 'company' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">企业账户需要准备</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 营业执照</li>
            <li>• 法定代表人身份证明</li>
            <li>• 企业银行账户信息</li>
            <li>• 公司简介和服务范围</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Placeholder components that would be implemented
const VerificationSummary: React.FC<{
  data: Partial<FreelancerProfile>;
  onUpdate: (data: Partial<FreelancerProfile>) => void;
}> = ({ data }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold text-gray-900">身份验证</h2>
    <p className="text-gray-600">
      请完成身份验证，这将有助于建立客户信任
    </p>
    {/* Identity verification components would go here */}
  </div>
);

const FinalReview: React.FC<{
  data: Partial<FreelancerProfile>;
  isCompleted: boolean;
}> = ({ data, isCompleted }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold text-gray-900">最终审核</h2>
    <p className="text-gray-600">
      请检查您的信息是否准确无误
    </p>
    {/* Review summary would go here */}
  </div>
);