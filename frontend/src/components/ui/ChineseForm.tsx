import React from 'react';
import { Form as AntdForm, FormProps as AntdFormProps, Input, Select, Button, Radio, Checkbox, Rate } from 'antd';
import { cn } from '../../utils/cn';

// Chinese Form Component Interface
export interface ChineseFormProps extends Omit<AntdFormProps, 'layout' | 'size'> {
  /**
   * Form layout optimized for Chinese mobile users
   * @default 'vertical'
   */
  layout?: 'vertical' | 'horizontal' | 'inline';

  /**
   * Form size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Submit button text
   * @default '提交'
   */
  submitText?: string;

  /**
   * Reset button text
   * @default '重置'
   */
  resetText?: string;

  /**
   * Show reset button
   * @default true
   */
  showReset?: boolean;

  /**
   * Show loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Custom CSS classes using Tailwind
   */
  className?: string;

  /**
   * Form actions (custom buttons)
   */
  actions?: React.ReactNode;

  /**
   * Children content
   */
  children?: React.ReactNode;
}

// Chinese Form Component
export const ChineseForm: React.FC<ChineseFormProps> = ({
  layout = 'vertical',
  size = 'md',
  submitText = '提交',
  resetText = '重置',
  showReset = true,
  loading = false,
  className,
  actions,
  children,
  onFinish,
  ...antdProps
}) => {
  // Size mapping
  const sizeMapping = {
    sm: 'small' as const,
    md: 'middle' as const,
    lg: 'large' as const,
  };

  // Form classes
  const formClasses = cn(
    'text-chinese',
    layout === 'vertical' && 'space-y-4',
    layout === 'horizontal' && 'grid grid-cols-1 md:grid-cols-3 gap-4',
    layout === 'inline' && 'flex flex-wrap items-center gap-4',
    className
  );

  // Handle form submission
  const handleFinish = async (values: any) => {
    if (onFinish) {
      await onFinish(values);
    }
  };

  // Default actions
  const defaultActions = (
    <div className={cn('flex gap-3', layout === 'inline' ? 'ml-4' : 'mt-6')}>
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        size={sizeMapping[size]}
        className="min-h-[44px] px-6 font-medium"
      >
        {submitText}
      </Button>
      {showReset && (
        <Button
          htmlType="reset"
          size={sizeMapping[size]}
          className="min-h-[44px] px-6 font-medium"
        >
          {resetText}
        </Button>
      )}
    </div>
  );

  return (
    <AntdForm
      {...antdProps}
      layout={layout}
      size={sizeMapping[size]}
      className={formClasses}
      onFinish={handleFinish}
    >
      {children}
      {actions || defaultActions}
    </AntdForm>
  );
};

// Chinese Form Item Component
export interface ChineseFormItemProps {
  /**
   * Field name
   */
  name: string;

  /**
   * Label text
   */
  label?: string;

  /**
   * Required field indicator
   * @default false
   */
  required?: boolean;

  /**
   * Help text
   */
  help?: string;

  /**
   * Extra information
   */
  extra?: string;

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Input component
   */
  children: React.ReactNode;
}

export const ChineseFormItem: React.FC<ChineseFormItemProps> = ({
  name,
  label,
  required = false,
  help,
  extra,
  className,
  children,
}) => {
  return (
    <AntdForm.Item
      name={name}
      label={label}
      required={required}
      help={help}
      extra={extra}
      className={cn('mb-4', className)}
      rules={required ? [{ required: true, message: `请输入${label}` }] : undefined}
    >
      {children}
    </AntdForm.Item>
  );
};

// Chinese Input Component
export interface ChineseInputProps {
  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Input type
   * @default 'text'
   */
  type?: 'text' | 'password' | 'email' | 'tel' | 'url' | 'search';

  /**
   * Show clear button
   * @default true
   */
  allowClear?: boolean;

  /**
   * Max length
   */
  maxLength?: number;

  /**
   * Show character count
   * @default false
   */
  showCount?: boolean;

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Input props
   */
  [key: string]: any;
}

export const ChineseInput: React.FC<ChineseInputProps> = ({
  placeholder = '请输入...',
  type = 'text',
  allowClear = true,
  maxLength,
  showCount = false,
  className,
  ...props
}) => {
  const InputComponent = type === 'password' ? Input.Password : Input;

  return (
    <InputComponent
      {...props}
      type={type}
      placeholder={placeholder}
      allowClear={allowClear}
      maxLength={maxLength}
      showCount={showCount}
      className={cn('h-11 px-4 rounded-chinese', className)}
    />
  );
};

// Chinese Select Component
export interface ChineseSelectProps {
  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Options array
   */
  options?: { label: string; value: string | number }[];

  /**
   * Allow search
   * @default false
   */
  showSearch?: boolean;

  /**
   * Allow clear
   * @default true
   */
  allowClear?: boolean;

  /**
   * Multiple selection
   * @default false
   */
  mode?: 'multiple' | 'tags';

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Select props
   */
  [key: string]: any;
}

export const ChineseSelect: React.FC<ChineseSelectProps> = ({
  placeholder = '请选择...',
  options,
  showSearch = false,
  allowClear = true,
  mode,
  className,
  ...props
}) => {
  return (
    <Select
      {...props}
      placeholder={placeholder}
      options={options}
      showSearch={showSearch}
      allowClear={allowClear}
      mode={mode}
      className={cn('w-full', className)}
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    />
  );
};

// Chinese Textarea Component
export interface ChineseTextareaProps {
  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Number of rows
   * @default 4
   */
  rows?: number;

  /**
   * Max length
   */
  maxLength?: number;

  /**
   * Show character count
   * @default false
   */
  showCount?: boolean;

  /**
   * Allow clear
   * @default true
   */
  allowClear?: boolean;

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Textarea props
   */
  [key: string]: any;
}

export const ChineseTextarea: React.FC<ChineseTextareaProps> = ({
  placeholder = '请输入...',
  rows = 4,
  maxLength,
  showCount = false,
  allowClear = true,
  className,
  ...props
}) => {
  return (
    <Input.TextArea
      {...props}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      showCount={showCount}
      allowClear={allowClear}
      className={cn('rounded-chinese', className)}
    />
  );
};

// Chinese Radio Group Component
export interface ChineseRadioGroupProps {
  /**
   * Options array
   */
  options: { label: string; value: string | number }[];

  /**
   * Layout direction
   * @default 'vertical'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Radio group props
   */
  [key: string]: any;
}

export const ChineseRadioGroup: React.FC<ChineseRadioGroupProps> = ({
  options,
  direction = 'vertical',
  className,
  ...props
}) => {
  return (
    <Radio.Group
      {...props}
      className={cn('space-y-2', direction === 'horizontal' && 'flex space-y-0 space-x-4', className)}
    >
      {options.map((option) => (
        <Radio key={option.value} value={option.value}>
          {option.label}
        </Radio>
      ))}
    </Radio.Group>
  );
};

// Chinese Checkbox Group Component
export interface ChineseCheckboxGroupProps {
  /**
   * Options array
   */
  options: { label: string; value: string | number }[];

  /**
   * Layout direction
   * @default 'vertical'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Checkbox group props
   */
  [key: string]: any;
}

export const ChineseCheckboxGroup: React.FC<ChineseCheckboxGroupProps> = ({
  options,
  direction = 'vertical',
  className,
  ...props
}) => {
  return (
    <Checkbox.Group
      {...props}
      className={cn('space-y-2', direction === 'horizontal' && 'flex space-y-0 space-x-4', className)}
    >
      {options.map((option) => (
        <Checkbox key={option.value} value={option.value}>
          {option.label}
        </Checkbox>
      ))}
    </Checkbox.Group>
  );
};

// Chinese Rate Component
export interface ChineseRateProps {
  /**
   * Number of stars
   * @default 5
   */
  count?: number;

  /**
   * Allow half stars
   * @default false
   */
  allowHalf?: boolean;

  /**
   * Allow clear
   * @default true
   */
  allowClear?: boolean;

  /**
   * Character tooltips
   */
  tooltips?: string[];

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Rate props
   */
  [key: string]: any;
}

export const ChineseRate: React.FC<ChineseRateProps> = ({
  count = 5,
  allowHalf = false,
  allowClear = true,
  tooltips = ['很差', '较差', '一般', '较好', '很好'],
  className,
  ...props
}) => {
  return (
    <Rate
      {...props}
      count={count}
      allowHalf={allowHalf}
      allowClear={allowClear}
      tooltips={tooltips}
      className={className}
    />
  );
};

// Export components
const ChineseFormWithComponents = Object.assign(ChineseForm, {
  Item: ChineseFormItem,
  Input: ChineseInput,
  Select: ChineseSelect,
  Textarea: ChineseTextarea,
  RadioGroup: ChineseRadioGroup,
  CheckboxGroup: ChineseCheckboxGroup,
  Rate: ChineseRate,
});

export default ChineseFormWithComponents;