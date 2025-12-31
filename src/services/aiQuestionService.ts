import api from './api';
import {
  AIGenerationRequest,
  AIGenerationResponse,
  SaveQuestionsRequest,
  SaveQuestionsResponse,
  RegenerateQuestionRequest,
  GenerationHistoryFilters,
  GenerationHistoryResponse,
  AIGeneration,
  UsageStats,
} from '../types/aiQuestion';

class AIQuestionService {
  private readonly BASE_URL = '/ai-questions';

  /**
   * Generate questions using AI
   */
  async generateQuestions(
    request: AIGenerationRequest
  ): Promise<AIGenerationResponse> {
    const response = await api.post(`${this.BASE_URL}/generate`, request);
    return response.data.data;
  }

  /**
   * Save approved questions to question bank
   */
  async saveQuestions(
    generationId: string,
    request: SaveQuestionsRequest
  ): Promise<SaveQuestionsResponse> {
    const response = await api.post(
      `${this.BASE_URL}/${generationId}/save`,
      request
    );
    return response.data.data;
  }

  /**
   * Regenerate a specific question
   */
  async regenerateQuestion(
    generationId: string,
    questionIndex: number,
    request?: RegenerateQuestionRequest
  ): Promise<any> {
    const response = await api.post(
      `${this.BASE_URL}/${generationId}/regenerate/${questionIndex}`,
      request || {}
    );
    return response.data.data.question;
  }

  /**
   * Get generation history
   */
  async getGenerationHistory(
    filters?: GenerationHistoryFilters
  ): Promise<GenerationHistoryResponse> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.topic) params.append('topic', filters.topic);

    const response = await api.get(
      `${this.BASE_URL}/history?${params.toString()}`
    );

    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  /**
   * Get single generation by ID
   */
  async getGenerationById(generationId: string): Promise<AIGeneration> {
    const response = await api.get(`${this.BASE_URL}/${generationId}`);
    return response.data.data;
  }

  /**
   * Retry failed generation
   */
  async retryGeneration(generationId: string): Promise<AIGenerationResponse> {
    const response = await api.post(`${this.BASE_URL}/${generationId}/retry`);
    return response.data.data;
  }

  /**
   * Delete generation record
   */
  async deleteGeneration(generationId: string): Promise<void> {
    await api.delete(`${this.BASE_URL}/${generationId}`);
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(
    startDate?: string,
    endDate?: string
  ): Promise<UsageStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(
      `${this.BASE_URL}/stats/usage?${params.toString()}`
    );
    return response.data.data;
  }
}

export default new AIQuestionService();
