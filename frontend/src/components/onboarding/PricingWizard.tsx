import React, { useState, useCallback, useEffect } from 'react';
import { DollarSign, Calculator, TrendingUp, Plus, X, Star, Clock, Zap } from 'lucide-react';
import { FreelancerProfile, PricingTier } from '../../types';

interface PricingWizardProps {
  data: Partial<FreelancerProfile>;
  onUpdate: (data: Partial<FreelancerProfile>) => void;
}

const SERVICE_PACKAGES = [
  {
    id: 'basic',
    name: '基础套餐',
    description: '适合小型项目',
    features: ['基础功能', '标准支持', '1次修改'],
    multiplier: 1,
  },
  {
    id: 'standard',
    name: '标准套餐',
    description: '最受欢迎的选择',
    features: ['全部功能', '优先支持', '3次修改', '源文件'],
    multiplier: 1.5,
    isPopular: true,
  },
  {
    id: 'premium',
    name: '高级套餐',
    description: '适合大型项目',
    features: ['全部功能', '24/7支持', '无限修改', '源文件', '商业授权', '快速交付'],
    multiplier: 2.5,
  },
];

const DELIVERY_TIME_OPTIONS = [
  { days: 1, label: '1天', priceMultiplier: 2.0 },
  { days: 3, label: '3天', priceMultiplier: 1.5 },
  { days: 7, label: '7天', priceMultiplier: 1.0 },
  { days: 14, label: '14天', priceMultiplier: 0.9 },
  { days: 30, label: '30天', priceMultiplier: 0.8 },
];

const REVISION_OPTIONS = [
  { count: 0, label: '不允许修改', priceMultiplier: 0.9 },
  { count: 1, label: '1次修改', priceMultiplier: 1.0 },
  { count: 3, label: '3次修改', priceMultiplier: 1.2 },
  { count: 5, label: '5次修改', priceMultiplier: 1.4 },
  { count: -1, label: '无限修改', priceMultiplier: 1.8 },
];

export const PricingWizard: React.FC<PricingWizardProps> = ({
  data,
  onUpdate,
}) => {
  const [baseHourlyRate, setBaseHourlyRate] = useState(data.hourlyRate || 100);
  const [projectDuration, setProjectDuration] = useState(8); // hours
  const [complexity, setComplexity] = useState<'simple' | 'medium' | 'complex'>('medium');
  const [selectedPackages, setSelectedPackages] = useState<string[]>(['standard']);
  const [customPackages, setCustomPackages] = useState<Partial<PricingTier>[]>([]);

  const complexityMultipliers = {
    simple: 0.8,
    medium: 1.0,
    complex: 1.5,
  };

  const calculatePackagePrice = useCallback((baseRate: number, multiplier: number) => {
    const complexityMultiplier = complexityMultipliers[complexity];
    return Math.round(baseRate * projectDuration * multiplier * complexityMultiplier);
  }, [complexity, projectDuration]);

  const generatePricingTiers = useCallback(() => {
    const tiers: PricingTier[] = [];

    SERVICE_PACKAGES.forEach(pkg => {
      if (selectedPackages.includes(pkg.id)) {
        tiers.push({
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          price: calculatePackagePrice(baseHourlyRate, pkg.multiplier),
          deliveryTime: 7, // Default delivery time
          revisions: pkg.id === 'basic' ? 1 : pkg.id === 'standard' ? 3 : -1,
          features: pkg.features,
          isPopular: pkg.isPopular || false,
        });
      }
    });

    // Add custom packages
    customPackages.forEach((pkg, index) => {
      if (pkg.name && pkg.price) {
        tiers.push({
          id: `custom-${index}`,
          name: pkg.name!,
          description: pkg.description || '',
          price: pkg.price,
          deliveryTime: pkg.deliveryTime || 7,
          revisions: pkg.revisions || 1,
          features: pkg.features || [],
          isPopular: false,
        });
      }
    });

    return tiers;
  }, [baseHourlyRate, calculatePackagePrice, selectedPackages, customPackages]);

  useEffect(() => {
    const tiers = generatePricingTiers();
    onUpdate({
      ...data,
      hourlyRate: baseHourlyRate,
      pricingTiers: tiers,
    });
  }, [baseHourlyRate, generatePricingTiers, data, onUpdate]);

  const handlePackageToggle = useCallback((packageId: string) => {
    setSelectedPackages(prev => {
      if (prev.includes(packageId)) {
        return prev.filter(id => id !== packageId);
      } else {
        return [...prev, packageId];
      }
    });
  }, []);

  const addCustomPackage = useCallback(() => {
    const newPackage: Partial<PricingTier> = {
      id: `custom-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      deliveryTime: 7,
      revisions: 1,
      features: [],
      isPopular: false,
    };
    setCustomPackages(prev => [...prev, newPackage]);
  }, []);

  const updateCustomPackage = useCallback((index: number, field: keyof PricingTier, value: any) => {
    setCustomPackages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const removeCustomPackage = useCallback((index: number) => {
    setCustomPackages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getPricingSuggestion = useCallback(() => {
    const skills = data.skills || [];
    const experience = data.experience || '';

    let suggestion = baseHourlyRate;

    // Adjust based on skill level
    const advancedSkills = skills.filter(skill =>
      skill.level === 'advanced' || skill.level === 'expert'
    ).length;

    if (advancedSkills > 3) suggestion *= 1.3;
    if (advancedSkills > 6) suggestion *= 1.5;

    // Adjust based on experience
    if (experience.includes('5年以上')) suggestion *= 1.2;
    if (experience.includes('10年以上')) suggestion *= 1.5;

    return Math.round(suggestion);
  }, [baseHourlyRate, data.skills, data.experience]);

  const suggestedRate = getPricingSuggestion();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">定价策略</h2>
        <p className="text-gray-600">
          设置合理的服务价格，提供不同层次的套餐选择
        </p>
      </div>

      {/* Pricing Calculator */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          定价计算器
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              基础小时费率 (¥)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={baseHourlyRate}
                onChange={(e) => setBaseHourlyRate(parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="number"
                value={baseHourlyRate}
                onChange={(e) => setBaseHourlyRate(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                min="10"
                max="1000"
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              建议费率: ¥{suggestedRate}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目时长 (小时)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="100"
                value={projectDuration}
                onChange={(e) => setProjectDuration(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-16 text-center font-medium">{projectDuration}h</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目复杂度
            </label>
            <div className="flex space-x-2">
              {(['simple', 'medium', 'complex'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setComplexity(level)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    complexity === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level === 'simple' ? '简单' : level === 'medium' ? '中等' : '复杂'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">预估项目总价:</span>
            <span className="text-xl font-bold text-green-600">
              ¥{calculatePackagePrice(baseHourlyRate, 1)}
            </span>
          </div>
        </div>
      </div>

      {/* Standard Packages */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">标准套餐</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {SERVICE_PACKAGES.map(pkg => {
            const price = calculatePackagePrice(baseHourlyRate, pkg.multiplier);
            const isSelected = selectedPackages.includes(pkg.id);

            return (
              <div
                key={pkg.id}
                className={`relative border-2 rounded-lg p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePackageToggle(pkg.id)}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      最受欢迎
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-gray-900">¥{price}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className={`w-full py-2 rounded-lg text-center text-sm font-medium ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isSelected ? '已选择' : '选择套餐'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Packages */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">自定义套餐</h3>
          <button
            onClick={addCustomPackage}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加套餐
          </button>
        </div>

        <div className="space-y-4">
          {customPackages.map((pkg, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">自定义套餐 {index + 1}</h4>
                <button
                  onClick={() => removeCustomPackage(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">套餐名称</label>
                  <input
                    type="text"
                    value={pkg.name || ''}
                    onChange={(e) => updateCustomPackage(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="套餐名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">价格 (¥)</label>
                  <input
                    type="number"
                    value={pkg.price || ''}
                    onChange={(e) => updateCustomPackage(index, 'price', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">交付时间 (天)</label>
                  <input
                    type="number"
                    value={pkg.deliveryTime || ''}
                    onChange={(e) => updateCustomPackage(index, 'deliveryTime', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="7"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">修改次数</label>
                  <select
                    value={pkg.revisions || 1}
                    onChange={(e) => updateCustomPackage(index, 'revisions', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>不允许修改</option>
                    <option value={1}>1次修改</option>
                    <option value={3}>3次修改</option>
                    <option value={5}>5次修改</option>
                    <option value={-1}>无限修改</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">套餐描述</label>
                <textarea
                  value={pkg.description || ''}
                  onChange={(e) => updateCustomPackage(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="描述这个套餐的特点和优势"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          定价总结
        </h3>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">¥{baseHourlyRate}</div>
            <div className="text-sm text-gray-600">小时费率</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {generatePricingTiers().length}
            </div>
            <div className="text-sm text-gray-600">套餐数量</div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ¥{Math.min(...generatePricingTiers().map(t => t.price))} -
              ¥{Math.max(...generatePricingTiers().map(t => t.price))}
            </div>
            <div className="text-sm text-gray-600">价格范围</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Zap className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">定价建议</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 根据您的技能水平和经验调整价格</li>
                <li>• 提供多个价格层次，满足不同客户需求</li>
                <li>• 定期根据市场反馈调整定价策略</li>
                <li>• 考虑项目复杂度和交付时间对价格的影响</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};