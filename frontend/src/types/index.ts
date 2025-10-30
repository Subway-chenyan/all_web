// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  userType: 'client' | 'freelancer' | 'admin';
  isActive: boolean;
  isVerified: boolean;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  user: number;
  displayName: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  experience: string;
  education: string;
  portfolio: PortfolioItem[];
  socialLinks: SocialLink[];
  location?: string;
  website?: string;
  responseTime?: number;
  languages: string[];
  hourlyRate?: number;
  availability: boolean;
  totalEarnings?: number;
  completedProjects?: number;
  averageRating?: number;
  totalReviews?: number;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  images: string[];
  projectUrl?: string;
  technologies: string[];
  completedAt: string;
}

export interface SocialLink {
  platform: 'wechat' | 'qq' | 'weibo' | 'github' | 'linkedin' | 'website';
  url: string;
  username: string;
}

// Service related types
export interface Service {
  id: number;
  title: string;
  description: string;
  seller: User;
  category: Category;
  subcategory: Subcategory;
  price: number;
  priceType: 'fixed' | 'hourly' | 'package';
  deliveryTime: number;
  revisions: number;
  features: string[];
  images: string[];
  tags: string[];
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  isFeatured: boolean;
  viewCount: number;
  orderCount: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackage {
  id: number;
  service: number;
  name: string;
  description: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
  isPopular: boolean;
}

export interface ServiceRequirement {
  id: number;
  service: number;
  title: string;
  description: string;
  type: 'text' | 'file' | 'boolean' | 'number' | 'date';
  required: boolean;
  options?: string[];
  maxCharacters?: number;
  allowedFileTypes?: string[];
}

// Category related types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  subcategories: Subcategory[];
  serviceCount: number;
}

export interface Subcategory {
  id: number;
  category: number;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  serviceCount: number;
}

// Order related types
export interface Order {
  id: number;
  orderNumber: string;
  buyer: User;
  seller: User;
  service: Service;
  package?: ServicePackage;
  requirements: OrderRequirement[];
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  deliveryDate: string;
  actualDeliveryDate?: string;
  revisionsRemaining: number;
  messages: Message[];
  attachments: OrderAttachment[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'in_progress'
  | 'revision_requested'
  | 'revision_in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'disputed';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface OrderRequirement {
  id: number;
  order: number;
  title: string;
  description: string;
  type: 'text' | 'file' | 'boolean' | 'number' | 'date';
  value: string | number | boolean;
  file?: string;
  isProvided: boolean;
}

export interface OrderAttachment {
  id: number;
  order: number;
  file: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedBy: number;
  uploadedAt: string;
}

// Message related types
export interface Message {
  id: number;
  sender: User;
  receiver: User;
  order?: Order;
  content: string;
  attachments: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  messageType: 'text' | 'file' | 'image' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: number;
  message: number;
  file: string;
  filename: string;
  fileType: string;
  fileSize: number;
}

export interface Conversation {
  id: number;
  participant1: User;
  participant2: User;
  order?: Order;
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Review and Rating types
export interface Review {
  id: number;
  order: Order;
  reviewer: User;
  reviewee: User;
  rating: number;
  comment: string;
  response?: string;
  isPublic: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
  userType: 'client' | 'freelancer';
  agreeToTerms: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface SocialAuthData {
  provider: 'wechat' | 'qq';
  code: string;
  state?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Form related types
export interface FormErrors {
  [key: string]: string | string[] | undefined;
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// Utility types
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FilterOptions {
  category?: number;
  subcategory?: number;
  priceMin?: number;
  priceMax?: number;
  deliveryTime?: number;
  sellerLevel?: string;
  rating?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// Notification types
export interface Notification {
  id: number;
  user: number;
  type: 'message' | 'order' | 'review' | 'system' | 'promotion';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// Wallet and Transaction types
export interface Wallet {
  id: number;
  user: number;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  wallet: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  source: string;
  status: 'pending' | 'completed' | 'failed';
  relatedOrder?: number;
  createdAt: string;
  updatedAt: string;
}