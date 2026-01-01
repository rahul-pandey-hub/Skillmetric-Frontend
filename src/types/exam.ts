export interface Exam {
  _id: string;
  title: string;
  code: string;
  description?: string;
  duration: number;
  status: ExamStatus;
  category?: ExamCategory;
  accessMode?: ExamAccessMode;
  organizationId?: string;
  createdBy: string | {
    _id: string;
    name: string;
    email: string;
  };
  questions: string[] | Question[];
  enrolledCandidates: string[];
  proctoringSettings: ProctoringSettings;
  schedule: Schedule;
  grading: Grading;
  settings: ExamSettings;
  invitationSettings?: InvitationSettings;
  recruitmentResultSettings?: RecruitmentResultSettings;
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
  enrolledCandidates?: string[];
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

export enum ExamCategory {
  INTERNAL_ASSESSMENT = 'INTERNAL_ASSESSMENT',
  RECRUITMENT = 'RECRUITMENT',
  GENERAL_ASSESSMENT = 'GENERAL_ASSESSMENT',
}

export enum ExamAccessMode {
  ENROLLMENT_BASED = 'ENROLLMENT_BASED',
  INVITATION_BASED = 'INVITATION_BASED',
  HYBRID = 'HYBRID',
}

export interface InvitationSettings {
  linkValidityDays: number;
  allowMultipleAccess: boolean;
  maxAccessCount: number;
  autoExpireOnSubmit: boolean;
  sendReminderEmails: boolean;
  reminderBeforeDays: number;
}

export interface RecruitmentResultSettings {
  showScoreToCandidate: boolean;
  showRankToCandidate: boolean;
  showOnlyConfirmation: boolean;
  candidateResultMessage?: string;
  recruiterCanExport: boolean;
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCESSED = 'ACCESSED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export interface ExamInvitation {
  _id: string;
  invitationToken: string;
  examId: string | Exam;
  organizationId: string;
  candidateEmail: string;
  candidateName: string;
  candidatePhone?: string;
  status: InvitationStatus;
  expiresAt: string;
  accessCount: number;
  sessionId?: string;
  resultId?: string;
  invitedBy: string;
  invitationNote?: string;
  firstAccessedAt?: string;
  examStartedAt?: string;
  examCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendInvitationsDto {
  candidates: Array<{
    email: string;
    name: string;
    phone?: string;
  }>;
  invitationNote?: string;
  validityDays?: number;
}

export interface InvitationResponse {
  valid: boolean;
  exam: {
    title: string;
    description?: string;
    duration: number;
    totalQuestions: number;
  };
  candidate: {
    name: string;
    email: string;
  };
  expiresAt: string;
  status: InvitationStatus;
  canStart: boolean;
}

export interface RecruitmentResult {
  invitationId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  status: InvitationStatus;
  score?: number;
  percentage?: number;
  rank?: number;
  submittedAt?: string;
  shortlisted?: boolean;
}

export interface RecruitmentResultsResponse {
  data: RecruitmentResult[];
  total: number;
  stats: {
    totalInvited: number;
    completed: number;
    pending: number;
    expired: number;
    averageScore?: number;
  };
}
