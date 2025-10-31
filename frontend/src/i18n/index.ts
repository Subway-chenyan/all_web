import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入中文翻译文件
import zhCN from '../locales/zh-CN.json';

// 定义翻译资源的类型
export type TranslationResources = typeof zhCN;

// 初始化 i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': {
        translation: zhCN,
      },
    },
    lng: 'zh-CN',
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
  });

// 导出 i18n 实例
export default i18n;

// 创建类型安全的翻译 hook
export const useTypedTranslation = () => {
  const { t } = i18n;

  return {
    t: (key: string, options?: any) => t(key, options),
    i18n,
  };
};

// 翻译函数工具
export const translate = (key: string, options?: any): string => {
  return i18n.t(key, options);
};

// 格式化数字
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('zh-CN').format(num);
};

// 格式化货币
export const formatCurrency = (amount: number, currency: string = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
  }).format(amount);
};

// 格式化日期
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date);
};

// 创建React Context Provider
import { createContext, useContext, ReactNode } from 'react';

interface I18nContextType {
  t: (key: string, options?: any) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: string | Date) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTypedTranslation();

  const value: I18nContextType = {
    t,
    formatNumber,
    formatCurrency,
    formatDate,
  };

  return React.createElement(I18nContext.Provider, { value }, children);
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// 导出默认类型
export type { TranslationResources };