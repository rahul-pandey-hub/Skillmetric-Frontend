import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question, QuestionFilters } from '../../types/question';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface QuestionsState {
  questions: Question[];
  currentQuestion: Question | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: QuestionFilters;
}

const initialState: QuestionsState = {
  questions: [],
  currentQuestion: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 10,
  },
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentQuestion: (state, action: PayloadAction<Question | null>) => {
      state.currentQuestion = action.payload;
      state.loading = false;
      state.error = null;
    },
    addQuestion: (state, action: PayloadAction<Question>) => {
      state.questions.unshift(action.payload);
      state.pagination.total += 1;
    },
    updateQuestion: (state, action: PayloadAction<Question>) => {
      const index = state.questions.findIndex(
        (q) => q._id === action.payload._id
      );
      if (index !== -1) {
        state.questions[index] = action.payload;
      }
      if (state.currentQuestion?._id === action.payload._id) {
        state.currentQuestion = action.payload;
      }
    },
    removeQuestion: (state, action: PayloadAction<string>) => {
      state.questions = state.questions.filter((q) => q._id !== action.payload);
      state.pagination.total -= 1;
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
    setFilters: (state, action: PayloadAction<QuestionFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetFilters: (state) => {
      state.filters = { page: 1, limit: 10 };
    },
    resetQuestions: (state) => {
      state.questions = [];
      state.currentQuestion = null;
      state.loading = false;
      state.error = null;
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
    },
  },
});

export const {
  setQuestions,
  setCurrentQuestion,
  addQuestion,
  updateQuestion,
  removeQuestion,
  setPagination,
  setFilters,
  setLoading,
  setError,
  resetFilters,
  resetQuestions,
} = questionsSlice.actions;

export default questionsSlice.reducer;
