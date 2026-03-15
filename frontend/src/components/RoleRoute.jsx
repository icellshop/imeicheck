import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allowed, children }) {
  const { authLoading, user } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-400">
        Loading...
      </div>
    );
  }

  if (!user || !allowed.includes(user.user_type)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}