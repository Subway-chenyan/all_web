import React, { useState } from 'react';
import { Check, Star, Clock, RotateCcw, HelpCircle, Info } from 'lucide-react';
import { ServicePackage } from '@/types';
import { useI18n } from '@/i18n';

interface ServicePricingProps {
  packages: ServicePackage[];
  currency?: string;
  selectedPackage?: number;
  onPackageSelect?: (packageId: number) => void;
  className?: string;
}

interface PackageComparisonProps {
  packages: ServicePackage[];
  isOpen: boolean;
  onClose: () => void;
}

const PackageComparison: React.FC<PackageComparisonProps> = ({
  packages,
  isOpen,
  onClose
}) => {
  const { t, formatCurrency } = useI18n();

  if (!isOpen) return null;

  // Get all unique features across packages
  const allFeatures = Array.from(
    new Set(
      packages.flatMap(pkg => pkg.features)
    )
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />

        <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">套餐对比</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    功能特性
                  </th>
                  {packages.map((pkg) => (
                    <th
                      key={pkg.id}
                      className="text-center py-3 px-4 font-medium text-gray-900 min-w-[150px]"
                    >
                      <div>
                        <div className="text-lg font-semibold">{pkg.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatCurrency(pkg.price)}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Basic Info Row */}
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">基本信息</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="py-3 px-4 text-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {pkg.deliveryTime}天
                        </div>
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          {pkg.revisions}次修改
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Features */}
                {allFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">{feature}</td>
                    {packages.map((pkg) => (
                      <td key={pkg.id} className="py-3 px-4 text-center">
                        {pkg.features.includes(feature) ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ServicePricing: React.FC<ServicePricingProps> = ({
  packages,
  currency = 'CNY',
  selectedPackage,
  onPackageSelect,
  className = ''
}) => {
  const { t, formatCurrency } = useI18n();
  const [showComparison, setShowComparison] = useState(false);
  const [hoveredPackage, setHoveredPackage] = useState<number | null>(null);

  if (!packages || packages.length === 0) {
    return (
      <div className={`text-center py-8 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500">暂无价格方案</p>
      </div>
    );
  }

  const handlePackageClick = (packageId: number) => {
    onPackageSelect?.(packageId);
  };

  const singlePackage = packages.length === 1;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          {singlePackage ? '价格' : '选择套餐'}
        </h3>
        {!singlePackage && packages.length > 1 && (
          <button
            onClick={() => setShowComparison(true)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">对比套餐</span>
          </button>
        )}
      </div>

      {/* Package Cards */}
      <div className={`grid gap-4 ${singlePackage ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        {packages.map((pkg) => {
          const isSelected = selectedPackage === pkg.id;
          const isPopular = pkg.isPopular;
          const isHovered = hoveredPackage === pkg.id;

          return (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-100 shadow-lg'
                  : isHovered
                  ? 'border-gray-300 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onMouseEnter={() => setHoveredPackage(pkg.id)}
              onMouseLeave={() => setHoveredPackage(null)}
              onClick={() => handlePackageClick(pkg.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePackageClick(pkg.id);
                }
              }}
              aria-pressed={isSelected}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4" />
                    <span>推荐</span>
                  </div>
                </div>
              )}

              {/* Package Content */}
              <div className="p-6">
                {/* Package Name */}
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {pkg.name}
                  </h4>
                  {pkg.description && (
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                  )}
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(pkg.price)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    一次性付款
                  </div>
                </div>

                {/* Delivery and Revisions */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{pkg.deliveryTime}天交付</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <RotateCcw className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{pkg.revisions}次修改机会</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? '已选择' : '选择此套餐'}
                </button>
              </div>

              {/* Hover Info */}
              {isHovered && !isSelected && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap">
                  点击选择此套餐
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="flex items-start space-x-2 p-4 bg-blue-50 rounded-lg">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">购买说明</p>
          <ul className="space-y-1 text-blue-700">
            <li>• 选择适合您需求的套餐</li>
            <li>• 付款后卖家将在承诺时间内完成工作</li>
            <li>• 如需修改，请在修改次数范围内提出</li>
            <li>• 如有疑问，可先联系卖家咨询</li>
          </ul>
        </div>
      </div>

      {/* Package Comparison Modal */}
      <PackageComparison
        packages={packages}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </div>
  );
};

export default ServicePricing;