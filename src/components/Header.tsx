import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';
import { useUser } from '../lib/useUser';

export default function Header() {
  const navigate = useNavigate();
  const { user, refresh } = useUser();
  const showBilhetes = user?.displayMode !== 'doutora';

  function handleLogout() {
    logout();
    refresh();
    navigate('/login');
  }

  return (
    <header
      className="safe-top sticky top-0 z-20 border-b border-line bg-paper/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link to="/app" className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-wine font-serif text-base italic text-wine-deep"
          >
            G
          </span>
          <span className="truncate font-serif text-xl italic text-wine-deep sm:text-2xl">
            Guava Education
          </span>
        </Link>
        {user && (
          <nav className="hidden gap-1 lg:flex">
            <NavItem to="/app">Cursos</NavItem>
            <NavItem to="/plano">Plano</NavItem>
            <NavItem to="/revisar">Revisar</NavItem>
            {showBilhetes && <NavItem to="/bilhetes">Bilhetes</NavItem>}
            <NavItem to="/historico">Histórico</NavItem>
            <NavItem to="/autor">Autor</NavItem>
            <NavItem to="/perfil">Perfil</NavItem>
          </nav>
        )}
        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-ink-soft lg:inline">
                olá, {user.name.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="btn-ghost text-xs uppercase tracking-wider"
                aria-label="Sair"
              >
                Sair
              </button>
            </>
          ) : null}
        </div>
      </div>
      {user && (
        <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 lg:hidden [-webkit-overflow-scrolling:touch]">
          <NavItem to="/app">Cursos</NavItem>
          <NavItem to="/plano">Plano</NavItem>
          <NavItem to="/revisar">Revisar</NavItem>
          {showBilhetes && <NavItem to="/bilhetes">Bilhetes</NavItem>}
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
        `inline-flex min-h-touch shrink-0 items-center rounded-full px-4 py-1.5 text-sm font-medium transition ${
          isActive
            ? 'bg-rose-soft text-wine-deep'
            : 'text-ink-soft hover:bg-bg-soft hover:text-wine-deep active:bg-bg-soft'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
