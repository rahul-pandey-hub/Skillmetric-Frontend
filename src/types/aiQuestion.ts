import { QuestionType, DifficultyLevel } from './question';

// Re-export types from question.ts for convenience
export { QuestionType, DifficultyLevel };

// Define QuestionOption locally to avoid circular dependency issues
export interface QuestionOption {
  id?: string;
  text: string;
  isCorrect?: boolean;
}

export enum QuestionCategory {
  DSA = 'DSA',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
  APTITUDE = 'APTITUDE',
  VERBAL = 'VERBAL',
  LOGICAL_REASONING = 'LOGICAL_REASONING',
  PROGRAMMING = 'PROGRAMMING',
  DATABASE = 'DATABASE',
  NETWORKING = 'NETWORKING',
  OS = 'OS',
  DEVOPS = 'DEVOPS',
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  TESTING = 'TESTING',
  SECURITY = 'SECURITY',
  SOFT_SKILLS = 'SOFT_SKILLS',
}

export enum GenerationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
}

export enum AIProvider {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
}

// AI Generation Request DTO
export interface AIGenerationRequest {
  mainTopic: QuestionCategory;
  subTopic: string;
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
  questionTypes: QuestionType[];
  marksPerQuestion: number;
  additionalInstructions?: string;
  includeNegativeMarking: boolean;
  negativeMarks?: number;
  includeExplanations: boolean;
  includeHints: boolean;
  estimatedTime: number;
  tags?: string[];
}

// AI Metadata
export interface AIMetadata {
  model: string;
  promptVersion: string;
  confidence?: number;
  generationTime?: number;
  tokensUsed?: number;
  batchIndex?: number;
  regenerated?: boolean;
  originalQuestionId?: string;
}

// Generated Question (temporary, before saving)
export interface AIGeneratedQuestion {
  tempId: string;
  text: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  category: QuestionCategory;
  subcategory: string;
  topic?: string;
  options?: QuestionOption[];
  correctAnswer: any;
  explanation?: string;
  hints?: string[];
  marks: number;
  negativeMarks?: number;
  estimatedTime: number;
  tags?: string[];
  codingDetails?: any;
  aiMetadata: AIMetadata;
  generatedAt: Date;
}

// Generation Response
export interface AIGenerationResponse {
  generationId: string;
  status: GenerationStatus;
  questions: AIGeneratedQuestion[];
  metadata: {
    requested: number;
    generated: number;
    failed: number;
    totalTime: number;
    cost?: number;
  };
  errors?: {
    questionIndex: number;
    error: string;
  }[];
}

// Generation History Record
export interface AIGeneration {
  _id: string;
  mainTopic: QuestionCategory;
  subTopic: string;
  difficulty: DifficultyLevel;
  numberOfQuestions: number;
  questionTypes: QuestionType[];
  marksPerQuestion: number;
  additionalInstructions?: string;
  includeNegativeMarking: boolean;
  negativeMarks?: number;
  includeExplanations: boolean;
  includeHints: boolean;
  estimatedTime: number;
  tags?: string[];

  aiProvider: AIProvider;
  aiModel: string;
  promptVersion: string;

  status: GenerationStatus;
  generatedQuestions: AIGeneratedQuestion[];
  requestedCount: number;
  generatedCount: number;
  failedCount: number;
  errors?: {
    questionIndex: number;
    error: string;
    timestamp: Date;
  }[];

  totalGenerationTime?: number;
  apiCost?: number;
  tokensUsed?: number;

  savedQuestions?: string[];
  savedAt?: Date;

  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Save Options
export interface SaveOptions {
  addToQuestionPool?: boolean;
  questionPoolId?: string;
  markAsPublic?: boolean;
  additionalTags?: string[];
  customMetadata?: Record<string, any>;
}

// Save Request
export interface SaveQuestionsRequest {
  questionIds: string[];
  options?: SaveOptions;
}

// Save Response
export interface SaveQuestionsResponse {
  savedCount: number;
  questionIds: string[];
  questionPoolId?: string;
}

// Regenerate Request
export interface RegenerateQuestionRequest {
  questionIndex: number;
  additionalInstructions?: string;
}

// History Filters
export interface GenerationHistoryFilters {
  page?: number;
  limit?: number;
  status?: GenerationStatus;
  topic?: QuestionCategory;
}

// History Response
export interface GenerationHistoryResponse {
  data: AIGeneration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Usage Stats
export interface UsageStats {
  totalGenerations: number;
  totalQuestions: number;
  totalCost: number;
  totalTime: number;
  totalTokens: number;
  averageQuestionsPerGeneration: number;
}

// Topic/Subtopic Mapping
export interface TopicSubtopics {
  [key: string]: string[];
}

export const TOPIC_SUBTOPICS: TopicSubtopics = {
  [QuestionCategory.PROGRAMMING]: [
    'JavaScript',
    'Python',
    'Java',
    'C++',
    'C#',
    'Go',
    'Rust',
    'TypeScript',
    'PHP',
    'Ruby',
  ],
  [QuestionCategory.DSA]: [
    'Arrays',
    'Linked Lists',
    'Trees',
    'Graphs',
    'Sorting',
    'Searching',
    'Dynamic Programming',
    'Greedy Algorithms',
    'Backtracking',
    'Bit Manipulation',
  ],
  [QuestionCategory.DATABASE]: [
    'SQL',
    'NoSQL',
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'Database Design',
    'Indexing',
    'Transactions',
    'Normalization',
  ],
  [QuestionCategory.FRONTEND]: [
    'React',
    'Vue',
    'Angular',
    'HTML/CSS',
    'JavaScript',
    'TypeScript',
    'State Management',
    'Performance',
    'Accessibility',
    'Responsive Design',
  ],
  [QuestionCategory.BACKEND]: [
    'Node.js',
    'Express',
    'NestJS',
    'Django',
    'Flask',
    'Spring Boot',
    'RESTful APIs',
    'GraphQL',
    'Microservices',
    'Authentication',
  ],
  [QuestionCategory.SYSTEM_DESIGN]: [
    'Scalability',
    'Load Balancing',
    'Caching',
    'Database Sharding',
    'Microservices',
    'API Design',
    'Distributed Systems',
    'Message Queues',
    'CDN',
    'High Availability',
  ],
  [QuestionCategory.DEVOPS]: [
    'Docker',
    'Kubernetes',
    'CI/CD',
    'AWS',
    'Azure',
    'GCP',
    'Linux',
    'Monitoring',
    'Infrastructure as Code',
    'GitOps',
  ],
  [QuestionCategory.TESTING]: [
    'Unit Testing',
    'Integration Testing',
    'E2E Testing',
    'Test Automation',
    'Jest',
    'Cypress',
    'Selenium',
    'Test Coverage',
    'TDD',
    'BDD',
  ],
  [QuestionCategory.SECURITY]: [
    'Authentication',
    'Authorization',
    'Encryption',
    'OWASP Top 10',
    'SQL Injection',
    'XSS',
    'CSRF',
    'Security Best Practices',
    'Penetration Testing',
    'Secure Coding',
  ],
  [QuestionCategory.NETWORKING]: [
    'TCP/IP',
    'HTTP/HTTPS',
    'DNS',
    'Load Balancing',
    'Firewalls',
    'VPN',
    'Network Protocols',
    'OSI Model',
    'Subnetting',
    'Network Security',
  ],
  [QuestionCategory.OS]: [
    'Process Management',
    'Memory Management',
    'File Systems',
    'Concurrency',
    'Synchronization',
    'Deadlocks',
    'Scheduling',
    'Virtual Memory',
    'Linux Commands',
    'Shell Scripting',
  ],
  [QuestionCategory.APTITUDE]: [
    'Quantitative Aptitude',
    'Logical Reasoning',
    'Data Interpretation',
    'Number Series',
    'Percentages',
    'Probability',
    'Permutation & Combination',
    'Time & Work',
    'Speed & Distance',
    'Profit & Loss',
  ],
  [QuestionCategory.VERBAL]: [
    'Reading Comprehension',
    'Grammar',
    'Vocabulary',
    'Sentence Completion',
    'Synonyms & Antonyms',
    'Analogies',
    'Error Detection',
    'Fill in the Blanks',
    'Para Jumbles',
    'Critical Reasoning',
  ],
  [QuestionCategory.LOGICAL_REASONING]: [
    'Puzzles',
    'Blood Relations',
    'Seating Arrangement',
    'Syllogism',
    'Coding-Decoding',
    'Direction Sense',
    'Series',
    'Venn Diagrams',
    'Clocks & Calendars',
    'Data Sufficiency',
  ],
  [QuestionCategory.SOFT_SKILLS]: [
    'Communication',
    'Teamwork',
    'Leadership',
    'Problem Solving',
    'Time Management',
    'Adaptability',
    'Conflict Resolution',
    'Critical Thinking',
    'Decision Making',
    'Emotional Intelligence',
  ],
};
