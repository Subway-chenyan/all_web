import { apiRequest } from './index';
import { Service, ServicePackage, ServiceRequirement, PaginatedResponse, FilterOptions, PaginationParams } from '@/types';

export const servicesService = {
  // Get all services with pagination and filtering
  getServices: async (params?: FilterOptions & PaginationParams) => {
    const response = await apiRequest.get<PaginatedResponse<Service>>('/services/', params);
    return response.data;
  },

  // Get single service by ID
  getService: async (id: number) => {
    const response = await apiRequest.get<Service>(`/services/${id}/`);
    return response.data;
  },

  // Create new service
  createService: async (serviceData: Partial<Service>) => {
    const response = await apiRequest.post<Service>('/services/', serviceData);
    return response.data;
  },

  // Update service
  updateService: async (id: number, serviceData: Partial<Service>) => {
    const response = await apiRequest.put<Service>(`/services/${id}/`, serviceData);
    return response.data;
  },

  // Delete service
  deleteService: async (id: number) => {
    const response = await apiRequest.delete(`/services/${id}/`);
    return response.data;
  },

  // Get service packages
  getServicePackages: async (serviceId: number) => {
    const response = await apiRequest.get<ServicePackage[]>(`/services/${serviceId}/packages/`);
    return response.data;
  },

  // Create service package
  createServicePackage: async (serviceId: number, packageData: Partial<ServicePackage>) => {
    const response = await apiRequest.post<ServicePackage>(`/services/${serviceId}/packages/`, packageData);
    return response.data;
  },

  // Update service package
  updateServicePackage: async (serviceId: number, packageId: number, packageData: Partial<ServicePackage>) => {
    const response = await apiRequest.put<ServicePackage>(`/services/${serviceId}/packages/${packageId}/`, packageData);
    return response.data;
  },

  // Delete service package
  deleteServicePackage: async (serviceId: number, packageId: number) => {
    const response = await apiRequest.delete(`/services/${serviceId}/packages/${packageId}/`);
    return response.data;
  },

  // Get service requirements
  getServiceRequirements: async (serviceId: number) => {
    const response = await apiRequest.get<ServiceRequirement[]>(`/services/${serviceId}/requirements/`);
    return response.data;
  },

  // Create service requirement
  createServiceRequirement: async (serviceId: number, requirementData: Partial<ServiceRequirement>) => {
    const response = await apiRequest.post<ServiceRequirement>(`/services/${serviceId}/requirements/`, requirementData);
    return response.data;
  },

  // Update service requirement
  updateServiceRequirement: async (serviceId: number, requirementId: number, requirementData: Partial<ServiceRequirement>) => {
    const response = await apiRequest.put<ServiceRequirement>(`/services/${serviceId}/requirements/${requirementId}/`, requirementData);
    return response.data;
  },

  // Delete service requirement
  deleteServiceRequirement: async (serviceId: number, requirementId: number) => {
    const response = await apiRequest.delete(`/services/${serviceId}/requirements/${requirementId}/`);
    return response.data;
  },

  // Upload service images
  uploadServiceImages: async (serviceId: number, images: File[]) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await apiRequest.upload<{ images: string[] }>(`/services/${serviceId}/upload-images/`, formData);
    return response.data;
  },

  // Delete service image
  deleteServiceImage: async (serviceId: number, imageUrl: string) => {
    const response = await apiRequest.delete(`/services/${serviceId}/images/?image_url=${encodeURIComponent(imageUrl)}`);
    return response.data;
  },

  // Get my services (for logged-in sellers)
  getMyServices: async (params?: PaginationParams) => {
    const response = await apiRequest.get<PaginatedResponse<Service>>('/services/my/', params);
    return response.data;
  },

  // Get featured services
  getFeaturedServices: async (limit = 12) => {
    const response = await apiRequest.get<Service[]>('/services/featured/', { limit });
    return response.data;
  },

  // Get recommended services
  getRecommendedServices: async (limit = 12) => {
    const response = await apiRequest.get<Service[]>('/services/recommended/', { limit });
    return response.data;
  },

  // Search services
  searchServices: async (query: string, params?: FilterOptions & PaginationParams) => {
    const response = await apiRequest.get<PaginatedResponse<Service>>('/services/search/', {
      q: query,
      ...params,
    });
    return response.data;
  },

  // Toggle service status (active/inactive)
  toggleServiceStatus: async (id: number) => {
    const response = await apiRequest.post<Service>(`/services/${id}/toggle-status/`);
    return response.data;
  },

  // Get service statistics
  getServiceStats: async (id: number) => {
    const response = await apiRequest.get(`/services/${id}/stats/`);
    return response.data;
  },
};