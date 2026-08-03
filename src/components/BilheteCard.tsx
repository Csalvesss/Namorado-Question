import { useEffect, useState } from 'react';
import {
  Apple,
  Coffee,
  Droplet,
  Footprints,
  Heart,
  Moon,
  PersonStanding,
  Sun,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { Bilhete, CareIcon } from '../data/bilhetes';
import {
  FAVORITES_CHANGE_EVENT,
  isFavorited,
  toggleFavorite,
} from '../lib/favorites';

const CARE_ICONS: Record<CareIcon, LucideIcon> = {
  agua: Droplet,
  comida: Apple,
  descanso: Coffee,
  alongar: PersonStanding,
  respirar: Wind,
  sono: Moon,
  caminhar: Footprints,
  sol: Sun,
};

const MONTHS_PT_LONG = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function periodOfDay(hour: number): string {
  if (hour < 5) return 'madrugada';
  if (hour < 12) return 'café da manhã';
  if (hour < 18) return 'meio da tarde';
  return 'noite quente';
}

function formatDateline(d: Date): string {
  return `${d.getDate()} de ${MONTHS_PT_LONG[d.getMonth()]} · ${periodOfDay(d.getHours())}`;
}

interface Props {
  bilhete: Bilhete;
  signature?: string;
  recipientFirstName?: string;
  date?: Date;
  className?: string;
  showSeal?: boolean;
  uid?: string;
  onClick?: () => void;
}

export default function BilheteCard({
  bilhete,
  signature,
  date = new Date(),
  className = '',
  showSeal = true,
  uid,
  onClick,
}: Props) {
  const sigInitial = signature ? signature.charAt(0).toUpperCase() : 'C';
  const [fav, setFav] = useState(() => (uid ? isFavorited(uid, bilhete.id) : false));

  useEffect(() => {
    if (!uid) return;
    function sync() {
      setFav(isFavorited(uid!, bilhete.id));
    }
    sync();
    window.addEventListener(FAVORITES_CHANGE_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_CHANGE_EVENT, sync);
  }, [uid, bilhete.id]);

  function handleHeartClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!uid) return;
    const next = toggleFavorite(uid, bilhete.id);
    setFav(next);
  }

  const Wrapper = onClick ? 'button' : 'article';

  return (
    <Wrapper
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      className={`relative block w-full overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-paper via-rose-soft/40 to-rose-soft/60 px-6 py-7 text-left shadow-card transition sm:px-8 sm:py-9 ${
        onClick ? 'hover:shadow-card-hover active:scale-[0.995]' : ''
      } ${className}`}
    >
      {uid ? (
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={fav ? 'remover dos favoritos' : 'favoritar bilhete'}
          aria-pressed={fav}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-rose transition hover:bg-rose-soft active:scale-90"
        >
          <Heart
            className="h-5 w-5"
            strokeWidth={1.5}
            fill={fav ? 'currentColor' : 'currentColor'}
            fillOpacity={fav ? 1 : 0.25}
          />
        </button>
      ) : (
        <div className="absolute right-5 top-5 text-rose">
          <Heart className="h-5 w-5" strokeWidth={1.5} fill="currentColor" fillOpacity={0.4} />
        </div>
      )}

      {signature && (
        <div className="mb-2 font-serif text-sm italic text-ink-soft">
          do seu namorado, com amor
        </div>
      )}

      {bilhete.title && (
        <div className="font-hand text-3xl font-medium leading-tight text-wine-deep sm:text-4xl">
          {bilhete.title}
        </div>
      )}

      <p className="mt-3 font-hand text-xl leading-snug text-ink sm:text-2xl">
        {bilhete.body}
      </p>

      {bilhete.author && (
        <p className="mt-2 font-serif text-sm italic text-ink-soft">— {bilhete.author}</p>
      )}

      {bilhete.care && (() => {
        const Icon = bilhete.careIcon ? CARE_ICONS[bilhete.careIcon] : Heart;
        return (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line/60 bg-paper/70 px-4 py-3 backdrop-blur-sm">
            <span
              aria-hidden
              className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-soft text-wine-deep"
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-gold">
                para você cuidar
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft sm:text-sm">
                {bilhete.care}
              </p>
            </div>
          </div>
        );
      })()}

      {signature && (
        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <div className="font-hand text-3xl font-semibold leading-none text-wine-deep sm:text-4xl">
              {signature}
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-muted">
              {formatDateline(date)}
            </div>
          </div>
          {showSeal && (
            <span
              aria-hidden
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-wine font-serif text-xs italic text-rose-soft shadow-soft sm:h-14 sm:w-14"
              title="lacre de cera"
            >
              {sigInitial}+S
            </span>
          )}
        </div>
      )}
    </Wrapper>
  );
}
