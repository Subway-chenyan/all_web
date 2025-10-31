import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';
import { ServiceFormData, ServicePackage, FormValidationError } from '@/types/services';
import { PriceInput, DurationSelector } from '@/components/forms';
import Button from '@/components/ui/Button';

export interface PricingPackagesProps {
  packages: ServicePackage[];
  onChange: (packages: ServicePackage[]) => void;
  errors: FormValidationError[];
  className?: string;
  disabled?: boolean;
}

const PricingPackagesProps: React.FC<PricingPackagesProps> = ({
  packages = [],
  onChange,
  errors = [],
  className = '',
  disabled = false
}) => {
  const [activePackageId, setActivePackageId] = useState<string>('');

  useEffect(() => {
    // Set first package as active if none is selected
    if (packages.length > 0 && !activePackageId) {
      setActivePackageId(packages[0].id);
    }
  }, [packages, activePackageId]);

  const createPackage = (type: 'basic' | 'standard' | 'premium'): ServicePackage => {
    const basePackage = {
      id: `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      description: '',
      price: 0,
      deliveryTime: 1,
      revisions: 0,
      features: [],
      isPopular: false
    };

    switch (type) {
      case 'basic':
        return {
          ...basePackage,
          name: '基础版',
          deliveryTime: 7,
          revisions: 1
        };
      case 'standard':
        return {
          ...basePackage,
          name: '标准版',
          deliveryTime: 5,
          revisions: 2,
          isPopular: true
        };
      case 'premium':
        return {
          ...basePackage,
          name: '高级版',
          deliveryTime: 3,
          revisions: 3
        };
      default:
        return basePackage;
    }
  };

  const addPackage = (type: 'basic' | 'standard' | 'premium') => {
    if (packages.length >= 3) return;

    const newPackage = createPackage(type);
    onChange([...packages, newPackage]);
    setActivePackageId(newPackage.id);
  };

  const removePackage = (packageId: string) => {
    const updatedPackages = packages.filter(pkg => pkg.id !== packageId);
    onChange(updatedPackages);

    // Set active package to first remaining package
    if (activePackageId === packageId && updatedPackages.length > 0) {
      setActivePackageId(updatedPackages[0].id);
    }
  };

  const updatePackage = (packageId: string, updates: Partial<ServicePackage>) => {
    const updatedPackages = packages.map(pkg =>
      pkg.id === packageId ? { ...pkg, ...updates } : pkg
    );

    // Ensure only one package is marked as popular
    if (updates.isPopular) {
      updatedPackages.forEach(pkg => {
        if (pkg.id !== packageId) {
          pkg.isPopular = false;
        }
      });
    }

    onChange(updatedPackages);
  };

  const addFeature = (packageId: string, feature: string) => {
    if (!feature.trim()) return;

    const pkg = packages.find(p => p.id === packageId);
    if (pkg && pkg.features.length < 10) {
      updatePackage(packageId, {
        features: [...pkg.features, feature.trim()]
      });
    }
  };

  const removeFeature = (packageId: string, featureIndex: number) => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      const updatedFeatures = pkg.features.filter((_, index) => index !== featureIndex);
      updatePackage(packageId, { features: updatedFeatures });
    }
  };

  const moveFeature = (packageId: string, fromIndex: number, toIndex: number) => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      const newFeatures = [...pkg.features];
      const [movedFeature] = newFeatures.splice(fromIndex, 1);
      newFeatures.splice(toIndex, 0, movedFeature);
      updatePackage(packageId, { features: newFeatures });
    }
  };

  const activePackage = packages.find(pkg => pkg.id === activePackageId);
  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field);
  };

  const getPackageTypeLabel = (pkg: ServicePackage): string => {
    if (pkg.name.includes('基础')) return 'basic';
    if (pkg.name.includes('标准')) return 'standard';
    if (pkg.name.includes('高级')) return 'premium';
    return 'custom';
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">定价套餐</h2>
        <p className="text-gray-600">
          设置不同价位的服务套餐，满足不同客户的需求。建议设置3个套餐以提供更多选择。
        </p>
      </div>

      {/* Package Selection */}
      {packages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setActivePackageId(pkg.id)}
              className={cn(
                'px-4 py-2 rounded-lg border-2 transition-all',
                activePackageId === pkg.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              )}
              disabled={disabled}
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">{pkg.name}</span>
                {pkg.isPopular && (
                  <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                    热门
                  </span>
                )}
              </div>
            </button>
          ))}

          {packages.length < 3 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addPackage('basic')}
                disabled={disabled || packages.some(p => p.name.includes('基础'))}
              >
                + 基础版
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addPackage('standard')}
                disabled={disabled || packages.some(p => p.name.includes('标准'))}
              >
                + 标准版
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addPackage('premium')}
                disabled={disabled || packages.some(p => p.name.includes('高级'))}
              >
                + 高级版
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {packages.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="space-y-4">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">创建定价套餐</h3>
              <p className="text-gray-600 mb-4">
                添加不同价位的服务套餐来满足不同客户的需求
              </p>
              <div className="flex justify-center space-x-2">
                <Button
                  onClick={() => addPackage('basic')}
                  disabled={disabled}
                >
                  添加基础版
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addPackage('standard')}
                  disabled={disabled}
                >
                  添加标准版
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addPackage('premium')}
                  disabled={disabled}
                >
                  添加高级版
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Package Editor */}
      {activePackage && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <input
                type="text"
                value={activePackage.name}
                onChange={(e) => updatePackage(activePackage.id, { name: e.target.value })}
                placeholder="套餐名称"
                className="text-xl font-bold text-gray-900 border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none pb-1"
                disabled={disabled}
              />
              <p className="text-sm text-gray-500 mt-1">给套餐起一个吸引人的名字</p>
            </div>

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={activePackage.isPopular || false}
                  onChange={(e) => updatePackage(activePackage.id, { isPopular: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={disabled}
                />
                <span className="text-sm text-gray-700">设为热门</span>
              </label>

              {packages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePackage(activePackage.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={disabled}
                >
                  删除
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  价格 <span className="text-red-500">*</span>
                </label>
                <PriceInput
                  value={activePackage.price}
                  onChange={(price) => updatePackage(activePackage.id, { price })}
                  disabled={disabled}
                />
                {getFieldError(`packages.${activePackage.id}.price`) && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError(`packages.${activePackage.id}.price`)!.message}
                  </p>
                )}
              </div>

              {/* Delivery Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交付时间 <span className="text-red-500">*</span>
                </label>
                <DurationSelector
                  value={activePackage.deliveryTime}
                  onChange={(deliveryTime) => updatePackage(activePackage.id, { deliveryTime })}
                  disabled={disabled}
                />
                {getFieldError(`packages.${activePackage.id}.deliveryTime`) && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError(`packages.${activePackage.id}.deliveryTime`)!.message}
                  </p>
                )}
              </div>

              {/* Revisions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  修改次数
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={activePackage.revisions}
                    onChange={(e) => updatePackage(activePackage.id, { revisions: parseInt(e.target.value) || 0 })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={disabled}
                  />
                  <span className="text-sm text-gray-600">次</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">设置允许客户修改的次数</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  套餐描述
                </label>
                <textarea
                  value={activePackage.description}
                  onChange={(e) => updatePackage(activePackage.id, { description: e.target.value })}
                  placeholder="描述这个套餐包含的服务内容..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={disabled}
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  服务特色
                </label>
                <div className="space-y-2">
                  {activePackage.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...activePackage.features];
                          newFeatures[index] = e.target.value;
                          updatePackage(activePackage.id, { features: newFeatures });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        disabled={disabled}
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(activePackage.id, index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={disabled}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {activePackage.features.length < 10 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">+</span>
                      <input
                        type="text"
                        placeholder="添加服务特色..."
                        className="flex-1 px-2 py-1 border border-dashed border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addFeature(activePackage.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        disabled={disabled}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  添加{activePackage.features.length}/10个服务特色
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 定价建议</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 基础版：价格较低，包含核心服务，适合预算有限的客户</li>
          <li>• 标准版：价格适中，服务内容更丰富，建议设为热门套餐</li>
          <li>• 高级版：价格较高，提供全面服务，适合高端客户</li>
          <li>• 合理设置修改次数，避免无限制修改影响工作效率</li>
          <li>• 特色描述要具体明了，让客户清楚了解套餐价值</li>
        </ul>
      </div>
    </div>
  );
};

export default PricingPackagesProps;