import React from 'react';
import { Check, Lock, Clock, AlertCircle } from 'lucide-react';
import { VerificationStep } from '../../types';

interface StepGuideProps {
  steps: VerificationStep[];
  currentStep: string;
  completedSteps: string[];
  onStepClick?: (stepId: string) => void;
}

export const StepGuide: React.FC<StepGuideProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  const getStepIcon = (step: VerificationStep) => {
    if (completedSteps.includes(step.id)) {
      return <Check className="w-5 h-5 text-green-600" />;
    }

    if (currentStep === step.id) {
      return <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>;
    }

    if (step.isRequired && !completedSteps.includes(step.id)) {
      return <Lock className="w-5 h-5 text-gray-400" />;
    }

    return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
  };

  const getStepStatus = (step: VerificationStep) => {
    if (completedSteps.includes(step.id)) return 'completed';
    if (currentStep === step.id) return 'current';
    if (step.isRequired) return 'locked';
    return 'available';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'current': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'locked': return 'text-gray-400 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">验证步骤</h3>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isClickable = onStepClick && (status === 'completed' || status === 'available');
          const colorClass = getStepColor(status);

          return (
            <div
              key={step.id}
              className={`
                relative flex items-start space-x-4 p-4 rounded-lg border transition-all
                ${colorClass}
                ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'}
              `}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              {/* Step Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step)}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm mt-1 opacity-80">{step.description}</p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {step.type === 'required' && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        必需
                      </span>
                    )}
                    {step.type === 'optional' && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        可选
                      </span>
                    )}
                    {step.estimatedTime && (
                      <div className="flex items-center text-xs opacity-70">
                        <Clock className="w-3 h-3 mr-1" />
                        {step.estimatedTime}分钟
                      </div>
                    )}
                  </div>
                </div>

                {/* Step Status Details */}
                {status === 'completed' && (
                  <div className="mt-2 flex items-center text-xs opacity-80">
                    <Check className="w-3 h-3 mr-1" />
                    已完成
                  </div>
                )}

                {status === 'current' && (
                  <div className="mt-2 flex items-center text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    当前步骤
                  </div>
                )}

                {status === 'locked' && (
                  <div className="mt-2 text-xs opacity-60">
                    需要先完成前面的必需步骤
                  </div>
                )}
              </div>

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200" />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            进度: {completedSteps.length} / {steps.length} 步骤完成
          </div>
          <div className="text-sm font-medium text-blue-600">
            {Math.round((completedSteps.length / steps.length) * 100)}% 完成
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};