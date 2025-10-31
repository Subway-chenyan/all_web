// Service creation system types
export interface ServiceFormData {
  // Basic Information
  title: string;
  category: string;
  subcategory: string;
  description: string;
  tags: string[];

  // Pricing Packages
  packages: ServicePackage[];

  // Requirements & Deliverables
  requirements: string[];
  deliverables: string[];
  revisionCount: number;
  deliveryTime: number;

  // Media
  images: ServiceImage[];
  videos: ServiceVideo[];
  documents: ServiceDocument[];

  // SEO
  seoTitle: string;
  seoDescription: string;
  keywords: string[];

  // Settings
  status: 'draft' | 'active' | 'paused' | 'inactive';
  featured: boolean;
  autoPublish: boolean;
  publishAt?: Date;
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

export interface ServiceImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ServiceVideo {
  id: string;
  url: string;
  thumbnail: string;
  duration: number;
  size: number;
  title: string;
  order: number;
}

export interface ServiceDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  order: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  subcategories: ServiceSubcategory[];
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  parentId: string;
}

export interface FormValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export interface ServiceDraft {
  id: string;
  title: string;
  data: Partial<ServiceFormData>;
  createdAt: Date;
  updatedAt: Date;
  step: number;
}

export interface ServicePreview {
  service: ServiceFormData;
  isValid: boolean;
  errors: FormValidationError[];
  warnings: FormValidationError[];
  suggestions: string[];
}

export interface SEOAnalysis {
  score: number;
  title: {
    length: number;
    isOptimal: boolean;
    suggestions: string[];
  };
  description: {
    length: number;
    isOptimal: boolean;
    suggestions: string[];
  };
  keywords: {
    count: number;
    density: number;
    suggestions: string[];
  };
  readability: {
    score: number;
    suggestions: string[];
  };
}

export interface MediaUploadOptions {
  maxFileSize: number;
  allowedTypes: string[];
  maxCount: number;
  requiredDimensions?: {
    width: number;
    height: number;
  };
}

export interface ServiceCreationStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validation: (data: Partial<ServiceFormData>) => FormValidationError[];
  isCompleted: boolean;
  isOptional: boolean;
}

export interface ServiceCreationState {
  currentStep: number;
  formData: Partial<ServiceFormData>;
  drafts: ServiceDraft[];
  isAutoSaving: boolean;
  lastSaved: Date | null;
  errors: FormValidationError[];
  warnings: FormValidationError[];
  isValid: boolean;
}