import api from './api';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionFilters,
  QuestionsPaginationResponse,
  Question,
  QuestionStats,
} from '../types/question';
import { AxiosResponse } from 'axios';

export const questionsService = {
  /**
   * Create a new question
   */
  createQuestion: async (
    questionData: CreateQuestionDto
  ): Promise<AxiosResponse<Question>> => {
    return api.post('/questions', questionData);
  },

  /**
   * Get all questions with optional filters and pagination
   */
  getAllQuestions: async (
    filters?: QuestionFilters
  ): Promise<AxiosResponse<QuestionsPaginationResponse>> => {
    return api.get('/questions', { params: filters });
  },

  /**
   * Get a single question by ID
   */
  getQuestionById: async (id: string): Promise<AxiosResponse<Question>> => {
    return api.get(`/questions/${id}`);
  },

  /**
   * Update an existing question
   */
  updateQuestion: async (
    id: string,
    data: UpdateQuestionDto
  ): Promise<AxiosResponse<Question>> => {
    return api.put(`/questions/${id}`, data);
  },

  /**
   * Delete a question (soft delete)
   */
  deleteQuestion: async (
    id: string
  ): Promise<AxiosResponse<{ message: string; id: string }>> => {
    return api.delete(`/questions/${id}`);
  },

  /**
   * Get question statistics
   */
  getQuestionStats: async (): Promise<AxiosResponse<QuestionStats>> => {
    return api.get('/questions/stats/summary');
  },
};

export default questionsService;
