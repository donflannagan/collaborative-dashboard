import { Navigate } from 'react-router-dom';
import { useAuth } from '../AppContext';

export default function ProtectedRoute({ children }) {
  const { userId } = useAuth();

  if (!userId) return <Navigate to="/login" replace />;

  return children;
}
