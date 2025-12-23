import axios from 'axios';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionFilters,
  Question,
} from '../types/question';
import { AxiosResponse } from 'axios';

// Create a separate axios instance for org-admin endpoints
const orgAdminApi = axios.create({
  baseURL: '/api/v1/org-admin',
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

interface OrgAdminQuestionResponse {
  data: Question[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const orgAdminQuestionsService = {
  /**
   * Create a new question (org-admin endpoint)
   */
  createQuestion: async (
    questionData: CreateQuestionDto
  ): Promise<AxiosResponse<Question>> => {
    return orgAdminApi.post('/questions', questionData);
  },

  /**
   * Get all questions for the organization with optional filters and pagination
   */
  getAllQuestions: async (
    filters?: QuestionFilters
  ): Promise<AxiosResponse<OrgAdminQuestionResponse>> => {
    return orgAdminApi.get('/questions', { params: filters });
  },

  /**
   * Get a single question by ID (organization-scoped)
   */
  getQuestionById: async (id: string): Promise<AxiosResponse<Question>> => {
    return orgAdminApi.get(`/questions/${id}`);
  },

  /**
   * Update an existing question (organization-scoped)
   */
  updateQuestion: async (
    id: string,
    data: UpdateQuestionDto
  ): Promise<AxiosResponse<Question>> => {
    return orgAdminApi.put(`/questions/${id}`, data);
  },

  /**
   * Delete a question (organization-scoped)
   */
  deleteQuestion: async (
    id: string
  ): Promise<AxiosResponse<{ message: string; id: string }>> => {
    return orgAdminApi.delete(`/questions/${id}`);
  },

  /**
   * Toggle question active status
   */
  toggleQuestionStatus: async (
    id: string
  ): Promise<AxiosResponse<Question>> => {
    return orgAdminApi.patch(`/questions/${id}/toggle-status`);
  },

  /**
   * Get question statistics for the organization
   */
  getQuestionStatistics: async (): Promise<AxiosResponse<any>> => {
    return orgAdminApi.get('/questions/statistics');
  },

  /**
   * Bulk create questions
   */
  bulkCreateQuestions: async (
    questions: CreateQuestionDto[]
  ): Promise<AxiosResponse<any>> => {
    return orgAdminApi.post('/questions/bulk', { questions });
  },
};

export default orgAdminQuestionsService;
