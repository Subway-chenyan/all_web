// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  role: 'freelancer' | 'client' | 'admin';
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  joinedAt: string;
  lastLogin?: string;
  profileCompleted: boolean;
  skills: string[];
  languages: string[];
  hourlyRate?: number;
  location?: string;
  timezone?: string;
}

export interface UserProfile {
  user: User;
  description?: string;
  education: Education[];
  experience: Experience[];
  portfolio: PortfolioItem[];
  certifications: Certification[];
  socialLinks: SocialLink[];
  availability: AvailabilityStatus;
  responseTime: number; // in hours
  languagesSpoken: Language[];
  skills: Skill[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  tags: string[];
  projectUrl?: string;
  completedAt: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  image?: string;
}

export interface SocialLink {
  id: string;
  platform: 'linkedin' | 'github' | 'twitter' | 'website' | 'instagram';
  url: string;
  username?: string;
}

export interface Language {
  language: string;
  proficiency: 'beginner' | 'conversational' | 'fluent' | 'native';
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export type AvailabilityStatus = 'available' | 'busy' | 'away' | 'offline';

// Service related types
export interface Service {
  id: string;
  title: string;
  description: string;
  seller: User;
  category: Category;
  subcategory: string;
  tags: string[];
  price: number;
  currency: string;
  deliveryTime: number; // in days
  revisions: number;
  features: string[];
  images: string[];
  videos?: string[];
  requirements: string[];
  faqs: FAQ[];
  packages: ServicePackage[];
  status: 'active' | 'paused' | 'draft' | 'deleted';
  views: number;
  likes: number;
  ordersInProgress: number;
  totalOrders: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
  isPopular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: string[];
  serviceCount: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

// Order related types
export interface Order {
  id: string;
  service: Service;
  buyer: User;
  seller: User;
  package: ServicePackage;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  requirements?: string;
  attachments: string[];
  deliveryFiles: string[];
  revisionsLeft: number;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  messages: OrderMessage[];
  review?: Review;
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_confirmed'
  | 'in_progress'
  | 'delivered'
  | 'revision_requested'
  | 'revision_in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface OrderMessage {
  id: string;
  order: string;
  sender: User;
  content: string;
  attachments: string[];
  isInternal: boolean;
  createdAt: string;
}

// Review related types
export interface Review {
  id: string;
  order: Order;
  reviewer: User;
  reviewee: User;
  rating: number;
  title?: string;
  content: string;
  helpfulCount: number;
  isHelpful?: boolean;
  createdAt: string;
  updatedAt: string;
  response?: ReviewResponse;
}

export interface ReviewResponse {
  id: string;
  review: Review;
  content: string;
  createdAt: string;
}

// Message related types
export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: User;
  content: string;
  attachments: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  file: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

// Authentication related types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'freelancer' | 'client';
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SocialAuthRequest {
  provider: 'google' | 'github' | 'facebook';
  accessToken: string;
  role?: 'freelancer' | 'client';
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryTime?: number;
  hasOnlineSeller?: boolean;
  sellerLanguage?: string;
  sortBy?: 'relevance' | 'newest' | 'best_selling' | 'rating' | 'price_low' | 'price_high';
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  services: PaginatedResponse<Service>;
  filters: SearchFilters;
  categories: Category[];
  suggestions: string[];
}

// Notification types
export interface Notification {
  id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'new_message'
  | 'order_update'
  | 'new_order'
  | 'review_received'
  | 'promotion'
  | 'system'
  | 'account_update';

// Dashboard types
export interface DashboardStats {
  totalEarnings: number;
  activeOrders: number;
  completedOrders: number;
  averageRating: number;
  totalReviews: number;
  profileViews: number;
  monthlyEarnings: number[];
  recentOrders: Order[];
  recentMessages: Message[];
}

// Form types
export interface ServiceForm {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  packages: ServicePackage[];
  requirements: string[];
  faqs: FAQ[];
  images: string[];
  videos?: string[];
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  timezone?: string;
  languages: Language[];
  skills: Skill[];
  hourlyRate?: number;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// UI state types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}