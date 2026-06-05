import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../lib/useUser';
import { redeemSignupCode } from '../lib/cloud-functions';
import { signOutCurrentUser } from '../lib/auth';
import { effectiveStatus } from '../lib/admin';
import Eyebrow from '../components/ui/Eyebrow';

export default function PendingApproval() {
  const { user, loading, refresh } = useUser();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-display italic text-mute">carregando...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  // Se já está aprovada, sai daqui.
  if (effectiveStatus(user) === 'approved') return <Navigate to="/app" replace />;

  const isBlocked = effectiveStatus(user) === 'blocked';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError('Digita o código que o admin te mandou.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await redeemSignupCode(code);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuccess(true);
    // O doc /users/{uid} foi flipado pra approved pelo backend.
    // Refresh pega o novo profile e o RequireAuth deixa passar.
    refresh();
    setTimeout(() => navigate('/app', { replace: true }), 800);
  }

  async function handleLogout() {
    await signOutCurrentUser();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-2xl px-6 py-16 sm:px-10 sm:py-24">
        <Eyebrow>{isBlocked ? 'acesso bloqueado' : 'aguardando liberação'}</Eyebrow>
        <h1 className="mt-4 font-display font-light leading-[1.05] text-ink text-[clamp(2.5rem,6vw,3.75rem)]">
          {isBlocked ? 'conta suspensa' : 'quase lá'}
        </h1>

        {isBlocked ? (
          <p className="mt-6 max-w-lg font-body text-lg italic leading-relaxed text-mute">
            Sua conta foi suspensa. Fala com quem te chamou pra entender o que aconteceu.
          </p>
        ) : (
          <>
            <p className="mt-6 max-w-lg font-body text-lg italic leading-relaxed text-mute">
              Sua conta foi criada, mas precisa de liberação manual. O admin recebe a
              solicitação com seus dados de acesso pra confirmar que é você mesmo, e te
              manda um código por fora (WhatsApp, mensagem, etc.).
            </p>
            <p className="mt-4 max-w-lg font-body text-base italic leading-relaxed text-mute">
              Quando receber o código, é só digitar aqui embaixo.
            </p>

            <form
              onSubmit={handleSubmit}
              className="card mt-10 p-8 sm:p-10"
            >
              <label
                htmlFor="code"
                className="font-display text-[11px] uppercase tracking-[0.22em] text-mute"
              >
                código de liberação
              </label>
              <input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={submitting || success}
                autoComplete="off"
                inputMode="text"
                placeholder="ex: AB12-CD34"
                className="mt-2 w-full rounded-xl border border-[var(--blush-stroke)] bg-paper px-4 py-3 font-display text-xl tracking-[0.18em] text-ink outline-none placeholder:text-mute focus:border-rose"
              />
              {error && (
                <div className="mt-4 rounded-2xl border-l-2 border-red bg-red-soft px-4 py-3 font-body text-sm text-txt">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 rounded-2xl border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3 font-body text-sm text-txt">
                  liberada! redirecionando…
                </div>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="font-display text-sm italic text-mute underline-offset-4 hover:underline"
                >
                  sair
                </button>
                <button
                  type="submit"
                  disabled={submitting || success}
                  className="rounded-full bg-wine px-6 py-2 font-display italic text-paper disabled:opacity-50"
                >
                  {submitting ? 'verificando…' : 'liberar acesso'}
                </button>
              </div>
            </form>

            <div className="mt-8 rounded-2xl border border-[var(--blush-stroke)] bg-blush p-6">
              <Eyebrow>seus dados</Eyebrow>
              <dl className="mt-3 grid grid-cols-1 gap-1 font-body text-sm text-txt sm:grid-cols-[120px_1fr]">
                <dt className="text-mute">nome</dt>
                <dd>{user.name}</dd>
                <dt className="text-mute">e-mail</dt>
                <dd>{user.email}</dd>
              </dl>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
