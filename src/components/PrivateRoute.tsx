import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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
