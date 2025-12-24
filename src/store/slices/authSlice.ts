import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STUDENT' | 'PROCTOR';
  studentId?: string;
  organizationId?: string; // Default/current organization
  organizationIds?: string[]; // All organizations user belongs to
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initializing: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
  initializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuthStart: (state) => {
      state.initializing = true;
    },
    initializeAuthSuccess: (state, action: PayloadAction<User>) => {
      state.initializing = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    initializeAuthFailure: (state) => {
      state.initializing = false;
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.initializing = false;
      localStorage.setItem('accessToken', action.payload.accessToken);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('accessToken');
    },
  },
});

export const {
  initializeAuthStart,
  initializeAuthSuccess,
  initializeAuthFailure,
  loginStart,
  loginSuccess,
  loginFailure,
  logout
} = authSlice.actions;
export default authSlice.reducer;
