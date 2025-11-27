import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';
import { RootState } from '../store';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'STUDENT' | 'PROCTOR';
}

const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, user, loading, initializing } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading || initializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
