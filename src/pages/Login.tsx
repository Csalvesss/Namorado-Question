import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { patchProfile, signIn, signUp } from '../lib/auth';
import { useUser } from '../lib/useUser';

type Mode = 'signin' | 'signup';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const trackParam = searchParams.get('track');
  const track: 'medicina' | 'odonto' = trackParam === 'odonto' ? 'odonto' : 'medicina';
  const { user, loading } = useUser();
  const [mode, setMode] = useState<Mode>(trackParam ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-serif text-lg italic text-ink-soft">carregando...</div>
      </div>
    );
  }

  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/app';
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setWorking(true);
    const result =
      mode === 'signup'
        ? await signUp({ email, password, name, track })
        : await signIn({ email, password });
    setWorking(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Se a usuária chegou aqui via Welcome → trilha X, garante que o
    // perfil tá nessa trilha (signIn não muda track sozinho — usuária
    // existente que escolheu odonto no Welcome estava entrando como
    // medicina). Patch só se diferente.
    if (trackParam && result.user.track !== track) {
      try {
        await patchProfile({ track });
      } catch (err) {
        console.error('falha ao atualizar trilha pós-login:', err);
      }
    }
    const from = (location.state as { from?: string } | null)?.from ?? '/app';
    navigate(from, { replace: true });
  }

  const isSignup = mode === 'signup';

  const trackLabel = track === 'odonto' ? 'Odontologia' : 'Medicina';

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.22em] text-mute transition hover:text-wine"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} /> trocar trilha
        </Link>
        <div className="mb-8 text-center">
          <div className="font-display text-[11px] uppercase tracking-[0.28em] text-gold">
            trilha · {trackLabel}
          </div>
          <h1 className="mt-3 font-display font-light italic leading-[1.05] text-ink text-[clamp(2.25rem,5vw,3rem)]">
            Guava Education
          </h1>
          <p className="mt-3 font-body text-lg italic text-mute">
            {track === 'odonto'
              ? 'estudar farmaco odonto com afeto e método'
              : 'estudar com afeto, estudar com método'}
          </p>
        </div>

        <div className="card p-7 sm:p-8">
          <div className="mb-5 flex items-center justify-center gap-1 rounded-full border border-line bg-bg-soft p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
                mode === 'signin'
                  ? 'bg-wine text-white shadow-soft'
                  : 'text-ink-soft hover:text-wine'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
                mode === 'signup'
                  ? 'bg-wine text-white shadow-soft'
                  : 'text-ink-soft hover:text-wine'
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label htmlFor="name" className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-muted">
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
            )}
            <div>
              <label htmlFor="email" className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-muted">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-elegant"
                placeholder="seu@email.com"
                autoComplete="email"
                autoFocus={!isSignup}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-muted">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-elegant"
                placeholder={isSignup ? 'pelo menos 6 caracteres' : 'sua senha'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                minLength={6}
              />
            </div>
            {error && (
              <div className="rounded-xl border-l-2 border-red bg-red-soft px-4 py-3 text-sm text-ink">
                {error}
              </div>
            )}
            <button type="submit" disabled={working} className="btn-primary w-full">
              {working ? 'Aguarda...' : isSignup ? 'Criar conta' : 'Entrar'}
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
