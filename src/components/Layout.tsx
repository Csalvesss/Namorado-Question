import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col safe-x bg-paper">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer
        className="bg-paper px-6 pt-10 text-center font-display text-sm italic text-mute"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 2.5rem)' }}
      >
        feito com cuidado para a minha doutora favorita
      </footer>
    </div>
  );
}
