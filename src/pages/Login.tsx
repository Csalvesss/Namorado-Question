import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';
import { useUser } from '../lib/useUser';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refresh } = useUser();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/app';
    return <Navigate to={from} replace />;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = login({ email, name });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    refresh();
    const from = (location.state as { from?: string } | null)?.from ?? '/app';
    navigate(from, { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-2 font-serif text-2xl tracking-[0.5em] text-rose opacity-70">· · ·</div>
          <h1 className="font-serif text-5xl italic text-wine-deep sm:text-6xl">Guava Education</h1>
          <p className="mt-3 font-serif text-lg italic text-ink-soft">estudar com afeto, estudar com método</p>
        </div>

        <div className="card p-8">
          <h2 className="mb-6 text-center font-serif text-2xl italic text-wine-deep">Entrar</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-elegant"
                placeholder="como te chamo"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs uppercase tracking-[0.2em] text-muted">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-elegant"
                placeholder="seu@email.com"
              />
            </div>
            {error && (
              <div className="rounded-xl border-l-2 border-red bg-red-soft px-4 py-3 text-sm text-ink">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-muted">
            Plataforma privada. Apenas convidadas têm acesso.
          </p>
        </div>

        <p className="mt-6 text-center font-serif text-xs italic text-muted">
          feito com cuidado para a minha doutora favorita
        </p>
      </div>
    </div>
  );
}
