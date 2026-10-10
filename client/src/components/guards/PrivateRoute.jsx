import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
