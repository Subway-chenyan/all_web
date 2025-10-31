import React from 'react';
import { cn } from '@/utils';

export interface FormStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isValid: boolean;
  hasError: boolean;
}

export interface FormProgressProps {
  steps: FormStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
  disabled?: boolean;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FormProgress: React.FC<FormProgressProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
  disabled = false,
  showLabels = true,
  size = 'md'
}) => {
  const handleStepClick = (stepIndex: number) => {
    if (!disabled && onStepClick && stepIndex <= currentStep) {
      onStepClick(stepIndex);
    }
  };

  const getStepSize = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6 text-xs';
      case 'lg': return 'w-10 h-10 text-base';
      default: return 'w-8 h-8 text-sm';
    }
  };

  const getConnectorSize = () => {
    switch (size) {
      case 'sm': return 'h-0.5';
      case 'lg': return 'h-1';
      default: return 'h-0.5';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleStepClick(index)}
                className={cn(
                  'flex items-center justify-center rounded-full border-2 font-medium transition-all duration-200',
                  getStepSize(),
                  step.isCurrent
                    ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                    : step.isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : step.hasError
                    ? 'border-red-500 bg-white text-red-500'
                    : 'border-gray-300 bg-white text-gray-500',
                  !disabled && index <= currentStep && step.id !== steps[currentStep].id
                    ? 'hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
                    : 'cursor-default',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                disabled={disabled}
              >
                {step.isCompleted ? (
                  <svg
                    className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : step.hasError ? (
                  <svg
                    className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Step Label */}
              {showLabels && (
                <div className="mt-2 text-center">
                  <div className={cn(
                    'text-sm font-medium',
                    step.isCurrent
                      ? 'text-blue-600'
                      : step.isCompleted
                      ? 'text-green-600'
                      : step.hasError
                      ? 'text-red-600'
                      : 'text-gray-500'
                  )}>
                    {step.title}
                  </div>
                  {size !== 'sm' && (
                    <div className="text-xs text-gray-500 mt-1 max-w-24 text-center">
                      {step.description}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2">
                <div
                  className={cn(
                    'w-full',
                    getConnectorSize(),
                    'bg-gray-200 transition-colors duration-200'
                  )}
                >
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      step.isCompleted ? 'bg-green-500' : 'bg-transparent'
                    )}
                    style={{ width: step.isCompleted ? '100%' : '0%' }}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 flex justify-between items-center text-sm">
        <div className="text-gray-600">
          步骤 {currentStep + 1} / {steps.length}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">已完成</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">当前</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">有错误</span>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((steps.filter(step => step.isCompleted).length + (steps[currentStep]?.isCurrent ? 0.5 : 0)) / steps.length) * 100}%`
            }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-600 text-center">
          完成度: {Math.round(((steps.filter(step => step.isCompleted).length + (steps[currentStep]?.isCurrent ? 0.5 : 0)) / steps.length) * 100)}%
        </div>
      </div>
    </div>
  );
};

export default FormProgress;