import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/auth/Login';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import LiveMonitoring from './pages/recruiter/LiveMonitoring';
import CreateExam from './pages/recruiter/CreateExam';
import ExamsList from './pages/recruiter/ExamsList';
import BulkEnrollment from './pages/recruiter/BulkEnrollment';

// Lazy load other pages for better performance
import { lazy, Suspense } from 'react';

const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Recruiter Routes */}
            <Route
              path="/recruiter"
              element={<ProtectedRoute allowedRoles={['RECRUITER', 'ORG_ADMIN']} />}
            >
              <Route index element={<RecruiterDashboard />} />
              <Route path="exams" element={<ExamsList />} />
              <Route path="create-exam" element={<CreateExam />} />
              <Route path="bulk-enrollment" element={<BulkEnrollment />} />
              <Route path="monitoring" element={<LiveMonitoring />} />
              <Route path="monitoring/:examId" element={<LiveMonitoring />} />
              {/* Add more recruiter routes here */}
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route index element={<StudentDashboard />} />
              {/* Add more student routes here */}
            </Route>
          </Route>
        </Route>

        {/* Default Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate
                to={
                  user?.role === 'STUDENT'
                    ? '/student'
                    : user?.role === 'RECRUITER' || user?.role === 'ORG_ADMIN'
                    ? '/recruiter'
                    : '/'
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
