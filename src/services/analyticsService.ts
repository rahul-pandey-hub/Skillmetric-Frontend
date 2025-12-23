import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const analyticsApi = axios.create({
  baseURL: `${API_URL}/analytics`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
analyticsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ExamAnalytics {
  examId: string;
  examTitle: string;
  examCode: string;
  status: string;
  participation: {
    totalEnrolled: number;
    totalStarted: number;
    totalSubmitted: number;
    totalInProgress: number;
    completionRate: number;
    noShowRate: number;
  };
  scores: {
    totalResults: number;
    averageScore: number;
    medianScore: number;
    highestScore: number;
    lowestScore: number;
    standardDeviation: number;
    averagePercentage: number;
    medianPercentage: number;
    scoreRanges: Array<{ range: string; count: number }>;
    percentageRanges: Array<{ range: string; count: number }>;
  };
  passFailStats: {
    totalPassed: number;
    totalFailed: number;
    passRate: number;
    failRate: number;
  };
  timeStats: {
    totalSubmissions: number;
    averageDuration: number;
    medianDuration: number;
    fastestCompletion: number;
    slowestCompletion: number;
    durationRanges: Array<{ range: string; count: number }>;
  };
  shortlisting: {
    enabled: boolean;
    totalShortlisted: number;
    shortlistingRate: number;
    averageScoreShortlisted: number;
    averageScoreNotShortlisted: number;
  };
  violations: {
    totalSessions: number;
    sessionsWithViolations: number;
    totalViolations: number;
    violationTypes: Record<string, number>;
    violationRate: number;
  };
  generatedAt: Date;
}

export interface QuestionAnalytics {
  examId: string;
  totalQuestions: number;
  questions: Array<{
    questionId: string;
    questionText: string;
    questionType: string;
    category: string;
    difficulty: string;
    totalAttempts: number;
    correctAttempts: number;
    wrongAttempts: number;
    unanswered: number;
    successRate: number;
    averageTime: number;
    difficultyIndex: number;
    optionSelections: Record<string, number>;
    problematic: boolean;
    problematicReason: string;
  }>;
  generatedAt: Date;
}

export interface CategoryAnalytics {
  examId: string;
  categories: Array<{
    category: string;
    totalQuestions: number;
    averageScore: number;
    medianScore: number;
    averageAccuracy: number;
    highestScore: number;
    lowestScore: number;
    totalStudents: number;
  }>;
  weakAreas: string[];
  generatedAt: Date;
}

export interface CompleteAnalytics {
  exam: ExamAnalytics;
  questions: QuestionAnalytics;
  categories: CategoryAnalytics;
  generatedAt: Date;
}

/**
 * Get exam-level analytics
 */
export const getExamAnalytics = async (examId: string): Promise<ExamAnalytics> => {
  const response = await analyticsApi.get(`/exams/${examId}`);
  return response.data;
};

/**
 * Get question-level analytics
 */
export const getQuestionAnalytics = async (examId: string): Promise<QuestionAnalytics> => {
  const response = await analyticsApi.get(`/exams/${examId}/questions`);
  return response.data;
};

/**
 * Get category-wise analytics
 */
export const getCategoryAnalytics = async (examId: string): Promise<CategoryAnalytics> => {
  const response = await analyticsApi.get(`/exams/${examId}/categories`);
  return response.data;
};

/**
 * Get complete analytics (all in one)
 */
export const getCompleteAnalytics = async (examId: string): Promise<CompleteAnalytics> => {
  const response = await analyticsApi.get(`/exams/${examId}/complete`);
  return response.data;
};

export default {
  getExamAnalytics,
  getQuestionAnalytics,
  getCategoryAnalytics,
  getCompleteAnalytics,
};
