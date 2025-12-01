import api from './api';

// ===== TYPES =====
export interface Organization {
  _id: string;
  name: string;
  type: 'COMPANY' | 'UNIVERSITY' | 'TRAINING_INSTITUTE' | 'INDIVIDUAL';
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED';
  contactInfo: {
    email: string;
    phone?: string;
    website?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    };
  };
  subscription: {
    plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
    startDate: string;
    endDate: string;
    credits: number;
    maxConcurrentUsers: number;
    maxExamsPerMonth: number;
  };
  features?: {
    allowedDomains?: string[];
    brandingEnabled?: boolean;
    customEmailTemplates?: boolean;
    advancedProctoring?: boolean;
    apiAccess?: boolean;
    bulkOperations?: boolean;
    analyticsExport?: boolean;
  };
  stats: {
    totalUsers: number;
    totalExams: number;
    totalAssessments: number;
    creditsUsed: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalExams: number;
  totalAssessments: number;
  organizationsByType: Record<string, number>;
  organizationsByStatus: Record<string, number>;
  organizationsByPlan: Record<string, number>;
  usersByRole: Record<string, number>;
}

export interface ExamTemplate {
  _id: string;
  name: string;
  description: string;
  category: 'TECHNICAL' | 'APTITUDE' | 'LANGUAGE' | 'CUSTOM';
  settings: {
    defaultDuration: number;
    passingPercentage: number;
    randomizeQuestions: boolean;
    showResultsImmediately: boolean;
    allowReview: boolean;
  };
  tags: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionPool {
  _id: string;
  name: string;
  description: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'ORGANIZATION';
  categories: string[];
  tags: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questions: any[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemCertification {
  _id: string;
  name: string;
  description: string;
  type: 'COMPLETION' | 'ACHIEVEMENT' | 'SKILL_BASED' | 'CUSTOM';
  validity: 'LIFETIME' | 'ONE_YEAR' | 'TWO_YEARS' | 'THREE_YEARS';
  criteria: {
    minimumScore: number;
    minimumAssessments: number;
    requiredSkills: string[];
    requireAllSkills: boolean;
  };
  design?: {
    templateUrl?: string;
    badgeUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  isActive: boolean;
  issuedCount: number;
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PricingPlan {
  _id: string;
  tier: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  description: string;
  pricing: {
    monthly: number;
    quarterly: number;
    yearly: number;
    currency: string;
  };
  features: {
    credits: number;
    maxConcurrentUsers: number;
    maxExamsPerMonth: number;
    maxStorageGB: number;
    brandingEnabled: boolean;
    customEmailTemplates: boolean;
    advancedProctoring: boolean;
    apiAccess: boolean;
    bulkOperations: boolean;
    analyticsExport: boolean;
    prioritySupport: boolean;
    dedicatedAccountManager: boolean;
    customIntegrations: boolean;
    whiteLabeling: boolean;
  };
  highlights: string[];
  isActive: boolean;
  isPublic: boolean;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

// ===== ORGANIZATION MANAGEMENT =====
export const superAdminService = {
  // Organizations
  async getAllOrganizations(params?: {
    type?: string;
    status?: string;
    plan?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/super-admin/organizations', { params });
    return response.data;
  },

  async getOrganizationById(id: string) {
    const response = await api.get(`/super-admin/organizations/${id}`);
    return response.data;
  },

  async createOrganization(data: any) {
    const response = await api.post('/super-admin/organizations', data);
    return response.data;
  },

  async updateOrganization(id: string, data: any) {
    const response = await api.put(`/super-admin/organizations/${id}`, data);
    return response.data;
  },

  async deleteOrganization(id: string) {
    const response = await api.delete(`/super-admin/organizations/${id}`);
    return response.data;
  },

  async assignAdmin(organizationId: string, data: { name: string; email: string; password?: string }) {
    const response = await api.post(`/super-admin/organizations/${organizationId}/assign-admin`, data);
    return response.data;
  },

  async suspendOrganization(id: string) {
    const response = await api.put(`/super-admin/organizations/${id}/suspend`);
    return response.data;
  },

  async activateOrganization(id: string) {
    const response = await api.put(`/super-admin/organizations/${id}/activate`);
    return response.data;
  },

  async getOrganizationUsage(id: string) {
    const response = await api.get(`/super-admin/organizations/${id}/usage`);
    return response.data;
  },

  // Analytics
  async getPlatformStats() {
    const response = await api.get('/super-admin/analytics/platform-stats');
    return response.data;
  },

  async getTopOrganizations(limit: number = 10) {
    const response = await api.get('/super-admin/analytics/top-organizations', {
      params: { limit },
    });
    return response.data;
  },

  async getSystemHealth() {
    const response = await api.get('/super-admin/analytics/system-health');
    return response.data;
  },

  async getRevenueAnalytics() {
    const response = await api.get('/super-admin/analytics/revenue');
    return response.data;
  },

  async compareOrganizations(ids: string[]) {
    const response = await api.get('/super-admin/analytics/compare-organizations', {
      params: { ids: ids.join(',') },
    });
    return response.data;
  },

  // Exam Templates
  async getAllExamTemplates(isActive?: boolean) {
    const response = await api.get('/super-admin/system-config/templates', {
      params: { isActive },
    });
    return response.data;
  },

  async getExamTemplateById(id: string) {
    const response = await api.get(`/super-admin/system-config/templates/${id}`);
    return response.data;
  },

  async createExamTemplate(data: any) {
    const response = await api.post('/super-admin/system-config/templates', data);
    return response.data;
  },

  async updateExamTemplate(id: string, data: any) {
    const response = await api.put(`/super-admin/system-config/templates/${id}`, data);
    return response.data;
  },

  async deleteExamTemplate(id: string) {
    const response = await api.delete(`/super-admin/system-config/templates/${id}`);
    return response.data;
  },

  // Question Pools
  async getAllQuestionPools(params?: { visibility?: string; isActive?: boolean }) {
    const response = await api.get('/super-admin/system-config/question-pools', { params });
    return response.data;
  },

  async getQuestionPoolById(id: string) {
    const response = await api.get(`/super-admin/system-config/question-pools/${id}`);
    return response.data;
  },

  async createQuestionPool(data: any) {
    const response = await api.post('/super-admin/system-config/question-pools', data);
    return response.data;
  },

  async updateQuestionPool(id: string, data: any) {
    const response = await api.put(`/super-admin/system-config/question-pools/${id}`, data);
    return response.data;
  },

  async deleteQuestionPool(id: string) {
    const response = await api.delete(`/super-admin/system-config/question-pools/${id}`);
    return response.data;
  },

  async addQuestionsToPool(poolId: string, questionIds: string[]) {
    const response = await api.post(
      `/super-admin/system-config/question-pools/${poolId}/questions`,
      { questionIds }
    );
    return response.data;
  },

  // System Certifications
  async getAllSystemCertifications(isActive?: boolean) {
    const response = await api.get('/super-admin/system-config/certifications', {
      params: { isActive },
    });
    return response.data;
  },

  async getSystemCertificationById(id: string) {
    const response = await api.get(`/super-admin/system-config/certifications/${id}`);
    return response.data;
  },

  async createSystemCertification(data: any) {
    const response = await api.post('/super-admin/system-config/certifications', data);
    return response.data;
  },

  async updateSystemCertification(id: string, data: any) {
    const response = await api.put(`/super-admin/system-config/certifications/${id}`, data);
    return response.data;
  },

  async deleteSystemCertification(id: string) {
    const response = await api.delete(`/super-admin/system-config/certifications/${id}`);
    return response.data;
  },

  // Pricing Plans
  async getAllPricingPlans(params?: { isActive?: boolean; isPublic?: boolean }) {
    const response = await api.get('/super-admin/system-config/pricing-plans', { params });
    return response.data;
  },

  async getPricingPlanById(id: string) {
    const response = await api.get(`/super-admin/system-config/pricing-plans/${id}`);
    return response.data;
  },

  async createPricingPlan(data: any) {
    const response = await api.post('/super-admin/system-config/pricing-plans', data);
    return response.data;
  },

  async updatePricingPlan(id: string, data: any) {
    const response = await api.put(`/super-admin/system-config/pricing-plans/${id}`, data);
    return response.data;
  },

  async deletePricingPlan(id: string) {
    const response = await api.delete(`/super-admin/system-config/pricing-plans/${id}`);
    return response.data;
  },
};

export default superAdminService;
