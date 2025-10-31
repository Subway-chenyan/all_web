import { api } from './api';
import {
  VerificationStatus,
  VerificationDocument,
  FreelancerProfile,
  OnboardingProgress
} from '../types';

export class VerificationService {
  private baseURL = '/api/v1/verification';

  // Get verification status
  async getVerificationStatus(): Promise<VerificationStatus> {
    const response = await api.get(`${this.baseURL}/status/`);
    return response.data;
  }

  // Upload verification document
  async uploadDocument(
    type: string,
    file: File,
    metadata?: Record<string, any>
  ): Promise<VerificationDocument> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await api.post(`${this.baseURL}/documents/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Delete verification document
  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`${this.baseURL}/documents/${documentId}/`);
  }

  // Submit verification for review
  async submitVerification(): Promise<VerificationStatus> {
    const response = await api.post(`${this.baseURL}/submit/`);
    return response.data;
  }

  // Get freelancer profile
  async getFreelancerProfile(): Promise<FreelancerProfile> {
    const response = await api.get('/api/v1/freelancer/profile/');
    return response.data;
  }

  // Create or update freelancer profile
  async updateFreelancerProfile(profileData: Partial<FreelancerProfile>): Promise<FreelancerProfile> {
    const response = await api.post('/api/v1/freelancer/profile/', profileData);
    return response.data;
  }

  // Upload portfolio item
  async uploadPortfolioItem(
    title: string,
    description: string,
    images: File[],
    technologies: string[],
    projectUrl?: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('technologies', JSON.stringify(technologies));

    if (projectUrl) {
      formData.append('project_url', projectUrl);
    }

    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    const response = await api.post('/api/v1/freelancer/portfolio/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Update portfolio item
  async updatePortfolioItem(itemId: string, data: Partial<any>): Promise<any> {
    const response = await api.patch(`/api/v1/freelancer/portfolio/${itemId}/`, data);
    return response.data;
  }

  // Delete portfolio item
  async deletePortfolioItem(itemId: string): Promise<void> {
    await api.delete(`/api/v1/freelancer/portfolio/${itemId}/`);
  }

  // Verify phone number
  async verifyPhone(phone: string, code: string): Promise<boolean> {
    const response = await api.post(`${this.baseURL}/phone/verify/`, {
      phone,
      code,
    });
    return response.data.success;
  }

  // Send phone verification code
  async sendPhoneVerification(phone: string): Promise<boolean> {
    const response = await api.post(`${this.baseURL}/phone/send-code/`, {
      phone,
    });
    return response.data.success;
  }

  // Verify email
  async verifyEmail(token: string): Promise<boolean> {
    const response = await api.post(`${this.baseURL}/email/verify/`, {
      token,
    });
    return response.data.success;
  }

  // Resend email verification
  async resendEmailVerification(): Promise<boolean> {
    const response = await api.post(`${this.baseURL}/email/resend/`);
    return response.data.success;
  }

  // Record video introduction
  async uploadVideoIntroduction(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('video', file);

    const response = await api.post(`${this.baseURL}/video-intro/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.video_url;
  }

  // Verify social media profile
  async verifySocialMedia(
    platform: string,
    username: string,
    profileUrl: string
  ): Promise<any> {
    const response = await api.post(`${this.baseURL}/social-media/verify/`, {
      platform,
      username,
      profile_url: profileUrl,
    });
    return response.data;
  }

  // Get available skills and categories
  async getSkillsCategories(): Promise<any> {
    const response = await api.get('/api/v1/skills-categories/');
    return response.data;
  }

  // Assess skills
  async assessSkills(skills: Array<{
    name: string;
    category: string;
    level: string;
    years_experience: number;
  }>): Promise<any> {
    const response = await api.post(`${this.baseURL}/skills-assess/`, {
      skills,
    });
    return response.data;
  }

  // Get onboarding progress
  async getOnboardingProgress(): Promise<OnboardingProgress> {
    const response = await api.get('/api/v1/onboarding/progress/');
    return response.data;
  }

  // Save onboarding progress
  async saveOnboardingProgress(
    stepId: string,
    data: Record<string, any>
  ): Promise<OnboardingProgress> {
    const response = await api.post('/api/v1/onboarding/progress/', {
      step_id: stepId,
      data,
    });
    return response.data;
  }

  // Complete onboarding
  async completeOnboarding(): Promise<void> {
    await api.post('/api/v1/onboarding/complete/');
  }

  // Get verification requirements
  async getVerificationRequirements(): Promise<any> {
    const response = await api.get(`${this.baseURL}/requirements/`);
    return response.data;
  }

  // Get verification tips and help
  async getVerificationTips(step?: string): Promise<any> {
    const url = step
      ? `${this.baseURL}/tips/?step=${step}`
      : `${this.baseURL}/tips/`;
    const response = await api.get(url);
    return response.data;
  }

  // Check document validation status
  async checkDocumentValidation(documentId: string): Promise<any> {
    const response = await api.get(`${this.baseURL}/documents/${documentId}/validation/`);
    return response.data;
  }

  // Get pricing suggestions
  async getPricingSuggestions(
    skills: string[],
    experience: string,
    location: string
  ): Promise<any> {
    const response = await api.post(`${this.baseURL}/pricing-suggestions/`, {
      skills,
      experience,
      location,
    });
    return response.data;
  }

  // Download verification report
  async downloadVerificationReport(): Promise<Blob> {
    const response = await api.get(`${this.baseURL}/report/`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const verificationService = new VerificationService();