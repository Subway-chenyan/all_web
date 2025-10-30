import { theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// Chinese Design System Theme Configuration
export const antdTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Chinese Red Primary Color
    colorPrimary: '#ef4444',
    colorPrimaryHover: '#dc2626',
    colorPrimaryActive: '#b91c1c',
    colorPrimaryBg: '#fef2f2',
    colorPrimaryBorder: '#fca5a5',
    colorPrimaryBorderHover: '#f87171',

    // Secondary Gold Color
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',

    // Chinese Typography
    fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", system-ui, -apple-system, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,

    // Chinese Line Heights
    lineHeight: 1.6,
    lineHeightHeading1: 1.4,
    lineHeightHeading2: 1.4,
    lineHeightHeading3: 1.4,
    lineHeightHeading4: 1.4,
    lineHeightHeading5: 1.4,

    // Chinese Border Radius
    borderRadius: 3,
    borderRadiusLG: 6,
    borderRadiusSM: 2,
    borderRadiusXS: 1,

    // Chinese Spacing
    padding: 16,
    paddingLG: 24,
    paddingMD: 20,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,

    margin: 16,
    marginLG: 24,
    marginMD: 20,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // Chinese Shadows
    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',

    // Control Heights (Touch-friendly for mobile)
    controlHeight: 44,
    controlHeightLG: 48,
    controlHeightSM: 36,

    // Component Sizes
    controlHeightXS: 24,

    // Wireframe Colors
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorBgSpotlight: 'rgba(239, 68, 68, 0.05)',
    colorBgBlur: 'rgba(255, 255, 255, 0.8)',

    // Text Colors
    colorText: '#111827',
    colorTextSecondary: '#6b7280',
    colorTextTertiary: '#9ca3af',
    colorTextQuaternary: '#d1d5db',
    colorTextBase: '#111827',

    // Border Colors
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f3f4f6',
    colorBorderBg: '#f9fafb',

    // Fill Colors
    colorFillAlter: '#fafafa',
    colorFillTertiary: '#f5f5f5',
    colorFillQuaternary: '#f0f0f0',

    // Link Colors
    colorLink: '#ef4444',
    colorLinkHover: '#dc2626',
    colorLinkActive: '#b91c1c',

    // Animation Duration
    motionDurationFast: '0.15s',
    motionDurationMid: '0.3s',
    motionDurationSlow: '0.5s',

    // Motion Easing
    motionEaseInOutCirc: 'cubic-bezier(0.78, 0.14, 0.15, 0.86)',
    motionEaseOutCirc: 'cubic-bezier(0.08, 0.82, 0.17, 1)',
    motionEaseInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

    // Z-Index
    zIndexPopupBase: 1000,
    zIndexBase: 0,
    zIndexPopped: 1050,

    // Mobile Optimizations
    controlInteractiveSize: 16,
    controlOutlineWidth: 2,
    controlOutlineSize: 4,

    // Screen Sizes (Chinese mobile-first)
    screenXL: 1280,
    screenXXL: 1536,
    screenXS: 480,
    screenXSMin: 480,
    screenSM: 576,
    screenMD: 768,
    screenLG: 992,
    screenXLMin: 1280,
    screenXXLMin: 1536,

    // Form Controls
    colorErrorText: '#ef4444',
    colorSuccessText: '#22c55e',
    colorWarningText: '#f59e0b',
    colorInfoText: '#3b82f6',

    // Status Colors
    colorErrorBg: '#fef2f2',
    colorSuccessBg: '#f0fdf4',
    colorWarningBg: '#fffbeb',
    colorInfoBg: '#eff6ff',

    colorErrorBorder: '#fca5a5',
    colorSuccessBorder: '#86efac',
    colorWarningBorder: '#fcd34d',
    colorInfoBorder: '#93c5fd',
  },
  components: {
    // Button Components
    Button: {
      controlHeight: 44,
      controlHeightLG: 48,
      controlHeightSM: 36,
      borderRadius: 3,
      paddingInline: 24,
      paddingInlineLG: 32,
      paddingInlineSM: 16,
      fontWeight: 500,
      boxShadow: 'none',
      boxShadowSecondary: 'none',

      // Button States
      defaultActiveBg: '#fef2f2',
      defaultActiveBorderColor: '#ef4444',
      defaultActiveColor: '#ef4444',

      primaryShadow: '0 2px 0 rgba(185, 28, 28, 0.1)',
      primaryShadowHover: '0 4px 0 rgba(185, 28, 28, 0.15)',

      // Danger Button (Chinese Red)
      colorError: '#ef4444',
      colorErrorHover: '#dc2626',
      colorErrorActive: '#b91c1c',
      colorErrorOutline: '#fef2f2',
    },

    // Input Components
    Input: {
      controlHeight: 44,
      controlHeightLG: 48,
      controlHeightSM: 36,
      borderRadius: 3,
      paddingInline: 12,
      paddingBlock: 8,
      fontSize: 14,

      colorPrimaryHover: '#dc2626',
      activeBorderColor: '#ef4444',
      hoverBorderColor: '#f87171',

      // Input States
      colorFillAlter: '#f9fafb',
      colorFillTertiary: '#f3f4f6',
    },

    // Card Components
    Card: {
      borderRadiusLG: 6,
      paddingLG: 24,
      paddingMD: 20,
      paddingSM: 16,

      colorFillAlter: '#fafafa',
      colorFillTertiary: '#f5f5f5',

      headerBg: '#f9fafb',
      headerHeight: 56,
    },

    // Form Components
    Form: {
      itemMarginBottom: 24,
      labelFontSize: 14,
      labelColor: '#374151',
      labelHeight: 22,
      requiredMarkColor: '#ef4444',
      labelRequiredMarkColor: '#ef4444',

      errorColor: '#ef4444',
      errorColorHover: '#dc2626',

      warningColor: '#f59e0b',
      warningColorHover: '#d97706',

      successColor: '#22c55e',
      successColorHover: '#16a34a',
    },

    // Table Components
    Table: {
      headerBg: '#f9fafb',
      headerColor: '#374151',
      headerSplitColor: '#e5e7eb',

      borderColor: '#e5e7eb',
      cellPaddingInline: 16,
      cellPaddingBlock: 12,
      cellPaddingInlineMD: 12,
      cellPaddingBlockMD: 8,

      rowHoverBg: '#fef2f2',
      expandedRowBg: '#fafafa',

      headerSortHoverBg: '#f3f4f6',
      headerSortActiveBg: '#fee2e2',
    },

    // Modal Components
    Modal: {
      borderRadiusLG: 6,
      paddingLG: 24,
      paddingMD: 20,

      headerBg: '#ffffff',
      headerBorderColor: '#e5e7eb',

      contentBg: '#ffffff',

      footerBg: '#fafafa',
      footerBorderColor: '#e5e7eb',
    },

    // Menu Components
    Menu: {
      itemHeight: 44,
      itemMarginBlock: 4,
      itemMarginInline: 4,
      itemPaddingInline: 16,
      fontSize: 14,

      itemBg: 'transparent',
      itemSelectedBg: '#fef2f2',
      itemSelectedColor: '#ef4444',
      itemHoverBg: '#fef2f2',
      itemActiveBg: '#fee2e2',

      // Sub Menu
      popupBg: '#ffffff',
      popupBorderColor: '#e5e7eb',
      popupRadius: 6,
    },

    // Pagination Components
    Pagination: {
      borderRadius: 3,
      controlHeight: 32,
      controlHeightLG: 40,

      itemActiveBg: '#ef4444',
      itemActiveBorderColor: '#ef4444',
      itemActiveColorDisabled: '#d1d5db',

      itemSize: 32,
      itemSizeLG: 40,

      miniQuickJumperWidth: 50,
      miniQuickJumperFontSize: 14,

      colorPrimary: '#ef4444',
      colorPrimaryHover: '#dc2626',
    },

    // Select Components
    Select: {
      controlHeight: 44,
      controlHeightLG: 48,
      controlHeightSM: 36,
      borderRadius: 3,

      selectorBg: '#ffffff',
      colorPrimaryHover: '#dc2626',

      optionSelectedBg: '#fef2f2',
      optionActiveBg: '#fef2f2',

      // Multiple Select
      multipleSelectItemHeight: 24,
      multipleSelectItemMarginTop: 4,

      // Dropdown
      optionFontSize: 14,
      optionPadding: 8,
    },

    // Badge Components
    Badge: {
      borderRadius: 3,
      fontSize: 12,
      fontSizeSM: 10,
      fontWeight: 'normal',

      colorPrimary: '#ef4444',
      colorSuccess: '#22c55e',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',

      dotSize: 6,
      statusSize: 6,
    },

    // Tag Components
    Tag: {
      borderRadius: 3,
      borderRadiusSM: 2,
      fontSize: 12,
      fontSizeSM: 11,

      defaultBg: '#f9fafb',
      defaultColor: '#374151',

      colorPrimary: '#ef4444',
      colorSuccess: '#22c55e',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorInfo: '#3b82f6',
    },

    // Notification Components
    Notification: {
      borderRadiusLG: 6,
      padding: 16,

      colorBgElevated: '#ffffff',
      colorText: '#111827',
      colorTextDescription: '#6b7280',

      colorSuccess: '#22c55e',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorInfo: '#3b82f6',
    },

    // Avatar Components
    Avatar: {
      borderRadius: 3,
      borderRadiusLG: 6,
      borderRadiusSM: 2,
      fontSize: 14,
      fontSizeLG: 24,
      fontSizeSM: 12,

      containerSize: 40,
      containerSizeLG: 64,
      containerSizeSM: 24,

      colorTextLightSolid: '#ffffff',
    },

    // Space Components
    Space: {
      compactSizeSmall: 8,
      compactSizeMiddle: 12,
      compactSizeLarge: 16,
    },

    // Divider Components
    Divider: {
      colorSplit: '#e5e7eb',
      colorText: '#6b7280',
      fontSize: 14,
      fontSizeLG: 16,

      margin: 24,
      marginLG: 32,
      marginSM: 16,
      marginXS: 8,
    },

    // Progress Components
    Progress: {
      borderRadius: 3,
      borderRadiusSM: 2,

      colorSuccess: '#22c55e',
      colorInfo: '#3b82f6',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',

      remainingColor: '#f3f4f6',
    },

    // Rate Components
    Rate: {
      starColor: '#fbbf24',
      starBg: '#f3f4f6',
      starSize: 20,
    },

    // Statistic Components
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 24,

      titleColor: '#6b7280',
      contentColor: '#111827',
    },

    // Steps Components
    Steps: {
      descriptionMaxWidth: 140,
      iconSize: 32,
      iconSizeSM: 24,
      dotSize: 8,
      dotCurrentSize: 10,

      iconCustomSize: 32,
      iconCustomFontSize: 16,

      iconCustomBg: '#ef4444',
      iconCustomColor: '#ffffff',

      iconFinishBg: '#22c55e',
      iconFinishColor: '#ffffff',

      iconErrorBg: '#ef4444',
      iconErrorColor: '#ffffff',

      colorText: '#6b7280',
      colorTextDescription: '#9ca3af',

      navIconColor: '#9ca3af',
      navIconFinishColor: '#22c55e',
      navIconErrorColor: '#ef4444',
    },

    // Dropdown Components
    Dropdown: {
      borderRadius: 6,
      boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',

      paddingContentVertical: 8,
      paddingContentHorizontal: 0,

      arrowOffsetVertical: 4,
      arrowOffsetHorizontal: 4,
    },

    // Tooltip Components
    Tooltip: {
      borderRadius: 6,
      borderRadiusXS: 3,

      colorBgSpotlight: 'rgba(0, 0, 0, 0.85)',
      colorTextLightSolid: '#ffffff',

      fontSize: 14,
      fontSizeSM: 12,
    },

    // Popconfirm Components
    Popconfirm: {
      borderRadius: 6,
      zIndexPopup: 1030,

      colorBgElevated: '#ffffff',

      cancelButtonBg: '#ffffff',
      okButtonBg: '#ef4444',

      iconColor: '#f59e0b',
    },
  },
  };

// Chinese Locale Configuration
export const antdLocale = zhCN;

// Dark Theme Variant
export const antdDarkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...antdTheme.token,
    colorBgContainer: '#1f2937',
    colorBgElevated: '#374151',
    colorBgLayout: '#111827',
    colorBgSpotlight: 'rgba(239, 68, 68, 0.15)',
    colorBgBlur: 'rgba(17, 24, 39, 0.8)',

    colorText: '#f9fafb',
    colorTextSecondary: '#d1d5db',
    colorTextTertiary: '#9ca3af',
    colorTextQuaternary: '#6b7280',
    colorTextBase: '#f9fafb',

    colorBorder: '#4b5563',
    colorBorderSecondary: '#374151',
    colorBorderBg: '#1f2937',

    colorFillAlter: '#374151',
    colorFillTertiary: '#1f2937',
    colorFillQuaternary: '#111827',
  },
  components: antdTheme.components,
};