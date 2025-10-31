// Extended profile types for editing functionality

export interface ProfileEditState {
  basicInfo: BasicInfo;
  professionalInfo: ProfessionalInfo;
  contactInfo: ContactInfo;
  socialMedia: SocialMediaLink[];
  portfolio: PortfolioItem[];
  skills: SkillItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  settings: ProfileSettings;
}

export interface BasicInfo {
  displayName: string;
  avatar?: string;
  bio?: string;
  title?: string;
  location?: LocationItem;
  website?: string;
  languages: string[];
}

export interface ProfessionalInfo {
  professionalTitle: string;
  hourlyRate?: number;
  currency: string;
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  responseTime?: number;
  totalEarnings?: number;
  completedProjects?: number;
  accountType: 'individual' | 'company';
  companyName?: string;
  companyRegistrationNumber?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  timezone: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
  technologies?: string[];
}

export interface ProfileSettings {
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  language: string;
  timezone: string;
  currency: string;
  profileVisibility: 'public' | 'private' | 'clients_only';
  showContactInfo: boolean;
  allowMessages: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  projectUpdates: boolean;
  messageAlerts: boolean;
  reviewNotifications: boolean;
  promotionalEmails: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'clients_only';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showWebsite: boolean;
  showSocialMedia: boolean;
  showPortfolio: boolean;
  allowSearch: boolean;
  allowRecommendations: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  projectUpdates: boolean;
  messageAlerts: boolean;
  reviewNotifications: boolean;
  promotionalEmails: boolean;
  newOrderAlerts: boolean;
  orderStatusChanges: boolean;
  paymentNotifications: boolean;
  reviewRequests: boolean;
  newsletterSubscription: boolean;
}

export interface ProfileCompletion {
  percentage: number;
  completedSections: string[];
  incompleteSections: string[];
  suggestions: CompletionSuggestion[];
}

export interface CompletionSuggestion {
  section: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
}

export interface ProfileSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  isRequired: boolean;
  isCompleted: boolean;
  component: string;
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export interface ProfileImage {
  id: string;
  url: string;
  type: 'avatar' | 'portfolio' | 'certificate' | 'document';
  name: string;
  size: number;
  uploadedAt: string;
}

export interface ImageUploadOptions {
  maxSize: number; // in bytes
  allowedTypes: string[];
  cropRatio?: number;
  compressQuality?: number;
  multiple?: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
  icon?: string;
}

export interface LanguageLevel {
  language: string;
  proficiency: 'basic' | 'conversational' | 'professional' | 'native';
  certificate?: string;
}

export interface AvailabilitySettings {
  status: 'available' | 'busy' | 'unavailable';
  maxProjectsPerMonth?: number;
  workingHours?: {
    start: string;
    end: string;
    days: number[]; // 0-6, Sunday to Saturday
  };
  vacationDates?: {
    start: string;
    end: string;
  }[];
}

export interface PricingSettings {
  hourlyRate: number;
  currency: string;
  minimumProjectPrice?: number;
  pricingTiers: PricingTier[];
  discounts?: {
    bulk: number; // percentage
    recurring: number; // percentage
  };
}

export interface SocialMediaProfile {
  platform: 'linkedin' | 'github' | 'behance' | 'dribbble' | 'wechat' | 'weibo' | 'qq' | 'twitter' | 'instagram' | 'youtube';
  url: string;
  username: string;
  followers?: number;
  isVerified: boolean;
  visibility: 'public' | 'private';
}

export interface PortfolioMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'link';
  name: string;
  description?: string;
  size?: number;
  duration?: number; // for videos
  thumbnail?: string;
}

export interface AccountSecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'sms' | 'email' | 'app';
  emailVerified: boolean;
  phoneVerified: boolean;
  lastPasswordChange?: string;
  activeSessions: ActiveSession[];
  loginAlerts: boolean;
  sessionTimeout: number; // in minutes
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastAccess: string;
  isCurrent: boolean;
}

export interface DeletionRequest {
  reason: string;
  feedback: string;
  confirmIdentity: boolean;
  exportData: boolean;
  deleteAfter: number; // days
}

export interface ProfileExportData {
  user: BasicInfo;
  profile: ProfessionalInfo;
  skills: SkillItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  portfolio: PortfolioItem[];
  reviews: any[];
  orders: any[];
  earnings: any[];
  exportedAt: string;
}

export interface ProfileImportData {
  source: 'linkedin' | 'resume' | 'json';
  data: any;
  mapping: Record<string, string>;
  preview: any;
}