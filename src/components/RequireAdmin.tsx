import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../lib/useUser';
import { isAdmin } from '../lib/admin';

/**
 * Gate pro painel /admin. Combina os checks de RequireAuth (logado, approved)
 * com a exigência de role=admin. As Firestore rules também barram qualquer
 * leitura privilegiada, então mesmo se alguém burlar o componente o backend
 * recusa as queries.
 */
export default function RequireAdmin({ children }: { children: React.ReactNode }) {
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
  if (!isAdmin(user)) {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
}
