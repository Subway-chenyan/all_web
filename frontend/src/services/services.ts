import { apiRequest } from './api';
import { Service, ServicePackage, Review, User, Category, Subcategory, PaginatedResponse, ApiResponse } from '@/types';

// Extended types for service details
export interface ServiceDetail extends Service {
  packages: ServicePackage[];
  requirements: ServiceRequirement[];
  faqs: ServiceFAQ[];
  sellerProfile: UserProfile;
  gallery: ServiceGalleryItem[];
  statistics: ServiceStatistics;
  relatedServices: Service[];
  isFavorited: boolean;
  recentlyViewed?: boolean;
}

export interface ServiceFAQ {
  id: number;
  service: number;
  question: string;
  answer: string;
  isHelpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceGalleryItem {
  id: number;
  service: number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  order: number;
}

export interface ServiceStatistics {
  views: number;
  likes: number;
  shares: number;
  bookmarks: number;
  averageResponseTime: number;
  completionRate: number;
  onTimeDelivery: number;
  repeatCustomers: number;
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
  placeholder?: string;
}

export interface UserProfile extends User['profile'] {
  badges: SellerBadge[];
  languages: Language[];
  education: Education[];
  certifications: Certification[];
  responseStats: ResponseStats;
}

export interface SellerBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: string;
}

export interface Language {
  language: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface Education {
  degree: string;
  institution: string;
  startYear: string;
  endYear?: string;
  isCurrent: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface ResponseStats {
  averageResponseTime: number;
  responseRate: number;
  lastActive: string;
}

export interface ServiceReviewFilter {
  rating?: number;
  hasResponse?: boolean;
  sortBy?: 'rating' | 'date' | 'helpful';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ContactSellerData {
  serviceId: number;
  message: string;
  attachments?: File[];
  budget?: number;
  timeline?: string;
}

export interface CreateOrderData {
  serviceId: number;
  packageId?: number;
  requirements: Record<string, any>;
  customRequirements?: string;
  deliveryDate?: string;
  attachments?: File[];
}

export interface ServiceShareData {
  serviceId: number;
  platform: 'wechat' | 'weibo' | 'qq' | 'link' | 'email';
  customMessage?: string;
}

// API Service Functions
export const serviceService = {
  // Get service details
  getServiceDetail: async (serviceId: string): Promise<ApiResponse<ServiceDetail>> => {
    return apiRequest.get(`/services/${serviceId}/`);
  },

  // Get service reviews
  getServiceReviews: async (
    serviceId: string,
    filters?: ServiceReviewFilter
  ): Promise<ApiResponse<PaginatedResponse<Review>>> => {
    const params = new URLSearchParams();
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.hasResponse !== undefined) params.append('has_response', filters.hasResponse.toString());
    if (filters?.sortBy) params.append('sort_by', filters.sortBy);
    if (filters?.sortOrder) params.append('sort_order', filters.sortOrder);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('page_size', filters.pageSize.toString());

    return apiRequest.get(`/services/${serviceId}/reviews/?${params.toString()}`);
  },

  // Get service FAQs
  getServiceFAQs: async (serviceId: string): Promise<ApiResponse<ServiceFAQ[]>> => {
    return apiRequest.get(`/services/${serviceId}/faqs/`);
  },

  // Get related services
  getRelatedServices: async (serviceId: string, limit?: number): Promise<ApiResponse<Service[]>> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest.get(`/services/${serviceId}/related/${params}`);
  },

  // Submit review
  submitReview: async (
    serviceId: string,
    orderId: string,
    data: { rating: number; comment: string }
  ): Promise<ApiResponse<Review>> => {
    return apiRequest.post(`/services/${serviceId}/reviews/`, { ...data, order: orderId });
  },

  // Mark review as helpful
  markReviewHelpful: async (reviewId: string): Promise<ApiResponse<void>> => {
    return apiRequest.post(`/reviews/${reviewId}/helpful/`);
  },

  // Contact seller
  contactSeller: async (data: ContactSellerData): Promise<ApiResponse<{ conversationId: number }>> => {
    const formData = new FormData();
    formData.append('service', data.serviceId.toString());
    formData.append('message', data.message);
    if (data.budget) formData.append('budget', data.budget.toString());
    if (data.timeline) formData.append('timeline', data.timeline);

    if (data.attachments?.length) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return apiRequest.upload('/messages/contact-seller/', formData);
  },

  // Create order
  createOrder: async (data: CreateOrderData): Promise<ApiResponse<{ orderId: number; orderNumber: string }>> => {
    const formData = new FormData();
    formData.append('service', data.serviceId.toString());
    if (data.packageId) formData.append('package', data.packageId.toString());
    if (data.customRequirements) formData.append('custom_requirements', data.customRequirements);
    if (data.deliveryDate) formData.append('delivery_date', data.deliveryDate);

    // Add requirements
    Object.entries(data.requirements).forEach(([key, value]) => {
      if (typeof value === 'object' && value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    });

    // Add attachments
    if (data.attachments?.length) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });
    }

    return apiRequest.upload('/orders/', formData);
  },

  // Add to favorites
  addToFavorites: async (serviceId: string): Promise<ApiResponse<void>> => {
    return apiRequest.post(`/services/${serviceId}/favorite/`);
  },

  // Remove from favorites
  removeFromFavorites: async (serviceId: string): Promise<ApiResponse<void>> => {
    return apiRequest.delete(`/services/${serviceId}/favorite/`);
  },

  // Track service view
  trackView: async (serviceId: string): Promise<ApiResponse<void>> => {
    return apiRequest.post(`/services/${serviceId}/track-view/`);
  },

  // Share service
  shareService: async (data: ServiceShareData): Promise<ApiResponse<{ shareUrl: string }>> => {
    return apiRequest.post('/services/share/', data);
  },

  // Get seller services
  getSellerServices: async (
    sellerId: string,
    limit?: number
  ): Promise<ApiResponse<Service[]>> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiRequest.get(`/users/${sellerId}/services/${params}`);
  },

  // Report service
  reportService: async (
    serviceId: string,
    reason: string,
    description?: string
  ): Promise<ApiResponse<void>> => {
    return apiRequest.post(`/services/${serviceId}/report/`, {
      reason,
      description,
    });
  },

  // Get service analytics (for sellers)
  getServiceAnalytics: async (serviceId: string): Promise<ApiResponse<ServiceStatistics>> => {
    return apiRequest.get(`/services/${serviceId}/analytics/`);
  },

  // Update service status (for sellers)
  updateServiceStatus: async (
    serviceId: string,
    status: 'active' | 'inactive' | 'paused'
  ): Promise<ApiResponse<Service>> => {
    return apiRequest.patch(`/services/${serviceId}/`, { status });
  },
};

export default serviceService;