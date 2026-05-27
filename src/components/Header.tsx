import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';
import { useUser } from '../lib/useUser';

export default function Header() {
  const navigate = useNavigate();
  const { user, refresh } = useUser();

  function handleLogout() {
    logout();
    refresh();
    navigate('/login');
  }

  return (
    <header className="border-b border-line bg-paper/70 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/app" className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="font-serif text-2xl italic text-wine-deep">Guava Education</span>
        </Link>
        {user && (
          <nav className="hidden gap-1 md:flex">
            <NavItem to="/app">Cursos</NavItem>
            <NavItem to="/historico">Histórico</NavItem>
            <NavItem to="/autor">Autor</NavItem>
            <NavItem to="/perfil">Perfil</NavItem>
          </nav>
        )}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-ink-soft sm:inline">olá, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-ghost text-xs uppercase tracking-wider">
                Sair
              </button>
            </>
          ) : null}
        </div>
      </div>
      {user && (
        <nav className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 md:hidden">
          <NavItem to="/app">Cursos</NavItem>
          <NavItem to="/historico">Histórico</NavItem>
          <NavItem to="/autor">Autor</NavItem>
          <NavItem to="/perfil">Perfil</NavItem>
        </nav>
      )}
    </header>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `rounded-full px-4 py-1.5 text-sm font-medium transition ${
          isActive ? 'bg-rose-soft text-wine-deep' : 'text-ink-soft hover:bg-bg-soft hover:text-wine-deep'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
