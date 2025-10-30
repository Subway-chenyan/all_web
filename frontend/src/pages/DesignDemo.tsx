import React, { useState } from 'react';
import { Rate, Avatar, Badge, Tag, Form as AntdForm, Input as AntdInput, Select as AntdSelect } from 'antd';
import { UserOutlined, StarOutlined, ShoppingCartOutlined, HeartOutlined, EyeOutlined } from '@ant-design/icons';
import ChineseButton from '../components/ui/ChineseButton';
import ChineseCard from '../components/ui/ChineseCard';
import { ThemeToggle } from '../theme/ThemeProvider';

// Design Demo Page
const DesignDemo: React.FC = () => {
  const [rating, setRating] = useState(4);
  const [form] = AntdForm.useForm();

  // Service options for demo
  const serviceOptions = [
    { label: '网页设计与开发', value: 'web-design' },
    { label: '移动应用开发', value: 'mobile-app' },
    { label: 'UI/UX 设计', value: 'ui-ux' },
    { label: '品牌设计', value: 'brand-design' },
    { label: '内容创作', value: 'content' },
    { label: '数字营销', value: 'marketing' },
  ];

  // Sample services data
  const sampleServices = [
    {
      id: 1,
      title: '专业网页设计',
      provider: '设计工作室',
      price: '¥2,999',
      originalPrice: '¥4,999',
      rating: 4.8,
      reviews: 128,
      category: '网页设计',
      image: '/api/placeholder/300/200',
      description: '专业的响应式网页设计，适配各种设备，提供现代化用户体验。',
    },
    {
      id: 2,
      title: '移动应用开发',
      provider: '开发团队',
      price: '¥15,999',
      originalPrice: '¥25,999',
      rating: 4.9,
      reviews: 89,
      category: '应用开发',
      image: '/api/placeholder/300/200',
      description: 'iOS和Android原生应用开发，提供完整的技术解决方案。',
    },
    {
      id: 3,
      title: '品牌视觉设计',
      provider: '创意设计师',
      price: '¥3,999',
      originalPrice: null,
      rating: 4.7,
      reviews: 256,
      category: '品牌设计',
      image: '/api/placeholder/300/200',
      description: '包括Logo设计、VI系统、宣传物料等完整品牌视觉方案。',
    },
    {
      id: 4,
      title: '内容营销策划',
      provider: '营销专家',
      price: '¥5,999',
      originalPrice: '¥8,999',
      rating: 4.6,
      reviews: 67,
      category: '数字营销',
      image: '/api/placeholder/300/200',
      description: '社交媒体内容策划、文案撰写、营销策略制定。',
    },
  ];

  // Handle form submission
  const handleFormSubmit = (values: any) => {
    console.log('表单提交:', values);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {/* Header */}
      <div className="container-chinese mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 text-chinese">
              中文设计系统演示
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-chinese">
              展示为中文用户优化的界面设计和组件系统
            </p>
          </div>
          <ThemeToggle showLabel />
        </div>
      </div>

      {/* Hero Section */}
      <div className="container-chinese mb-12">
        <ChineseCard variant="elevated" size="lg" className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-chinese">
            专业的中文自由职业平台
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 text-chinese-loose">
            连接优秀的中文服务提供者和企业，提供高质量的本地化服务体验
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <ChineseButton variant="primary" size="lg" icon={<ShoppingCartOutlined />}>
              开始寻找服务
            </ChineseButton>
            <ChineseButton variant="outline" size="lg" icon={<UserOutlined />}>
              成为服务提供者
            </ChineseButton>
          </div>
        </ChineseCard>
      </div>

      {/* Button Showcase */}
      <div className="container-chinese mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-chinese">
          按钮组件展示
        </h2>
        <ChineseCard>
          <div className="space-y-6">
            {/* Button Variants */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-chinese">
                按钮变体
              </h3>
              <div className="flex flex-wrap gap-3">
                <ChineseButton variant="primary">主要按钮</ChineseButton>
                <ChineseButton variant="secondary">次要按钮</ChineseButton>
                <ChineseButton variant="outline">轮廓按钮</ChineseButton>
                <ChineseButton variant="ghost">幽灵按钮</ChineseButton>
                <ChineseButton variant="danger">危险按钮</ChineseButton>
                <ChineseButton variant="success">成功按钮</ChineseButton>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-chinese">
                按钮尺寸
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <ChineseButton size="xs">超小按钮</ChineseButton>
                <ChineseButton size="sm">小按钮</ChineseButton>
                <ChineseButton size="md">中等按钮</ChineseButton>
                <ChineseButton size="lg">大按钮</ChineseButton>
                <ChineseButton size="xl">超大按钮</ChineseButton>
              </div>
            </div>

            {/* Button with Icons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-chinese">
                带图标的按钮
              </h3>
              <div className="flex flex-wrap gap-3">
                <ChineseButton variant="primary" icon={<StarOutlined />}>
                  收藏服务
                </ChineseButton>
                <ChineseButton variant="outline" icon={<EyeOutlined />} iconPosition="right">
                  查看详情
                </ChineseButton>
                <ChineseButton variant="ghost" icon={<HeartOutlined />}>
                  喜欢
                </ChineseButton>
              </div>
            </div>

            {/* Button States */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-chinese">
                按钮状态
              </h3>
              <div className="flex flex-wrap gap-3">
                <ChineseButton loading>加载中...</ChineseButton>
                <ChineseButton disabled>禁用状态</ChineseButton>
                <ChineseButton loading loadingText="正在提交...">
                  提交表单
                </ChineseButton>
              </div>
            </div>
          </div>
        </ChineseCard>
      </div>

      {/* Form Showcase */}
      <div className="container-chinese mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-chinese">
          表单组件展示
        </h2>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <ChineseCard header="用户注册表单">
            <AntdForm
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
              className="text-chinese"
            >
              <AntdForm.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <AntdInput placeholder="请输入用户名" className="h-11" />
              </AntdForm.Item>

              <AntdForm.Item
                name="email"
                label="电子邮箱"
                rules={[{ required: true, message: '请输入电子邮箱' }]}
              >
                <AntdInput type="email" placeholder="example@email.com" className="h-11" />
              </AntdForm.Item>

              <AntdForm.Item name="phone" label="手机号码">
                <AntdInput type="tel" placeholder="请输入手机号" className="h-11" />
              </AntdForm.Item>

              <AntdForm.Item name="service" label="感兴趣的服务">
                <AntdSelect
                  placeholder="请选择服务类型"
                  options={serviceOptions}
                  showSearch
                  className="w-full"
                />
              </AntdForm.Item>

              <AntdForm.Item name="bio" label="个人简介">
                <AntdInput.TextArea
                  rows={4}
                  placeholder="请简单介绍一下自己..."
                  showCount
                  maxLength={200}
                />
              </AntdForm.Item>

              <div className="flex gap-3">
                <ChineseButton variant="primary" htmlType="submit">
                  立即注册
                </ChineseButton>
                <ChineseButton variant="outline" htmlType="reset">
                  重置表单
                </ChineseButton>
              </div>
            </AntdForm>
          </ChineseCard>

          {/* Service Request Form */}
          <ChineseCard header="服务需求表单">
            <AntdForm
              layout="vertical"
              onFinish={handleFormSubmit}
              className="text-chinese"
            >
              <AntdForm.Item
                name="title"
                label="项目标题"
                rules={[{ required: true, message: '请输入项目标题' }]}
              >
                <AntdInput placeholder="请描述您的项目需求" className="h-11" />
              </AntdForm.Item>

              <AntdForm.Item
                name="category"
                label="服务类别"
                rules={[{ required: true, message: '请选择服务类别' }]}
              >
                <AntdSelect
                  placeholder="选择服务类别"
                  options={serviceOptions}
                  className="w-full"
                />
              </AntdForm.Item>

              <AntdForm.Item name="budget" label="预算范围">
                <AntdSelect
                  placeholder="选择预算范围"
                  options={[
                    { label: '¥1,000 - ¥5,000', value: '1k-5k' },
                    { label: '¥5,000 - ¥10,000', value: '5k-10k' },
                    { label: '¥10,000 - ¥20,000', value: '10k-20k' },
                    { label: '¥20,000+', value: '20k+' },
                  ]}
                  className="w-full"
                />
              </AntdForm.Item>

              <AntdForm.Item name="requirements" label="详细需求">
                <AntdInput.TextArea
                  rows={6}
                  placeholder="请详细描述您的项目需求..."
                  showCount
                  maxLength={500}
                />
              </AntdForm.Item>

              <div className="flex gap-3">
                <ChineseButton variant="primary" htmlType="submit">
                  提交需求
                </ChineseButton>
                <ChineseButton variant="outline" htmlType="reset">
                  重置
                </ChineseButton>
              </div>
            </AntdForm>
          </ChineseCard>
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="container-chinese mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-chinese">
          服务卡片展示
        </h2>
        <div className="grid xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleServices.map((service) => (
            <ChineseCard
              key={service.id}
              variant="default"
              hoverable
              className="group"
            >
              {/* Service Image */}
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-4 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-sm">服务图片</span>
                </div>
              </div>

              {/* Service Content */}
              <div className="space-y-3">
                {/* Category and Rating */}
                <div className="flex items-center justify-between">
                  <Tag color="red" className="text-xs">
                    {service.category}
                  </Tag>
                  <div className="flex items-center gap-1">
                    <StarOutlined className="text-yellow-400 text-sm" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {service.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({service.reviews})
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors text-chinese">
                  {service.title}
                </h3>

                {/* Provider */}
                <div className="flex items-center gap-2">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {service.provider}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 text-chinese">
                  {service.description}
                </p>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-red-600">
                    {service.price}
                  </span>
                  {service.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {service.originalPrice}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <ChineseButton variant="primary" size="sm" className="flex-1">
                    查看详情
                  </ChineseButton>
                  <ChineseButton variant="outline" size="sm" className="flex-1">
                    <HeartOutlined />
                  </ChineseButton>
                </div>
              </div>
            </ChineseCard>
          ))}
        </div>
      </div>

      {/* Additional Components */}
      <div className="container-chinese mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-chinese">
          其他组件展示
        </h2>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Status Badges */}
          <ChineseCard header="状态标识">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Badge status="success" text="已完成" />
                <Badge status="processing" text="进行中" />
                <Badge status="warning" text="待确认" />
                <Badge status="error" text="已取消" />
                <Badge status="default" text="未开始" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Tag color="success">成功</Tag>
                <Tag color="processing">处理中</Tag>
                <Tag color="warning">警告</Tag>
                <Tag color="error">错误</Tag>
                <Tag color="default">默认</Tag>
              </div>
            </div>
          </ChineseCard>

          {/* Rating Component */}
          <ChineseCard header="评分组件">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  服务质量评分
                </label>
                <Rate value={rating} onChange={setRating} />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {rating}/5 分
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <StarOutlined className="text-yellow-400" />
                  <span className="text-sm">4.8</span>
                </div>
                <div className="text-sm text-gray-500">128 条评价</div>
              </div>
            </div>
          </ChineseCard>

          {/* Price Display */}
          <ChineseCard header="价格展示">
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-600">¥2,999</span>
                <span className="text-lg text-gray-400 line-through">¥4,999</span>
                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                  省40%
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                一次性付款，包含一年维护服务
              </div>
            </div>
          </ChineseCard>

          {/* User Avatar */}
          <ChineseCard header="用户头像">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar size={64} icon={<UserOutlined />} />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    张设计师
                  </div>
                  <div className="text-sm text-gray-500">UI/UX 设计专家</div>
                  <div className="flex items-center gap-1 mt-1">
                    <StarOutlined className="text-yellow-400 text-xs" />
                    <span className="text-xs">4.9 (238)</span>
                  </div>
                </div>
              </div>
            </div>
          </ChineseCard>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 mt-16 py-8">
        <div className="container-chinese text-center">
          <p className="text-gray-600 dark:text-gray-400 text-chinese">
            © 2024 中文自由职业平台 - 专为中文用户设计的本地化服务
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DesignDemo;