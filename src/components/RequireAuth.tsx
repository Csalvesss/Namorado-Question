import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../lib/useUser';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-serif text-lg italic text-ink-soft">carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
