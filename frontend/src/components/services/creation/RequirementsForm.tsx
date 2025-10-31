import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';
import { ServiceFormData, FormValidationError } from '@/types/services';
import Button from '@/components/ui/Button';

export interface RequirementsFormProps {
  data: Partial<ServiceFormData>;
  onChange: (data: Partial<ServiceFormData>) => void;
  errors: FormValidationError[];
  className?: string;
  disabled?: boolean;
}

const RequirementsForm: React.FC<RequirementsFormProps> = ({
  data,
  onChange,
  errors = [],
  className = '',
  disabled = false
}) => {
  const [newRequirement, setNewRequirement] = useState('');
  const [newDeliverable, setNewDeliverable] = useState('');

  const requirements = data.requirements || [];
  const deliverables = data.deliverables || [];

  const handleAddRequirement = () => {
    if (newRequirement.trim() && requirements.length < 10) {
      onChange({
        ...data,
        requirements: [...requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    onChange({
      ...data,
      requirements: requirements.filter((_, i) => i !== index)
    });
  };

  const handleRequirementKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRequirement();
    }
  };

  const handleAddDeliverable = () => {
    if (newDeliverable.trim() && deliverables.length < 15) {
      onChange({
        ...data,
        deliverables: [...deliverables, newDeliverable.trim()]
      });
      setNewDeliverable('');
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    onChange({
      ...data,
      deliverables: deliverables.filter((_, i) => i !== index)
    });
  };

  const handleDeliverableKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDeliverable();
    }
  };

  const handleRevisionCountChange = (value: number) => {
    onChange({
      ...data,
      revisionCount: Math.max(0, Math.min(10, value))
    });
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field);
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">需求与交付</h2>
        <p className="text-gray-600">
          明确您的服务需求和交付标准，帮助客户了解需要提供什么以及能获得什么。
        </p>
      </div>

      {/* Client Requirements */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            客户需求清单
          </h3>
          <p className="text-sm text-gray-600">
            列出客户需要提供的材料、信息或要求，以便您能够顺利完成工作。
          </p>
        </div>

        <div className="space-y-3">
          {requirements.map((requirement, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-gray-900">{requirement}</p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveRequirement(index)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {requirements.length < 10 && (
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400">
                +
              </span>
              <div className="flex-1">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={handleRequirementKeyPress}
                  placeholder="添加新的需求项..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={disabled}
                />
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    按回车键添加，或点击添加按钮
                  </span>
                  <Button
                    size="sm"
                    onClick={handleAddRequirement}
                    disabled={!newRequirement.trim() || disabled}
                  >
                    添加
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          已添加 {requirements.length}/10 项需求
        </div>

        {/* Requirement Templates */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">快速添加模板：</p>
          <div className="flex flex-wrap gap-2">
            {[
              '公司Logo文件',
              '品牌色彩规范',
              '具体尺寸要求',
              '参考案例或样例',
              '使用场景说明',
              '目标受众描述'
            ].map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => {
                  if (requirements.length < 10) {
                    onChange({
                      ...data,
                      requirements: [...requirements, template]
                    });
                  }
                }}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                disabled={disabled || requirements.length >= 10}
              >
                + {template}
              </button>
            ))}
          </div>
        </div>

        {getFieldError('requirements') && (
          <p className="mt-2 text-sm text-red-600">
            {getFieldError('requirements')!.message}
          </p>
        )}
      </div>

      {/* Deliverables */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            交付物清单
          </h3>
          <p className="text-sm text-gray-600">
            明确列出您将为客户提供的所有交付物。
          </p>
        </div>

        <div className="space-y-3">
          {deliverables.map((deliverable, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </span>
              <div className="flex-1">
                <p className="text-gray-900">{deliverable}</p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveDeliverable(index)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {deliverables.length < 15 && (
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400">
                +
              </span>
              <div className="flex-1">
                <input
                  type="text"
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  onKeyPress={handleDeliverableKeyPress}
                  placeholder="添加新的交付物..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={disabled}
                />
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    按回车键添加，或点击添加按钮
                  </span>
                  <Button
                    size="sm"
                    onClick={handleAddDeliverable}
                    disabled={!newDeliverable.trim() || disabled}
                  >
                    添加
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          已添加 {deliverables.length}/15 项交付物
        </div>

        {/* Deliverable Templates */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">快速添加模板：</p>
          <div className="flex flex-wrap gap-2">
            {[
              '设计源文件',
              '高分辨率图片',
              '使用说明文档',
              '修改版本',
              '项目总结报告',
              '技术支持服务',
              '文件交付包',
              '版权授权文件'
            ].map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => {
                  if (deliverables.length < 15) {
                    onChange({
                      ...data,
                      deliverables: [...deliverables, template]
                    });
                  }
                }}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                disabled={disabled || deliverables.length >= 15}
              >
                + {template}
              </button>
            ))}
          </div>
        </div>

        {getFieldError('deliverables') && (
          <p className="mt-2 text-sm text-red-600">
            {getFieldError('deliverables')!.message}
          </p>
        )}
      </div>

      {/* Revision Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            修改政策
          </h3>
          <p className="text-sm text-gray-600">
            设置免费的修改次数，超出次数的修改可能需要额外收费。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              免费修改次数
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="10"
                value={data.revisionCount || 0}
                onChange={(e) => handleRevisionCountChange(parseInt(e.target.value))}
                className="flex-1"
                disabled={disabled}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={data.revisionCount || 0}
                  onChange={(e) => handleRevisionCountChange(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={disabled}
                />
                <span className="text-sm text-gray-600">次</span>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>不提供修改</span>
              <span>标准修改</span>
              <span>充分修改</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">修改政策说明：</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• 0次：交付后不支持免费修改</p>
              <p>• 1-3次：适合标准化服务</p>
              <p>• 4-6次：适合定制化服务</p>
              <p>• 7-10次：适合高价值定制服务</p>
            </div>
          </div>
        </div>

        {getFieldError('revisionCount') && (
          <p className="mt-2 text-sm text-red-600">
            {getFieldError('revisionCount')!.message}
          </p>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 需求与交付建议</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 明确列出客户需要提供的材料，避免沟通不畅</li>
          <li>• 交付物要具体详细，让客户清楚知道会获得什么</li>
          <li>• 合理设置修改次数，既能满足客户需求又保护自己的时间</li>
          <li>• 使用模板可以快速添加常见的需求和交付物</li>
          <li>• 考虑不同套餐可能需要不同的需求和交付物</li>
        </ul>
      </div>
    </div>
  );
};

export default RequirementsForm;