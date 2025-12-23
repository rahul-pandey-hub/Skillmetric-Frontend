import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const poolApi = axios.create({
  baseURL: `${API_URL}/question-pools`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
poolApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface QuestionPool {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  difficulty?: string;
  questions: string[];
  organizationId?: string;
  createdBy: string;
  isActive: boolean;
  isPublic: boolean;
  tags: string[];
  stats: {
    totalQuestions: number;
    usageCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PoolStats {
  poolId: string;
  poolName: string;
  totalQuestions: number;
  usageCount: number;
  categoryBreakdown: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
  isActive: boolean;
  isPublic: boolean;
}

export interface SelectionResult {
  poolId: string;
  poolName: string;
  selectedQuestions: string[];
  requestedCount: number;
  actualCount: number;
}

/**
 * Get all question pools
 */
export const getQuestionPools = async (params?: {
  category?: string;
  difficulty?: string;
  organizationId?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ data: QuestionPool[]; pagination: any }> => {
  const response = await poolApi.get('/', { params });
  return response.data;
};

/**
 * Get single question pool
 */
export const getQuestionPool = async (poolId: string): Promise<QuestionPool> => {
  const response = await poolApi.get(`/${poolId}`);
  return response.data.data;
};

/**
 * Create question pool
 */
export const createQuestionPool = async (data: {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  difficulty?: string;
  questions?: string[];
  isPublic?: boolean;
  tags?: string[];
}): Promise<QuestionPool> => {
  const response = await poolApi.post('/', data);
  return response.data.data;
};

/**
 * Update question pool
 */
export const updateQuestionPool = async (
  poolId: string,
  data: Partial<QuestionPool>,
): Promise<QuestionPool> => {
  const response = await poolApi.put(`/${poolId}`, data);
  return response.data.data;
};

/**
 * Delete (deactivate) question pool
 */
export const deleteQuestionPool = async (poolId: string): Promise<void> => {
  await poolApi.delete(`/${poolId}`);
};

/**
 * Add questions to pool
 */
export const addQuestionsToPool = async (
  poolId: string,
  questionIds: string[],
): Promise<QuestionPool> => {
  const response = await poolApi.post(`/${poolId}/questions`, { questionIds });
  return response.data.data;
};

/**
 * Remove question from pool
 */
export const removeQuestionFromPool = async (
  poolId: string,
  questionId: string,
): Promise<void> => {
  await poolApi.delete(`/${poolId}/questions/${questionId}`);
};

/**
 * Select random questions from pool
 */
export const selectQuestionsFromPool = async (
  poolId: string,
  config: {
    questionsToSelect: number;
    category?: string;
    difficulty?: string;
    excludeQuestions?: string[];
  },
): Promise<SelectionResult> => {
  const response = await poolApi.post(`/${poolId}/select`, config);
  return response.data.data;
};

/**
 * Get pool statistics
 */
export const getPoolStats = async (poolId: string): Promise<PoolStats> => {
  const response = await poolApi.get(`/${poolId}/stats`);
  return response.data.data;
};

/**
 * Validate pool configuration
 */
export const validatePoolConfiguration = async (poolConfigs: Array<{
  poolId: string;
  questionsToSelect: number;
  category?: string;
  difficulty?: string;
}>): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> => {
  const response = await poolApi.post('/validate-configuration', { poolConfigs });
  return response.data.data;
};

export default {
  getQuestionPools,
  getQuestionPool,
  createQuestionPool,
  updateQuestionPool,
  deleteQuestionPool,
  addQuestionsToPool,
  removeQuestionFromPool,
  selectQuestionsFromPool,
  getPoolStats,
  validatePoolConfiguration,
};
