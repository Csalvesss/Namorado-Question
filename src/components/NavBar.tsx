import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';
import { useUser } from '../lib/useUser';

const NAV_ITEMS: Array<{ to: string; label: string; namoradoOnly?: boolean }> = [
  { to: '/app', label: 'Início' },
  { to: '/cursos', label: 'Cursos' },
  { to: '/ferramentas', label: 'Ferramentas' },
  { to: '/plano', label: 'Plano' },
  { to: '/bilhetes', label: 'Bilhetes', namoradoOnly: true },
  { to: '/historico', label: 'Histórico' },
  { to: '/perfil', label: 'Perfil' },
];

export default function NavBar() {
  const navigate = useNavigate();
  const { user, refresh } = useUser();
  const isDoutora = user?.displayMode === 'doutora';

  function handleLogout() {
    logout();
    refresh();
    navigate('/login');
  }

  const items = NAV_ITEMS.filter((i) => !i.namoradoOnly || !isDoutora);
  const firstName = user?.name?.split(' ')[0] ?? '';

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-20">
        <Link to="/app" className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-wine/60 font-display text-base italic text-wine"
          >
            G
          </span>
          <span className="truncate font-display text-xl italic text-ink sm:text-[22px]">
            Guava Education
          </span>
        </Link>

        {user && (
          <nav className="hidden gap-1 lg:flex">
            {items.map((i) => (
              <NavItem key={i.to} to={i.to}>
                {i.label}
              </NavItem>
            ))}
          </nav>
        )}

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {firstName && (
            <span className="font-display text-sm italic text-mute">
              olá, {firstName}
            </span>
          )}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="font-display text-xs italic text-mute transition hover:text-wine"
              aria-label="Sair"
            >
              sair
            </button>
          )}
        </div>
      </div>

      {user && (
        <nav className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 lg:hidden [-webkit-overflow-scrolling:touch]">
          {items.map((i) => (
            <NavItem key={i.to} to={i.to}>
              {i.label}
            </NavItem>
          ))}
        </nav>
      )}
    </header>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      className={({ isActive }) =>
        `inline-flex min-h-touch shrink-0 items-center rounded-full px-4 py-1.5 font-display text-[15px] transition ${
          isActive
            ? 'bg-blush text-wine'
            : 'text-mute hover:bg-blush/50 hover:text-wine'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
