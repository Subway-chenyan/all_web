import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { antdTheme as chineseAntdTheme, antdDarkTheme } from './antd-theme';

// Theme context interface
interface ThemeContextType {
  /**
   * Current theme mode
   */
  mode: 'light' | 'dark';

  /**
   * Toggle theme mode
   */
  toggleTheme: () => void;

  /**
   * Set theme mode
   */
  setTheme: (mode: 'light' | 'dark') => void;

  /**
   * Current theme colors
   */
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };

  /**
   * Current theme settings
   */
  settings: {
    fontFamily: string;
    fontSize: string;
    borderRadius: string;
    spacing: string;
  };
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  /**
   * Children components
   */
  children: React.ReactNode;

  /**
   * Default theme mode
   * @default 'light'
   */
  defaultMode?: 'light' | 'dark';

  /**
   * Enable system theme detection
   * @default true
   */
  enableSystem?: boolean;

  /**
   * Storage key for theme persistence
   * @default 'chinese-theme'
   */
  storageKey?: string;
}

// Chinese Theme Provider Component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'light',
  enableSystem = true,
  storageKey = 'chinese-theme',
}) => {
  // Theme state
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    // Get stored theme or use default
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }

      // Use system preference if enabled
      if (enableSystem) {
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemPreference ? 'dark' : 'light';
      }
    }

    return defaultMode;
  });

  // Theme colors
  const colors = {
    primary: mode === 'light' ? '#ef4444' : '#f87171',
    secondary: mode === 'light' ? '#f59e0b' : '#fbbf24',
    success: mode === 'light' ? '#22c55e' : '#34d399',
    warning: mode === 'light' ? '#f59e0b' : '#fbbf24',
    error: mode === 'light' ? '#ef4444' : '#f87171',
    background: mode === 'light' ? '#ffffff' : '#1f2937',
    surface: mode === 'light' ? '#f9fafb' : '#374151',
    text: mode === 'light' ? '#111827' : '#f9fafb',
    textSecondary: mode === 'light' ? '#6b7280' : '#d1d5db',
  };

  // Theme settings
  const settings = {
    fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    borderRadius: '3px',
    spacing: '16px',
  };

  // Toggle theme function
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Set theme function
  const setTheme = (newMode: 'light' | 'dark') => {
    setMode(newMode);
  };

  // Save theme to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, mode);
    }
  }, [mode, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setMode(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystem]);

  // Apply theme to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      // Remove existing theme classes
      root.classList.remove('light', 'dark');

      // Add current theme class
      root.classList.add(mode);

      // Set data attribute for Ant Design
      root.setAttribute('data-theme', mode);

      // Update CSS variables
      root.style.setProperty('--theme-mode', mode);

      // Update font settings
      root.style.setProperty('--font-family', settings.fontFamily);
      root.style.setProperty('--font-size', settings.fontSize);
      root.style.setProperty('--border-radius', settings.borderRadius);
      root.style.setProperty('--spacing', settings.spacing);

      // Update color variables
      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }
  }, [mode, colors, settings]);

  // Theme context value
  const contextValue: ThemeContextType = {
    mode,
    toggleTheme,
    setTheme,
    colors,
    settings,
  };

  // Ant Design theme configuration
  const antdConfig = {
    theme: {
      algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: mode === 'dark' ? antdDarkTheme.token : chineseAntdTheme.token,
      components: mode === 'dark' ? antdDarkTheme.components : chineseAntdTheme.components,
    },
    locale: zhCN,
    direction: 'ltr' as const,
    componentSize: 'middle' as const,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider {...antdConfig}>
        <div className={`theme-${mode} min-h-screen bg-${mode === 'light' ? 'gray-50' : 'gray-900'} transition-colors duration-200`}>
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme toggle button component
export const ThemeToggle: React.FC<{
  className?: string;
  showLabel?: boolean;
}> = ({ className, showLabel = false }) => {
  const { mode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'inline-flex items-center justify-center p-2 rounded-lg transition-colors duration-200',
        'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
        'text-gray-700 dark:text-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        className
      )}
      aria-label={`切换到${mode === 'light' ? '深色' : '浅色'}模式`}
    >
      {mode === 'light' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {mode === 'light' ? '深色模式' : '浅色模式'}
        </span>
      )}
    </button>
  );
};

// Export theme provider and hook
export default ThemeProvider;

// Import cn utility
import { cn } from '../utils/cn';