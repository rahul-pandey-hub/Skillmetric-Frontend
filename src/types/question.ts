export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  FILL_BLANK = 'FILL_BLANK',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuestionMedia {
  image?: string;
  video?: string;
  audio?: string;
}

export interface Question {
  _id: string;
  text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  options: QuestionOption[];
  correctAnswer: any;
  explanation?: string;
  marks: number;
  negativeMarks: number;
  tags: string[];
  category?: string;
  media?: QuestionMedia;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDto {
  text: string;
  type: QuestionType;
  difficulty?: DifficultyLevel;
  options: QuestionOption[];
  correctAnswer: any;
  explanation?: string;
  marks: number;
  negativeMarks?: number;
  tags?: string[];
  category?: string;
  media?: QuestionMedia;
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {
  isActive?: boolean;
}

export interface QuestionFilters {
  type?: QuestionType;
  difficulty?: DifficultyLevel;
  category?: string;
  tags?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface QuestionsPaginationResponse {
  data: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QuestionStats {
  total: number;
  byType: Record<string, number>;
  byDifficulty: Record<string, number>;
  myQuestions: number;
}
