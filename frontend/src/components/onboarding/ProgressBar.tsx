import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick?: (stepIndex: number) => void;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick,
  showLabels = true,
  size = 'medium',
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'py-2',
          step: 'w-8 h-8 text-xs',
          line: 'h-0.5',
          label: 'text-xs mt-1',
        };
      case 'large':
        return {
          container: 'py-6',
          step: 'w-12 h-12 text-sm',
          line: 'h-1',
          label: 'text-sm mt-2',
        };
      default:
        return {
          container: 'py-4',
          step: 'w-10 h-10 text-sm',
          line: 'h-1',
          label: 'text-sm mt-1',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`${sizeClasses.container} w-full`}>
      {/* Progress Bar */}
      <div className="relative">
        {/* Background Line */}
        <div className={`absolute top-1/2 left-0 right-0 ${sizeClasses.line} bg-gray-200 -translate-y-1/2`} />

        {/* Progress Line */}
        <div
          className={`absolute top-1/2 left-0 ${sizeClasses.line} bg-blue-600 -translate-y-1/2 transition-all duration-500`}
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = index + 1 === currentStep;
            const isCompleted = index < currentStep - 1;
            const isClickable = onStepClick && (isCompleted || isActive);

            return (
              <div
                key={index}
                className="flex flex-col items-center"
                style={{ zIndex: totalSteps - index }}
              >
                {/* Step Circle */}
                <button
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={`
                    ${sizeClasses.step}
                    rounded-full flex items-center justify-center font-medium transition-all
                    ${isCompleted
                      ? 'bg-green-600 text-white'
                      : isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-white border-2 border-gray-300 text-gray-500'
                    }
                    ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </button>

                {/* Step Label */}
                {showLabels && stepTitles[index] && (
                  <div className={`${sizeClasses.label} text-center max-w-[100px]`}>
                    <div className={`
                      font-medium
                      ${isCompleted
                        ? 'text-green-600'
                        : isActive
                        ? 'text-blue-600'
                        : 'text-gray-500'
                      }
                    `}>
                      {stepTitles[index]}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Text */}
      <div className="mt-4 text-center">
        <div className="text-sm font-medium text-gray-700">
          步骤 {currentStep} / {totalSteps}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {progressPercentage.toFixed(0)}% 完成
        </div>
      </div>
    </div>
  );
};