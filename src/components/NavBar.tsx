import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, LogOut } from 'lucide-react';
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
    <header className="safe-top sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-5 py-3 sm:gap-3 sm:px-10 sm:py-4 lg:gap-4 lg:px-12 xl:px-20">
        <Link to="/app" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span
            aria-hidden
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-wine/60 font-display text-base italic text-wine"
          >
            G
          </span>
          <span className="truncate font-display text-lg italic text-ink sm:text-[22px]">
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

        {/* Direita: trilha + olá (xl+) + sair */}
        {user && (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/"
              title="Trocar trilha"
              className="inline-flex min-h-touch items-center gap-1.5 rounded-full bg-blush/60 px-2.5 py-1.5 font-display text-[11px] italic uppercase tracking-[0.18em] text-wine transition hover:bg-blush"
            >
              <ArrowLeftRight className="h-3 w-3" strokeWidth={1.75} />
              {user.track === 'odonto' ? 'odonto' : 'medicina'}
            </Link>
            {firstName && (
              <span className="hidden font-display text-sm italic text-mute xl:inline">
                olá, {firstName}
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sair"
              className="inline-flex min-h-touch min-w-touch items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 font-display text-xs italic text-mute transition hover:bg-blush/60 hover:text-wine sm:px-3"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="hidden xl:inline">sair</span>
            </button>
          </div>
        )}
      </div>

      {user && (
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line px-4 py-2 lg:hidden [-webkit-overflow-scrolling:touch]">
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
        `inline-flex min-h-touch shrink-0 items-center rounded-full px-3 py-1.5 font-display text-[14px] transition lg:px-3.5 xl:px-4 xl:text-[15px] ${
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
