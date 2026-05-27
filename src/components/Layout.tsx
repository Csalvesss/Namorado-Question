import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
          <Outlet />
        </div>
      </main>
      <footer className="px-4 pb-8 pt-4 text-center font-serif text-xs italic text-muted">
        feito com cuidado para a minha doutora favorita
      </footer>
    </div>
  );
}
