import { create } from 'zustand';
import {
  AIGenerationRequest,
  AIGenerationResponse,
  AIGeneratedQuestion,
  SaveOptions,
  GenerationStatus,
} from '../types/aiQuestion';
import aiQuestionService from '../services/aiQuestionService';

interface AIGenerationStore {
  // Current generation state
  generationId: string | null;
  status: GenerationStatus | null;
  questions: AIGeneratedQuestion[];
  selectedQuestionIds: Set<string>;
  isGenerating: boolean;
  isSaving: boolean;
  error: string | null;

  // Generation metadata
  metadata: {
    requested: number;
    generated: number;
    failed: number;
    totalTime: number;
    cost?: number;
  } | null;

  // Form data (for retry)
  lastRequest: AIGenerationRequest | null;

  // Actions
  generateQuestions: (request: AIGenerationRequest) => Promise<void>;
  regenerateQuestion: (questionIndex: number, additionalInstructions?: string) => Promise<void>;
  saveQuestions: (options?: SaveOptions) => Promise<void>;

  toggleQuestionSelection: (questionId: string) => void;
  selectAllQuestions: () => void;
  deselectAllQuestions: () => void;
  deleteQuestion: (questionId: string) => void;
  updateQuestion: (questionId: string, updates: Partial<AIGeneratedQuestion>) => void;

  resetGeneration: () => void;
  setError: (error: string | null) => void;
}

export const useAIGenerationStore = create<AIGenerationStore>((set, get) => ({
  // Initial state
  generationId: null,
  status: null,
  questions: [],
  selectedQuestionIds: new Set(),
  isGenerating: false,
  isSaving: false,
  error: null,
  metadata: null,
  lastRequest: null,

  // Generate questions
  generateQuestions: async (request: AIGenerationRequest) => {
    set({ isGenerating: true, error: null, lastRequest: request });

    try {
      const response: AIGenerationResponse = await aiQuestionService.generateQuestions(request);

      set({
        generationId: response.generationId,
        status: response.status,
        questions: response.questions,
        metadata: response.metadata,
        isGenerating: false,
        // Auto-select all questions
        selectedQuestionIds: new Set(response.questions.map(q => q.tempId)),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to generate questions',
        isGenerating: false,
      });
      throw error;
    }
  },

  // Regenerate a specific question
  regenerateQuestion: async (questionIndex: number, additionalInstructions?: string) => {
    const { generationId, questions } = get();
    if (!generationId) return;

    set({ isGenerating: true, error: null });

    try {
      const regeneratedQuestion = await aiQuestionService.regenerateQuestion(
        generationId,
        questionIndex,
        additionalInstructions ? { questionIndex, additionalInstructions } : undefined
      );

      // Update the question in the list
      const updatedQuestions = [...questions];
      updatedQuestions[questionIndex] = regeneratedQuestion;

      set({
        questions: updatedQuestions,
        isGenerating: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to regenerate question',
        isGenerating: false,
      });
      throw error;
    }
  },

  // Save questions to question bank
  saveQuestions: async (options?: SaveOptions) => {
    const { generationId, selectedQuestionIds } = get();
    if (!generationId || selectedQuestionIds.size === 0) {
      set({ error: 'No questions selected to save' });
      return;
    }

    set({ isSaving: true, error: null });

    try {
      await aiQuestionService.saveQuestions(generationId, {
        questionIds: Array.from(selectedQuestionIds),
        options,
      });

      set({
        isSaving: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to save questions',
        isSaving: false,
      });
      throw error;
    }
  },

  // Toggle question selection
  toggleQuestionSelection: (questionId: string) => {
    set((state) => {
      const newSet = new Set(state.selectedQuestionIds);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return { selectedQuestionIds: newSet };
    });
  },

  // Select all questions
  selectAllQuestions: () => {
    set((state) => ({
      selectedQuestionIds: new Set(state.questions.map(q => q.tempId)),
    }));
  },

  // Deselect all questions
  deselectAllQuestions: () => {
    set({ selectedQuestionIds: new Set() });
  },

  // Delete question
  deleteQuestion: (questionId: string) => {
    set((state) => {
      const newQuestions = state.questions.filter(q => q.tempId !== questionId);
      const newSelectedIds = new Set(state.selectedQuestionIds);
      newSelectedIds.delete(questionId);

      return {
        questions: newQuestions,
        selectedQuestionIds: newSelectedIds,
      };
    });
  },

  // Update question
  updateQuestion: (questionId: string, updates: Partial<AIGeneratedQuestion>) => {
    set((state) => ({
      questions: state.questions.map(q =>
        q.tempId === questionId ? { ...q, ...updates } : q
      ),
    }));
  },

  // Reset generation
  resetGeneration: () => {
    set({
      generationId: null,
      status: null,
      questions: [],
      selectedQuestionIds: new Set(),
      error: null,
      metadata: null,
    });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));
