import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';
import { ServiceFormData, FormValidationError, ServiceCategory } from '@/types/services';
import { RichTextEditor, TagInput, CategorySelector } from '@/components/forms';

export interface BasicInfoFormProps {
  data: Partial<ServiceFormData>;
  onChange: (data: Partial<ServiceFormData>) => void;
  categories: ServiceCategory[];
  errors: FormValidationError[];
  className?: string;
  disabled?: boolean;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  data,
  onChange,
  categories,
  errors = [],
  className = '',
  disabled = false
}) => {
  const [charCount, setCharCount] = useState({
    title: data.title?.length || 0,
    description: 0
  });

  const maxTitleLength = 80;
  const maxDescriptionLength = 2000;
  const maxTags = 10;

  // Character count for description (plain text)
  useEffect(() => {
    if (data.description) {
      const plainText = data.description.replace(/<[^>]*>/g, '');
      setCharCount(prev => ({ ...prev, description: plainText.length }));
    }
  }, [data.description]);

  const handleTitleChange = (title: string) => {
    if (title.length <= maxTitleLength) {
      onChange({ ...data, title });
      setCharCount(prev => ({ ...prev, title: title.length }));
    }
  };

  const handleDescriptionChange = (description: string) => {
    const plainText = description.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxDescriptionLength) {
      onChange({ ...data, description });
      setCharCount(prev => ({ ...prev, description: plainText.length }));
    }
  };

  const handleCategoryChange = (category: string) => {
    onChange({ ...data, category, subcategory: '' });
  };

  const handleSubcategoryChange = (subcategory: string) => {
    onChange({ ...data, subcategory });
  };

  const handleTagsChange = (tags: string[]) => {
    onChange({ ...data, tags });
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field);
  };

  const getFieldClassName = (field: string) => {
    const hasError = getFieldError(field);
    return cn(
      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
      hasError
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300',
      disabled && 'bg-gray-100 cursor-not-allowed'
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">基本信息</h2>
        <p className="text-gray-600">
          为您的服务填写详细的基本信息，让客户更好地了解您的服务内容。
        </p>
      </div>

      {/* Service Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          服务标题 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={data.title || ''}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="例如：专业Logo设计服务"
          className={getFieldClassName('title')}
          disabled={disabled}
          maxLength={maxTitleLength}
        />
        <div className="mt-1 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            简洁明了地描述您的服务，突出核心卖点
          </div>
          <div className={cn(
            'text-xs',
            charCount.title > maxTitleLength * 0.9 ? 'text-red-500' : 'text-gray-500'
          )}>
            {charCount.title} / {maxTitleLength}
          </div>
        </div>
        {getFieldError('title') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('title')!.message}</p>
        )}
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          服务分类 <span className="text-red-500">*</span>
        </label>
        <CategorySelector
          categories={categories}
          selectedCategory={data.category}
          selectedSubcategory={data.subcategory}
          onCategoryChange={handleCategoryChange}
          onSubcategoryChange={handleSubcategoryChange}
          disabled={disabled}
          placeholder="选择服务分类"
        />
        <div className="mt-1 text-xs text-gray-500">
          选择最适合您服务的分类，有助于客户找到您
        </div>
        {getFieldError('category') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('category')!.message}</p>
        )}
        {getFieldError('subcategory') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('subcategory')!.message}</p>
        )}
      </div>

      {/* Service Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          服务描述 <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={data.description || ''}
          onChange={handleDescriptionChange}
          placeholder="详细描述您的服务内容、流程和价值..."
          maxLength={maxDescriptionLength}
          disabled={disabled}
          height="300px"
        />
        <div className="mt-1 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            详细说明服务内容、工作流程、交付标准等，支持富文本格式
          </div>
          <div className={cn(
            'text-xs',
            charCount.description > maxDescriptionLength * 0.9 ? 'text-red-500' : 'text-gray-500'
          )}>
            {charCount.description} / {maxDescriptionLength}
          </div>
        </div>
        {getFieldError('description') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('description')!.message}</p>
        )}
      </div>

      {/* Service Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          服务标签
        </label>
        <TagInput
          tags={data.tags || []}
          onChange={handleTagsChange}
          placeholder="输入标签后按回车添加"
          maxTags={maxTags}
          maxLength={20}
          suggestions={[
            '专业设计', '快速交付', '质量保证', '原创作品', '商业可用',
            '源文件提供', '售后支持', '多格式', '定制服务', '经验丰富'
          ]}
          disabled={disabled}
        />
        <div className="mt-1 text-xs text-gray-500">
          添加相关标签有助于提高服务曝光度，最多添加{maxTags}个标签
        </div>
        {getFieldError('tags') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('tags')!.message}</p>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 填写建议</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 标题要简洁明了，突出服务核心价值</li>
          <li>• 描述要详细具体，说明服务流程和交付标准</li>
          <li>• 选择准确的分类有助于精准匹配客户需求</li>
          <li>• 合理使用标签可以提高服务曝光率</li>
          <li>• 避免使用夸大或虚假的描述语言</li>
        </ul>
      </div>
    </div>
  );
};

export default BasicInfoForm;