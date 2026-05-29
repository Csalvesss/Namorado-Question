import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '../lib/useUser';

/**
 * Tela inicial (pré-login OU seletor de trilha).
 * - Não logada: dois cards levam para /login?track=X
 * - Logada: dois cards trocam a trilha ativa (patch user.track) e vai para /app
 * Mesma conta acessa as duas trilhas, dados completamente separados.
 */
export default function Welcome() {
  const { user, loading, updateUser } = useUser();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState<'medicina' | 'odonto' | null>(null);
  if (loading) return null;

  async function pickTrack(track: 'medicina' | 'odonto') {
    if (user) {
      setSwitching(track);
      try {
        if (user.track !== track) {
          await updateUser({ track });
        }
        navigate('/app', { replace: true });
      } finally {
        setSwitching(null);
      }
    } else {
      navigate(`/login?track=${track}`);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      {/* Fundo com gradiente quente sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(900px 500px at 90% -10%, rgba(192,117,139,.18), transparent 60%), radial-gradient(700px 500px at -10% 100%, rgba(124,23,51,.06), transparent 60%), var(--paper)',
        }}
      />

      {/* Header */}
      <header className="safe-top mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 sm:px-10 lg:px-12 xl:px-20">
        <Link to="/" className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-wine/60 font-display text-lg italic text-wine"
          >
            G
          </span>
          <span className="font-display text-xl italic text-ink sm:text-[22px]">
            Guava{' '}
            <span className="font-body text-[11px] not-italic uppercase tracking-[0.32em] text-mute">
              Education
            </span>
          </span>
        </Link>
        <Link
          to="/login"
          className="font-display text-sm italic text-mute transition hover:text-wine"
        >
          Entrar
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10 sm:px-10 sm:pt-16 lg:px-12 xl:px-20">
        {/* Hero */}
        <div className="text-center">
          <h1 className="font-display font-light leading-[1.05] text-ink text-[clamp(2.25rem,6vw,4rem)]">
            O cuidado começa{' '}
            <span className="italic text-rose">pela sua dedicação</span>
            <span className="text-ink">.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-body text-base italic leading-relaxed text-mute sm:text-lg">
            Plataforma de estudos com afeto e método.
            <br className="hidden sm:inline" /> Selecione sua trilha para começar.
          </p>
        </div>

        {/* Dois cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:mt-20 md:grid-cols-2 md:gap-8">
          <TrackCard
            number="01"
            tag="Medicina"
            title="Sou estudante de medicina."
            body="Casos clínicos, calculadoras (CKD-EPI, Wells, CHA₂DS₂-VASc), algoritmos, MDC para fixar fármacos. Cursos de HIV a Insuficiência Cardíaca."
            footer={
              user
                ? user.track === 'medicina'
                  ? 'Continuar em medicina'
                  : 'Entrar em medicina'
                : 'Entrar como medicina'
            }
            loading={switching === 'medicina'}
            onClick={() => pickTrack('medicina')}
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            }
          />

          <TrackCard
            number="02"
            tag="Odontologia"
            title="Sou estudante de odonto."
            body="Anestésicos locais, antibióticos, AINEs, sedação consciente, hemostáticos. Cálculo de tubete, receituário guiado, profilaxia de endocardite."
            footer={
              user
                ? user.track === 'odonto'
                  ? 'Continuar em odonto'
                  : 'Entrar em odonto'
                : 'Entrar como odonto'
            }
            loading={switching === 'odonto'}
            onClick={() => pickTrack('odonto')}
            variant="wine"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                {/* Ícone de dente simplificado */}
                <path d="M8.5 3C6 3 4.5 4.7 4.5 7c0 1.6.5 3.2 1.1 5l1.2 3.4c.4 1.3 1 4.6 2.4 4.6 1.2 0 1.4-2.2 1.8-4 .3-1.3.7-2.2 1-2.2s.7.9 1 2.2c.4 1.8.6 4 1.8 4 1.4 0 2-3.3 2.4-4.6L18.4 12c.6-1.8 1.1-3.4 1.1-5 0-2.3-1.5-4-4-4-1.5 0-2.5.6-3.5 1.5C11 3.6 10 3 8.5 3z" />
              </svg>
            }
          />
        </div>

        {/* Rodapé afetivo */}
        <p className="mx-auto mt-20 max-w-md text-center font-body text-sm italic leading-relaxed text-mute">
          feito com cuidado para quem cuida.
        </p>
      </main>
    </div>
  );
}

interface TrackCardProps {
  number: string;
  tag: string;
  title: string;
  body: string;
  footer: string;
  loading?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  variant?: 'default' | 'wine';
}

function TrackCard({
  number,
  tag,
  title,
  body,
  footer,
  loading = false,
  onClick,
  icon,
  variant = 'default',
}: TrackCardProps) {
  const isWine = variant === 'wine';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`group relative flex flex-col gap-8 overflow-hidden rounded-[28px] border p-7 text-left transition hover:-translate-y-1 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 sm:p-9 ${
        isWine
          ? 'border-wine bg-wine text-[#FBEFEC] shadow-lift'
          : 'border-line bg-card text-txt shadow-soft hover:shadow-lift'
      }`}
    >
      {/* Topo: ícone + eyebrow */}
      <div className="flex items-start justify-between gap-4">
        <span
          aria-hidden
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
            isWine ? 'bg-white/12 text-blush' : 'bg-blush text-wine'
          }`}
        >
          {icon}
        </span>
        <div
          className={`font-display text-[11px] uppercase tracking-[0.28em] ${
            isWine ? 'text-blush/80' : 'text-gold'
          }`}
        >
          {number} · {tag}
        </div>
      </div>

      {/* Meio: título + body */}
      <div>
        <h2
          className={`font-display text-[clamp(1.75rem,3vw,2.25rem)] italic leading-[1.1] ${
            isWine ? 'text-[#FBEFEC]' : 'text-ink'
          }`}
        >
          {title}
        </h2>
        <p
          className={`mt-4 font-body text-[15px] leading-relaxed ${
            isWine ? 'text-[#FBEFEC]/85' : 'text-txt/85'
          }`}
        >
          {body}
        </p>
      </div>

      {/* Rodapé */}
      <div
        className={`mt-auto border-t pt-5 font-display text-[11px] uppercase tracking-[0.28em] ${
          isWine
            ? 'border-white/20 text-[#FBEFEC]/90'
            : 'border-line text-wine'
        }`}
      >
        {loading ? 'entrando…' : footer}
      </div>
    </button>
  );
}
