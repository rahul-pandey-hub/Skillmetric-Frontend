import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance for org-admin endpoints
const orgAdminApi = axios.create({
  baseURL: `${API_URL}/org-admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
orgAdminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for auth errors
orgAdminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface OrganizationStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: Array<{ _id: string; count: number }>;
  };
  questions: {
    total: number;
    active: number;
    inactive: number;
  };
  departments: Array<{ _id: string; count: number }>;
}

export interface DashboardStats {
  totalUsers: number;
  totalExams: number;
  totalQuestions: number;
  activeExams: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  metadata?: {
    phone?: string;
    department?: string;
    batch?: string;
  };
  studentId?: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  department?: string;
  batch?: string;
}

export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const orgAdminService = {
  /**
   * Get organization overview statistics
   */
  getOrganizationStats: async (): Promise<OrganizationStats> => {
    const response = await orgAdminApi.get('/analytics/overview');
    return response.data;
  },

  /**
   * Get question bank analytics
   */
  getQuestionBankAnalytics: async () => {
    const response = await orgAdminApi.get('/analytics/question-bank');
    return response.data;
  },

  /**
   * Get department comparison
   */
  getDepartmentComparison: async () => {
    const response = await orgAdminApi.get('/analytics/departments');
    return response.data;
  },

  /**
   * Get batch comparison
   */
  getBatchComparison: async () => {
    const response = await orgAdminApi.get('/analytics/batches');
    return response.data;
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (days: number = 7) => {
    const response = await orgAdminApi.get('/analytics/recent-activity', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get user growth trend
   */
  getUserGrowthTrend: async (months: number = 6) => {
    const response = await orgAdminApi.get('/analytics/user-growth', {
      params: { months },
    });
    return response.data;
  },

  /**
   * Get all users with filters
   */
  getAllUsers: async (filters: UserFilters): Promise<UsersResponse> => {
    const params: any = {
      page: filters.page,
      limit: filters.limit,
    };

    // Only add role filter if it's not 'all'
    if (filters.role && filters.role !== 'all') {
      params.role = filters.role;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.department) {
      params.department = filters.department;
    }

    if (filters.batch) {
      params.batch = filters.batch;
    }

    const response = await orgAdminApi.get('/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    const response = await orgAdminApi.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Toggle user active status
   */
  toggleUserStatus: async (id: string): Promise<{ message: string; isActive: boolean }> => {
    const response = await orgAdminApi.patch(`/users/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await orgAdminApi.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Bulk create users
   */
  bulkCreateUsers: async (users: Array<{ name: string; email: string; role: string }>): Promise<{
    success: Array<{ email: string; name: string; user: any; temporaryPassword?: string }>;
    failed: Array<{ email: string; name: string; error: string }>;
  }> => {
    const response = await orgAdminApi.post('/users/bulk', { users });
    return response.data;
  },
};

export default orgAdminService;
