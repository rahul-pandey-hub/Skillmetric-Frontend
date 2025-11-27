import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExamState {
  currentExam: any | null;
  sessionId: string | null;
  warningCount: number;
  maxWarnings: number;
  isSubmitted: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: ExamState = {
  currentExam: null,
  sessionId: null,
  warningCount: 0,
  maxWarnings: 3,
  isSubmitted: false,
  loading: false,
  error: null,
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    setCurrentExam: (state, action: PayloadAction<any>) => {
      state.currentExam = action.payload;
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    incrementWarning: (state) => {
      state.warningCount += 1;
    },
    setWarningCount: (state, action: PayloadAction<number>) => {
      state.warningCount = action.payload;
    },
    setMaxWarnings: (state, action: PayloadAction<number>) => {
      state.maxWarnings = action.payload;
    },
    setSubmitted: (state, action: PayloadAction<boolean>) => {
      state.isSubmitted = action.payload;
    },
    resetExam: (state) => {
      state.currentExam = null;
      state.sessionId = null;
      state.warningCount = 0;
      state.isSubmitted = false;
    },
  },
});

export const {
  setCurrentExam,
  setSessionId,
  incrementWarning,
  setWarningCount,
  setMaxWarnings,
  setSubmitted,
  resetExam,
} = examSlice.actions;

export default examSlice.reducer;
