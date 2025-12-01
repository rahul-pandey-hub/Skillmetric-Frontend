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

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const OrganizationsList = lazy(() => import('./pages/SuperAdmin/OrganizationsList'));
const CreateOrganization = lazy(() => import('./pages/SuperAdmin/CreateOrganization'));
const OrganizationDetails = lazy(() => import('./pages/SuperAdmin/OrganizationDetails'));
const EditOrganization = lazy(() => import('./pages/SuperAdmin/EditOrganization'));
const SystemConfig = lazy(() => import('./pages/SuperAdmin/SystemConfig'));
const Analytics = lazy(() => import('./pages/SuperAdmin/Analytics'));

// Organization Admin Pages
const OrgAdminDashboard = lazy(() => import('./pages/OrgAdmin/OrgAdminDashboard'));
const UsersList = lazy(() => import('./pages/OrgAdmin/UsersList'));
const AddUser = lazy(() => import('./pages/OrgAdmin/AddUser'));
const BulkUserUpload = lazy(() => import('./pages/OrgAdmin/BulkUserUpload'));
const QuestionsList = lazy(() => import('./pages/OrgAdmin/QuestionsList'));
const CreateQuestion = lazy(() => import('./pages/OrgAdmin/CreateQuestion'));
const OrgAnalytics = lazy(() => import('./pages/OrgAdmin/OrgAnalytics'));
const OrgSettings = lazy(() => import('./pages/OrgAdmin/OrgSettings'));

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
            </Route>

            {/* Organization Admin Routes */}
            <Route
              path="/org-admin"
              element={<ProtectedRoute allowedRoles={['ORG_ADMIN']} />}
            >
              <Route index element={<OrgAdminDashboard />} />
              {/* User Management */}
              <Route path="users" element={<UsersList />} />
              <Route path="users/add" element={<AddUser />} />
              <Route path="users/bulk-upload" element={<BulkUserUpload />} />
              {/* Question Bank */}
              <Route path="questions" element={<QuestionsList />} />
              <Route path="questions/create" element={<CreateQuestion />} />
              {/* Analytics & Settings */}
              <Route path="analytics" element={<OrgAnalytics />} />
              <Route path="settings" element={<OrgSettings />} />
              {/* Can reuse exam routes from recruiter */}
              <Route path="exams/create" element={<CreateExam />} />
              <Route path="exams/:id" element={<ExamsList />} />
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route index element={<StudentDashboard />} />
              {/* Add more student routes here */}
            </Route>

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
              <Route index element={<SuperAdminDashboard />} />
              <Route path="organizations" element={<OrganizationsList />} />
              <Route path="organizations/create" element={<CreateOrganization />} />
              <Route path="organizations/:id" element={<OrganizationDetails />} />
              <Route path="organizations/:id/edit" element={<EditOrganization />} />
              <Route path="system-config" element={<SystemConfig />} />
              <Route path="analytics" element={<Analytics />} />
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
                    : user?.role === 'SUPER_ADMIN'
                    ? '/super-admin'
                    : user?.role === 'ORG_ADMIN'
                    ? '/org-admin'
                    : user?.role === 'RECRUITER'
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
