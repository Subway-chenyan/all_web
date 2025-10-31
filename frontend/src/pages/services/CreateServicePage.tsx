import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { ServiceFormData, FormValidationError, ServiceDraft, ServiceCategory } from '@/types/services';
import {
  BasicInfoForm,
  PricingPackages,
  RequirementsForm,
  MediaUpload,
  SEOSettings,
  ReviewAndPublish,
  FormProgress,
  DraftManager,
  ServicePreview
} from '@/components/services/creation';
import Button from '@/components/ui/Button';
import { storage } from '@/utils';

// Mock data - in real app, this would come from API
const mockCategories: ServiceCategory[] = [
  {
    id: 'design',
    name: '设计服务',
    icon: '🎨',
    subcategories: [
      { id: 'logo', name: 'Logo设计', parentId: 'design' },
      { id: 'ui', name: 'UI/UX设计', parentId: 'design' },
      { id: 'graphic', name: '平面设计', parentId: 'design' },
      { id: 'web', name: '网页设计', parentId: 'design' }
    ]
  },
  {
    id: 'development',
    name: '开发服务',
    icon: '💻',
    subcategories: [
      { id: 'web-dev', name: '网站开发', parentId: 'development' },
      { id: 'mobile', name: '移动应用', parentId: 'development' },
      { id: 'backend', name: '后端开发', parentId: 'development' },
      { id: 'database', name: '数据库', parentId: 'development' }
    ]
  },
  {
    id: 'content',
    name: '内容创作',
    icon: '✍️',
    subcategories: [
      { id: 'writing', name: '文案写作', parentId: 'content' },
      { id: 'translation', name: '翻译服务', parentId: 'content' },
      { id: 'video', name: '视频制作', parentId: 'content' },
      { id: 'audio', name: '音频制作', parentId: 'content' }
    ]
  },
  {
    id: 'marketing',
    name: '营销推广',
    icon: '📱',
    subcategories: [
      { id: 'seo', name: 'SEO优化', parentId: 'marketing' },
      { id: 'social', name: '社交媒体', parentId: 'marketing' },
      { id: 'ads', name: '广告投放', parentId: 'marketing' },
      { id: 'email', name: '邮件营销', parentId: 'marketing' }
    ]
  }
];

const CreateServicePage: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ServiceFormData>>({});
  const [drafts, setDrafts] = useState<ServiceDraft[]>([]);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errors, setErrors] = useState<FormValidationError[]>([]);
  const [warnings, setWarnings] = useState<FormValidationError[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Steps configuration
  const steps = [
    {
      id: 'basic',
      title: '基本信息',
      description: '标题、分类、描述',
      component: BasicInfoForm,
      validation: validateBasicInfo
    },
    {
      id: 'pricing',
      title: '定价套餐',
      description: '价格、交付时间',
      component: PricingPackages,
      validation: validatePricing
    },
    {
      id: 'requirements',
      title: '需求交付',
      description: '需求清单、交付物',
      component: RequirementsForm,
      validation: validateRequirements
    },
    {
      id: 'media',
      title: '媒体资料',
      description: '图片、视频、文档',
      component: MediaUpload,
      validation: validateMedia
    },
    {
      id: 'seo',
      title: 'SEO优化',
      description: '标题、描述、关键词',
      component: SEOSettings,
      validation: validateSEO
    },
    {
      id: 'review',
      title: '审核发布',
      description: '预览、确认、发布',
      component: ReviewAndPublish,
      validation: () => []
    }
  ];

  // Load drafts from localStorage on mount
  useEffect(() => {
    const savedDrafts = storage.get<ServiceDraft[]>('service_drafts', []);
    setDrafts(savedDrafts);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.title || formData.description) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // Validation functions
  function validateBasicInfo(data: Partial<ServiceFormData>): FormValidationError[] {
    const validationErrors: FormValidationError[] = [];

    if (!data.title || data.title.trim().length < 10) {
      validationErrors.push({
        field: 'title',
        message: '服务标题至少需要10个字符',
        type: 'error'
      });
    }

    if (!data.category) {
      validationErrors.push({
        field: 'category',
        message: '请选择服务分类',
        type: 'error'
      });
    }

    if (!data.subcategory) {
      validationErrors.push({
        field: 'subcategory',
        message: '请选择服务子分类',
        type: 'error'
      });
    }

    if (!data.description || data.description.replace(/<[^>]*>/g, '').length < 50) {
      validationErrors.push({
        field: 'description',
        message: '服务描述至少需要50个字符',
        type: 'error'
      });
    }

    return validationErrors;
  }

  function validatePricing(data: Partial<ServiceFormData>): FormValidationError[] {
    const validationErrors: FormValidationError[] = [];

    if (!data.packages || data.packages.length === 0) {
      validationErrors.push({
        field: 'packages',
        message: '至少需要设置一个定价套餐',
        type: 'error'
      });
    } else {
      data.packages.forEach((pkg, index) => {
        if (!pkg.name || pkg.name.trim().length < 2) {
          validationErrors.push({
            field: `packages.${pkg.id}.name`,
            message: '套餐名称不能为空',
            type: 'error'
          });
        }

        if (pkg.price <= 0) {
          validationErrors.push({
            field: `packages.${pkg.id}.price`,
            message: '套餐价格必须大于0',
            type: 'error'
          });
        }

        if (pkg.deliveryTime <= 0) {
          validationErrors.push({
            field: `packages.${pkg.id}.deliveryTime`,
            message: '交付时间必须大于0',
            type: 'error'
          });
        }
      });
    }

    return validationErrors;
  }

  function validateRequirements(data: Partial<ServiceFormData>): FormValidationError[] {
    const validationErrors: FormValidationError[] = [];

    if (!data.requirements || data.requirements.length === 0) {
      validationErrors.push({
        field: 'requirements',
        message: '请至少添加一个客户需求',
        type: 'warning'
      });
    }

    if (!data.deliverables || data.deliverables.length === 0) {
      validationErrors.push({
        field: 'deliverables',
        message: '请至少添加一个交付物',
        type: 'warning'
      });
    }

    return validationErrors;
  }

  function validateMedia(data: Partial<ServiceFormData>): FormValidationError[] {
    const validationErrors: FormValidationError[] = [];

    if (!data.images || data.images.length === 0) {
      validationErrors.push({
        field: 'images',
        message: '建议至少上传一张服务展示图片',
        type: 'warning'
      });
    }

    return validationErrors;
  }

  function validateSEO(data: Partial<ServiceFormData>): FormValidationError[] {
    const validationErrors: FormValidationError[] = [];

    if (!data.seoTitle || data.seoTitle.length < 30) {
      validationErrors.push({
        field: 'seoTitle',
        message: 'SEO标题建议至少30个字符',
        type: 'warning'
      });
    }

    if (!data.seoDescription || data.seoDescription.length < 120) {
      validationErrors.push({
        field: 'seoDescription',
        message: 'SEO描述建议至少120个字符',
        type: 'warning'
      });
    }

    if (!data.keywords || data.keywords.length < 3) {
      validationErrors.push({
        field: 'keywords',
        message: '建议至少添加3个SEO关键词',
        type: 'warning'
      });
    }

    return validationErrors;
  }

  // Form operations
  const handleAutoSave = useCallback(async () => {
    setIsAutoSaving(true);
    try {
      const draft: ServiceDraft = {
        id: `draft_${Date.now()}`,
        title: formData.title || '未命名草稿',
        data: formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        step: currentStep
      };

      // Keep only the latest 10 drafts
      const updatedDrafts = [draft, ...drafts.filter(d => d.id !== draft.id)].slice(0, 10);
      setDrafts(updatedDrafts);
      storage.set('service_drafts', updatedDrafts);
      setLastSaved(new Date());
    } finally {
      setIsAutoSaving(false);
    }
  }, [formData, currentStep, drafts]);

  const handleLoadDraft = (draft: ServiceDraft) => {
    setFormData(draft.data);
    setCurrentStep(draft.step);
  };

  const handleDeleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    storage.set('service_drafts', updatedDrafts);
  };

  const handleStepChange = (stepIndex: number) => {
    // Validate current step before moving
    const currentValidation = steps[currentStep].validation(formData);
    const stepErrors = currentValidation.filter(e => e.type === 'error');

    if (stepErrors.length > 0 && stepIndex > currentStep) {
      setErrors(stepErrors);
      return;
    }

    setCurrentStep(stepIndex);
    setErrors([]);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  const handlePublish = async (options: { publishImmediately: boolean; publishAt?: Date; status: 'active' | 'draft' | 'paused' }) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear drafts after successful publish
      storage.remove('service_drafts');
      setDrafts([]);

      // Navigate to service management page
      navigate('/services/manage', {
        state: { message: '服务发布成功！' }
      });
    } catch (error) {
      console.error('Publish failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    handleAutoSave();
  };

  // Validate current step
  useEffect(() => {
    const currentValidation = steps[currentStep].validation(formData);
    setErrors(currentValidation.filter(e => e.type === 'error'));
    setWarnings(currentValidation.filter(e => e.type === 'warning'));

    // Check if form is overall valid
    const allErrors: FormValidationError[] = [];
    steps.forEach(step => {
      allErrors.push(...step.validation(formData).filter(e => e.type === 'error'));
    });
    setIsValid(allErrors.length === 0);
  }, [formData, currentStep]);

  // Render current step component
  const CurrentStepComponent = steps[currentStep].component;
  const formProgressSteps = steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    isCompleted: index < currentStep,
    isCurrent: index === currentStep,
    isValid: index < currentStep || step.validation(formData).filter(e => e.type === 'error').length === 0,
    hasError: index === currentStep && errors.length > 0
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">创建新服务</h1>
            </div>

            <DraftManager
              drafts={drafts}
              onLoadDraft={handleLoadDraft}
              onDeleteDraft={handleDeleteDraft}
              onSaveDraft={handleSaveDraft}
              currentData={formData}
              autoSave={true}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <FormProgress
            steps={formProgressSteps}
            currentStep={currentStep}
            onStepClick={handleStepChange}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <CurrentStepComponent
                  data={formData}
                  onChange={setFormData}
                  categories={mockCategories}
                  errors={errors}
                  warnings={warnings}
                  isValid={isValid}
                  onPublish={handlePublish}
                  onSaveDraft={handleSaveDraft}
                  disabled={isSubmitting}
                />
              </div>

              {/* Navigation */}
              {currentStep !== steps.length - 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 0 || isSubmitting}
                    >
                      上一步
                    </Button>

                    <div className="flex items-center space-x-4">
                      {isAutoSaving && (
                        <span className="text-sm text-gray-500">自动保存中...</span>
                      )}
                      {lastSaved && !isAutoSaving && (
                        <span className="text-sm text-gray-500">
                          已保存 {lastSaved.toLocaleTimeString()}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={handleNext}
                      disabled={errors.length > 0 || isSubmitting}
                    >
                      {currentStep === steps.length - 2 ? '去发布' : '下一步'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ServicePreview
                service={formData as ServiceFormData}
                preview={{
                  service: formData as ServiceFormData,
                  isValid,
                  errors,
                  warnings,
                  suggestions: []
                }}
                onEdit={handleStepChange}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateServicePage;