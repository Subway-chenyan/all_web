// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/token/refresh/',
    VERIFY_EMAIL: '/auth/verify-email/',
    RESEND_VERIFICATION: '/auth/resend-verification/',
    PASSWORD_RESET: '/auth/password-reset/',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset-confirm/',
    CHANGE_PASSWORD: '/auth/change-password/',
    ME: '/auth/me/',
    PROFILE: '/auth/profile/',
    SOCIAL: {
      WECHAT: '/auth/wechat/',
      QQ: '/auth/qq/',
    },
  },

  // Services
  SERVICES: {
    LIST: '/services/',
    DETAIL: (id: number) => `/services/${id}/`,
    MY: '/services/my/',
    FEATURED: '/services/featured/',
    RECOMMENDED: '/services/recommended/',
    SEARCH: '/services/search/',
    PACKAGES: (id: number) => `/services/${id}/packages/`,
    REQUIREMENTS: (id: number) => `/services/${id}/requirements/`,
    UPLOAD_IMAGES: (id: number) => `/services/${id}/upload-images/`,
    DELETE_IMAGE: (id: number) => `/services/${id}/images/`,
    TOGGLE_STATUS: (id: number) => `/services/${id}/toggle-status/`,
    STATS: (id: number) => `/services/${id}/stats/`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories/',
    DETAIL: (id: number) => `/categories/${id}/`,
  },

  // Orders
  ORDERS: {
    LIST: '/orders/',
    DETAIL: (id: number) => `/orders/${id}/`,
    REQUIREMENTS: (id: number) => `/orders/${id}/requirements/`,
    STATUS: (id: number) => `/orders/${id}/status/`,
    CANCEL: (id: number) => `/orders/${id}/cancel/`,
    REQUEST_REVISION: (id: number) => `/orders/${id}/request-revision/`,
    SUBMIT_REVISION: (id: number) => `/orders/${id}/submit-revision/`,
    COMPLETE: (id: number) => `/orders/${id}/complete/`,
    ACCEPT_DELIVERY: (id: number) => `/orders/${id}/accept-delivery/`,
    MESSAGES: (id: number) => `/orders/${id}/messages/`,
    MARK_READ: (id: number) => `/orders/${id}/messages/mark-read/`,
    ATTACHMENTS: (id: number) => `/orders/${id}/attachments/`,
    DOWNLOAD_ATTACHMENT: (id: number, attachmentId: number) =>
      `/orders/${id}/attachments/${attachmentId}/download/`,
    INVOICE: (id: number) => `/orders/${id}/invoice/`,
    DISPUTE: (id: number) => `/orders/${id}/dispute/`,
    STATS: '/orders/stats/',
  },

  // Messages
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations/',
    DETAIL: (id: number) => `/messages/conversations/${id}/`,
    SEND: (conversationId: number) => `/messages/conversations/${conversationId}/send/`,
  },

  // Reviews
  REVIEWS: {
    LIST: '/reviews/',
    CREATE: '/reviews/',
    DETAIL: (id: number) => `/reviews/${id}/`,
    RESPONSE: (id: number) => `/reviews/${id}/response/`,
    HELPFUL: (id: number) => `/reviews/${id}/helpful/`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications/',
    MARK_READ: (id: number) => `/notifications/${id}/mark-read/`,
    MARK_ALL_READ: '/notifications/mark-all-read/',
  },

  // Wallet
  WALLET: {
    BALANCE: '/wallet/balance/',
    TRANSACTIONS: '/wallet/transactions/',
    WITHDRAW: '/wallet/withdraw/',
    DEPOSIT: '/wallet/deposit/',
  },

  // Upload
  UPLOAD: {
    IMAGE: '/upload/image/',
    FILE: '/upload/file/',
    MULTIPLE: '/upload/multiple/',
  },
};

// App routes
export const ROUTES = {
  HOME: '/',
  SERVICES: '/services',
  SERVICE_DETAIL: (id: number) => `/services/${id}`,
  ORDERS: '/orders',
  ORDER_DETAIL: (id: number) => `/orders/${id}`,
  MESSAGES: '/messages',
  CONVERSATION: (id: number) => `/messages/${id}`,
  PROFILE: '/profile',
  EDIT_PROFILE: '/profile/edit',
  DASHBOARD: '/dashboard',
  WALLET: '/wallet',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  ABOUT: '/about',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  HELP: '/help',
  SEARCH: '/search',
  CATEGORIES: '/categories',
  CATEGORY: (slug: string) => `/categories/${slug}`,
  SELLER_PROFILE: (id: number) => `/sellers/${id}`,
  BECOME_SELLER: '/become-seller',
  MY_SERVICES: '/my-services',
  CREATE_SERVICE: '/create-service',
  EDIT_SERVICE: (id: number) => `/edit-service/${id}`,
  MY_ORDERS: '/my-orders',
  MY_REVIEWS: '/my-reviews',
  NOTIFICATIONS: '/notifications',
};

// Status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  IN_PROGRESS: 'in_progress',
  REVISION_REQUESTED: 'revision_requested',
  REVISION_IN_PROGRESS: 'revision_in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  DISPUTED: 'disputed',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

export const SERVICE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  REJECTED: 'rejected',
} as const;

export const USER_TYPE = {
  CLIENT: 'client',
  FREELANCER: 'freelancer',
  ADMIN: 'admin',
} as const;

export const MESSAGE_TYPE = {
  TEXT: 'text',
  FILE: 'file',
  IMAGE: 'image',
  SYSTEM: 'system',
} as const;

export const NOTIFICATION_TYPE = {
  MESSAGE: 'message',
  ORDER: 'order',
  REVIEW: 'review',
  SYSTEM: 'system',
  PROMOTION: 'promotion',
} as const;

export const PRICE_TYPE = {
  FIXED: 'fixed',
  HOURLY: 'hourly',
  PACKAGE: 'package',
} as const;

// Form validation rules
export const VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  BIO_MAX_LENGTH: 500,
  SERVICE_TITLE_MAX_LENGTH: 100,
  SERVICE_DESCRIPTION_MAX_LENGTH: 5000,
  MESSAGE_MAX_LENGTH: 2000,
  REVIEW_COMMENT_MAX_LENGTH: 1000,
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/zip',
    'application/x-rar-compressed',
  ],
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
  MAX_PAGE_SIZE: 100,
};

// File upload constants
export const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
  ],
  CHUNK_SIZE: 1024 * 1024, // 1MB
};

// Date format constants
export const DATE_FORMATS = {
  DISPLAY: 'yyyy年MM月dd日',
  DISPLAY_WITH_TIME: 'yyyy年MM月dd日 HH:mm',
  SHORT: 'MM/dd',
  ISO: 'yyyy-MM-dd',
  ISO_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
  INPUT_DATE: 'yyyy-MM-dd',
  INPUT_DATETIME: "yyyy-MM-dd'T'HH:mm",
};

// Currency constants
export const CURRENCY = {
  DEFAULT: 'CNY',
  SYMBOLS: {
    CNY: '¥',
    USD: '$',
    EUR: '€',
    GBP: '£',
  },
};

// Social media platforms
export const SOCIAL_PLATFORMS = {
  WECHAT: 'wechat',
  QQ: 'qq',
  WEIBO: 'weibo',
  GITHUB: 'github',
  LINKEDIN: 'linkedin',
  WEBSITE: 'website',
} as const;

// Notification durations
export const NOTIFICATION_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000,
  PERSISTENT: 0,
};

// Breakpoint values (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: '150ms',
  NORMAL: '300ms',
  SLOW: '500ms',
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  CART_ITEMS: 'cart_items',
  RECENT_SEARCHES: 'recent_searches',
  VIEWED_SERVICES: 'viewed_services',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查您的网络设置',
  UNAUTHORIZED: '未授权，请重新登录',
  FORBIDDEN: '权限不足',
  NOT_FOUND: '请求的资源不存在',
  SERVER_ERROR: '服务器内部错误',
  VALIDATION_ERROR: '提交的数据有误',
  FILE_TOO_LARGE: '文件大小超出限制',
  INVALID_FILE_TYPE: '不支持的文件类型',
  GENERIC_ERROR: '操作失败，请稍后重试',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  REGISTER_SUCCESS: '注册成功',
  LOGOUT_SUCCESS: '退出成功',
  PROFILE_UPDATE_SUCCESS: '个人信息更新成功',
  SERVICE_CREATE_SUCCESS: '服务创建成功',
  SERVICE_UPDATE_SUCCESS: '服务更新成功',
  ORDER_CREATE_SUCCESS: '订单创建成功',
  MESSAGE_SEND_SUCCESS: '消息发送成功',
  REVIEW_CREATE_SUCCESS: '评价发布成功',
  PASSWORD_CHANGE_SUCCESS: '密码修改成功',
  EMAIL_VERIFY_SUCCESS: '邮箱验证成功',
};

// Loading messages
export const LOADING_MESSAGES = {
  AUTHENTICATING: '正在验证...',
  LOADING: '正在加载...',
  SAVING: '正在保存...',
  UPLOADING: '正在上传...',
  SENDING: '正在发送...',
  PROCESSING: '正在处理...',
};