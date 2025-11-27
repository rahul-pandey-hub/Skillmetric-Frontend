export interface Exam {
  _id: string;
  title: string;
  code: string;
  description?: string;
  duration: number;
  status: ExamStatus;
  createdBy: string | {
    _id: string;
    name: string;
    email: string;
  };
  questions: string[] | Question[];
  enrolledStudents: string[];
  proctoringSettings: ProctoringSettings;
  schedule: Schedule;
  grading: Grading;
  settings: ExamSettings;
  createdAt?: string;
  updatedAt?: string;
}

export enum ExamStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface ProctoringSettings {
  enabled: boolean;
  violationWarningLimit: number;
  webcamRequired: boolean;
  screenRecording: boolean;
  tabSwitchDetection: boolean;
  copyPasteDetection: boolean;
  rightClickDisabled: boolean;
  devToolsDetection: boolean;
  fullscreenRequired: boolean;
  autoSubmitOnViolation: boolean;
}

export interface Schedule {
  startDate: string;
  endDate: string;
  lateSubmissionAllowed: boolean;
}

export interface Grading {
  totalMarks: number;
  passingMarks: number;
  negativeMarking: boolean;
  negativeMarkValue?: number;
}

export interface ExamSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
  allowReview: boolean;
  attemptsAllowed: number;
}

export interface Question {
  _id: string;
  questionText: string;
  type: string;
  difficulty: string;
  marks: number;
}

export interface CreateExamDto {
  title: string;
  code: string;
  description?: string;
  duration: number;
  status?: ExamStatus;
  proctoringSettings: ProctoringSettings;
  schedule: Schedule;
  grading: Grading;
  settings: ExamSettings;
  questions?: string[];
  enrolledStudents?: string[];
}

export interface AddQuestionsDto {
  questionIds: string[];
}

export interface RemoveQuestionsDto {
  questionIds: string[];
}

export interface ExamsResponse {
  data: Exam[];
  total: number;
}
