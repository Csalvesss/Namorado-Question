import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col safe-x">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <Outlet />
        </div>
      </main>
      <footer
        className="px-4 pt-4 text-center font-serif text-xs italic text-muted"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
      >
        feito com cuidado para a minha doutora favorita
      </footer>
    </div>
  );
}
