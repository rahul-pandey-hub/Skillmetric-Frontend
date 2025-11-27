import { create } from 'zustand';

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamSession {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'auto_submitted';
  startedAt?: Date;
  submittedAt?: Date;
  currentQuestionIndex: number;
  marksObtained?: number;
  totalQuestions: number;
  answeredQuestions: number;
  flaggedQuestions: number[];
  violations: number;
  proctoringEnabled: boolean;
  webcamStream?: boolean;
  screenShare?: boolean;
  tabSwitches: number;
}

interface ExamState {
  currentExam: Exam | null;
  exams: Exam[];
  sessions: ExamSession[];
  selectedSession: ExamSession | null;

  // Actions
  setCurrentExam: (exam: Exam | null) => void;
  setExams: (exams: Exam[]) => void;
  addExam: (exam: Exam) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Session actions
  setSessions: (sessions: ExamSession[]) => void;
  addSession: (session: ExamSession) => void;
  updateSession: (id: string, updates: Partial<ExamSession>) => void;
  removeSession: (id: string) => void;
  setSelectedSession: (session: ExamSession | null) => void;
}

export const useExamStore = create<ExamState>((set) => ({
  currentExam: null,
  exams: [],
  sessions: [],
  selectedSession: null,

  setCurrentExam: (exam) => set({ currentExam: exam }),

  setExams: (exams) => set({ exams }),

  addExam: (exam) => set((state) => ({ exams: [...state.exams, exam] })),

  updateExam: (id, updates) =>
    set((state) => ({
      exams: state.exams.map((exam) => (exam.id === id ? { ...exam, ...updates } : exam)),
      currentExam:
        state.currentExam?.id === id
          ? { ...state.currentExam, ...updates }
          : state.currentExam,
    })),

  deleteExam: (id) =>
    set((state) => ({
      exams: state.exams.filter((exam) => exam.id !== id),
      currentExam: state.currentExam?.id === id ? null : state.currentExam,
    })),

  // Session actions
  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),

  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === id ? { ...session, ...updates } : session
      ),
      selectedSession:
        state.selectedSession?.id === id
          ? { ...state.selectedSession, ...updates }
          : state.selectedSession,
    })),

  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((session) => session.id !== id),
      selectedSession:
        state.selectedSession?.id === id ? null : state.selectedSession,
    })),

  setSelectedSession: (session) => set({ selectedSession: session }),
}));
