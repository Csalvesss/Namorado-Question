import type { CSSProperties } from 'react';
import { Bookmark, Clock3, MapPin } from 'lucide-react';
import type { AgendaOccurrence } from '../../lib/agenda-types';

interface EventChipProps {
  occ: AgendaOccurrence;
  onClick: () => void;
  style?: CSSProperties;
  /** modo compacto: usado em chips all-day e em sobreposições estreitas */
  compact?: boolean;
}

/**
 * Bloco visual de um evento (aula/prova/atividade) dentro do grid.
 *
 * Decisões visuais:
 * - Borda esquerda 3px com a cor da disciplina/categoria (occ.color).
 * - Provas ganham fundo bg-blush/40 + ícone Bookmark + borda mais espessa.
 * - Atividades ficam em italic (font-body italic) pra distinguir de aulas.
 */
export default function EventChip({ occ, onClick, style, compact = false }: EventChipProps) {
  const isExam = occ.kind === 'exam';
  const isTask = occ.kind === 'task';

  const ariaParts = [
    occ.kind === 'exam' ? 'prova' : occ.kind === 'task' ? 'atividade' : 'aula',
    occ.title,
    occ.startTime && occ.endTime ? `das ${occ.startTime} às ${occ.endTime}` : 'sem horário',
    occ.location ? `em ${occ.location}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={ariaParts}
      style={{
        ...style,
        borderLeftColor: occ.color,
        borderLeftWidth: isExam ? '4px' : '3px',
      }}
      className={[
        'group absolute overflow-hidden text-left transition',
        'rounded-xl border border-line',
        isExam ? 'bg-blush/50 hover:bg-blush/70' : 'bg-card hover:bg-paper',
        'hover:shadow-soft',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-wine/40',
        compact ? 'px-2 py-1.5' : 'px-2.5 py-2',
      ].join(' ')}
    >
      <div className="flex items-start gap-1.5">
        {isExam && (
          <Bookmark
            className="mt-[2px] h-3 w-3 shrink-0 text-wine"
            strokeWidth={1.8}
            aria-hidden
          />
        )}
        <div className="min-w-0 flex-1">
          <div
            className={[
              'truncate leading-tight',
              compact ? 'text-[11px]' : 'text-[12.5px]',
              isTask ? 'font-body italic text-ink' : 'font-display text-ink',
              isExam ? 'font-medium' : '',
            ].join(' ')}
          >
            {occ.examLabel ? (
              <span className="mr-1 font-display italic text-wine">{occ.examLabel}</span>
            ) : null}
            {occ.title}
          </div>

          {!compact && (occ.startTime || occ.location) && (
            <div className="mt-1 flex flex-col gap-0.5 text-[10.5px] text-mute">
              {occ.startTime && (
                <span className="inline-flex items-center gap-1 truncate font-body">
                  <Clock3 className="h-2.5 w-2.5 shrink-0" strokeWidth={1.6} aria-hidden />
                  {occ.startTime}
                  {occ.endTime ? `–${occ.endTime}` : ''}
                </span>
              )}
              {occ.location && (
                <span className="inline-flex items-center gap-1 truncate font-body italic">
                  <MapPin className="h-2.5 w-2.5 shrink-0" strokeWidth={1.6} aria-hidden />
                  {occ.location}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
