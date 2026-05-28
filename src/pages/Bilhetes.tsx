import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BilheteCard from '../components/BilheteCard';
import {
  currentBilhete,
  formatRotationCountdown,
  nextRotationIn,
} from '../lib/bilhete';
import { useUser } from '../lib/useUser';

export default function Bilhetes() {
  const { user, loading } = useUser();
  const [rotationTick, setRotationTick] = useState(0);

  useEffect(() => {
    const delay = nextRotationIn();
    const timer = setTimeout(() => setRotationTick((t) => t + 1), delay + 1000);
    return () => clearTimeout(timer);
  }, [rotationTick]);

  const bilhete = useMemo(() => currentBilhete(), [rotationTick]);
  const nextIn = useMemo(() => formatRotationCountdown(nextRotationIn()), [rotationTick]);

  if (loading) return null;
  if (user?.displayMode === 'doutora') {
    return <Navigate to="/app" replace />;
  }

  const partner = user?.partnerName?.trim() || '';

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <header>
        <Link
          to="/app"
          className="inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-wine"
        >
          <ArrowLeft className="mr-1 h-3 w-3" strokeWidth={2} /> Voltar
        </Link>
        <div className="eyebrow-gold mt-4">do seu namorado</div>
        <h1 className="display-title-sm mt-1">Bilhete do dia</h1>
        <p className="mt-3 max-w-xl font-serif text-lg italic leading-relaxed text-ink-soft">
          uma cartinha rápida pra lembrar que ele tá aqui. troca a cada 5 horas.
        </p>
      </header>

      <BilheteCard bilhete={bilhete} signature={partner || undefined} uid={user?.uid} />

      <div className="flex items-center justify-between border-t border-line pt-5 text-[11px] uppercase tracking-[0.22em] text-muted">
        <span>novo em {nextIn}</span>
        {!partner && (
          <Link to="/perfil" className="text-wine transition hover:text-wine-deep">
            configurar nome do namorado
          </Link>
        )}
      </div>
    </div>
  );
}
