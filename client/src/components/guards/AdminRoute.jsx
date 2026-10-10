import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
