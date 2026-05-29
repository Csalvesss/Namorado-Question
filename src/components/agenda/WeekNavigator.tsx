import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

interface WeekNavigatorProps {
  weekStart: Date; // segunda-feira da semana exibida
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const MONTHS_PT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

function formatRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const sameMonth = weekStart.getMonth() === end.getMonth();
  const sameYear = weekStart.getFullYear() === end.getFullYear();
  const startStr = sameMonth
    ? `${weekStart.getDate()}`
    : `${weekStart.getDate()} ${MONTHS_PT[weekStart.getMonth()]}`;
  const endStr = `${end.getDate()} ${MONTHS_PT[end.getMonth()]}`;
  const year = sameYear ? end.getFullYear() : `${weekStart.getFullYear()}/${end.getFullYear()}`;
  return `${startStr} – ${endStr}, ${year}`;
}

/**
 * Controles em cima do timeline: navegação ← / Hoje / →
 * + label editorial com intervalo da semana.
 */
export default function WeekNavigator({ weekStart, onPrev, onNext, onToday }: WeekNavigatorProps) {
  const range = formatRange(weekStart);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-baseline gap-3">
        <CalendarDays className="h-4 w-4 text-gold" strokeWidth={1.6} aria-hidden />
        <span className="font-display text-lg italic text-ink sm:text-xl">{range}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          aria-label="semana anterior"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-ink transition hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-wine/40"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.6} />
        </button>

        <button
          type="button"
          onClick={onToday}
          className="inline-flex min-h-[40px] items-center rounded-full border border-line bg-card px-5 font-display text-[13px] italic text-wine transition hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-wine/40"
        >
          hoje
        </button>

        <button
          type="button"
          onClick={onNext}
          aria-label="próxima semana"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-ink transition hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-wine/40"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}
