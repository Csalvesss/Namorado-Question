import { useEffect } from 'react';
import { Bookmark, Clock3, MapPin, Plus, X } from 'lucide-react';
import type { AgendaOccurrence } from '../../lib/agenda-types';

interface DayDetailProps {
  dateISO: string;
  occurrences: AgendaOccurrence[];
  onClose: () => void;
  onEventClick: (occ: AgendaOccurrence) => void;
  onAddEvent: () => void;
}

const WEEKDAYS_LONG = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

function parseISO(dateISO: string): Date {
  const [y, m, d] = dateISO.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function sortOccurrences(list: AgendaOccurrence[]): AgendaOccurrence[] {
  return [...list].sort((a, b) => {
    if (a.startMs != null && b.startMs != null) return a.startMs - b.startMs;
    if (a.startMs != null) return -1;
    if (b.startMs != null) return 1;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Modal compacto com lista detalhada das ocorrências do dia.
 * Aparece ao clicar no cabeçalho de um dia da semana.
 */
export default function DayDetail({
  dateISO,
  occurrences,
  onClose,
  onEventClick,
  onAddEvent,
}: DayDetailProps) {
  const date = parseISO(dateISO);
  const weekday = WEEKDAYS_LONG[date.getDay()];
  const dateLabel = `${date.getDate()} de ${MONTHS_PT[date.getMonth()]}`;
  const sorted = sortOccurrences(occurrences);

  // Fecha no ESC.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 py-6 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`detalhes de ${weekday}, ${dateLabel}`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-paper shadow-lift"
      >
        {/* Cabeçalho */}
        <header className="flex items-start justify-between gap-4 border-b border-line/70 bg-paper-soft px-6 py-5">
          <div>
            <div className="font-display text-[11px] uppercase tracking-[0.22em] text-gold">
              {weekday}
            </div>
            <h2 className="mt-1 font-display text-2xl italic text-ink">{dateLabel}</h2>
            <div className="mt-1 font-body text-[13px] italic text-mute">
              {sorted.length === 0
                ? 'nada marcado para esse dia'
                : sorted.length === 1
                  ? '1 compromisso'
                  : `${sorted.length} compromissos`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="fechar"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-card text-ink transition hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-wine/40"
          >
            <X className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </header>

        {/* Lista */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-card/50 px-5 py-8 text-center">
              <p className="font-body italic text-mute">um dia em branco.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {sorted.map((occ) => (
                <li key={occ.occurrenceId}>
                  <button
                    type="button"
                    onClick={() => onEventClick(occ)}
                    className="group flex w-full items-stretch gap-3 rounded-2xl border border-line bg-card p-4 text-left transition hover:bg-paper hover:shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-wine/40"
                  >
                    <span
                      aria-hidden
                      className="w-[3px] shrink-0 rounded-full"
                      style={{ backgroundColor: occ.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        {occ.kind === 'exam' && (
                          <Bookmark
                            className="h-3.5 w-3.5 shrink-0 text-wine"
                            strokeWidth={1.8}
                            aria-hidden
                          />
                        )}
                        {occ.examLabel && (
                          <span className="font-display text-xs italic text-wine">
                            {occ.examLabel}
                          </span>
                        )}
                        <h3
                          className={[
                            'truncate font-display text-base text-ink',
                            occ.kind === 'task' ? 'italic' : '',
                          ].join(' ')}
                        >
                          {occ.title}
                        </h3>
                      </div>
                      {occ.subjectName && (
                        <div className="mt-0.5 font-body text-[12.5px] italic text-mute">
                          {occ.subjectName}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-[12.5px] text-txt/80">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3 w-3" strokeWidth={1.6} aria-hidden />
                          {occ.startTime && occ.endTime
                            ? `${occ.startTime} – ${occ.endTime}`
                            : occ.startTime
                              ? occ.startTime
                              : 'sem horário'}
                        </span>
                        {occ.location && (
                          <span className="inline-flex items-center gap-1.5 italic">
                            <MapPin className="h-3 w-3" strokeWidth={1.6} aria-hidden />
                            {occ.location}
                          </span>
                        )}
                      </div>
                      {occ.description && (
                        <p className="mt-2 line-clamp-2 font-body text-[12.5px] italic leading-relaxed text-mute">
                          {occ.description}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer com CTA de adicionar */}
        <footer className="border-t border-line/70 bg-card px-6 py-4">
          <button
            type="button"
            onClick={onAddEvent}
            className="inline-flex w-full min-h-touch items-center justify-center gap-2 rounded-full border border-wine/40 bg-paper px-5 font-display text-[14px] italic text-wine transition hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-wine/40"
          >
            <Plus className="h-4 w-4" strokeWidth={1.8} aria-hidden />
            adicionar nesse dia
          </button>
        </footer>
      </div>
    </div>
  );
}
