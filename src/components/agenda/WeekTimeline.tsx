import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AgendaOccurrence } from '../../lib/agenda-types';
import EventChip from './EventChip';
import DayDetail from './DayDetail';

// =============================================================================
// Constantes do timeline
// =============================================================================
// Janela visível: 07:00 → 22:00 (15 horas).
// 56px / hora = 840px de altura total. Tradeoff: alto o suficiente pra distinguir
// blocos de 30/45/60min sem precisar zoom, baixo o suficiente pra caber numa
// viewport desktop normal junto com cabeçalho da página.
const HOUR_START = 7;
const HOUR_END = 22;
const HOURS = HOUR_END - HOUR_START; // 15
const HOUR_PX = 56;
const TIMELINE_HEIGHT = HOURS * HOUR_PX; // 840
// Faixa de all-day (provas e atividades sem horário) acima da timeline.
const ALLDAY_HEIGHT = 60;

const WEEKDAYS_SHORT = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

// =============================================================================
// Props
// =============================================================================

interface WeekTimelineProps {
  weekStart: Date; // segunda-feira da semana exibida (00:00 local)
  occurrencesByDay: Map<string, AgendaOccurrence[]>;
  onEventClick: (occ: AgendaOccurrence) => void;
  onSlotClick: (dateISO: string, hour: number) => void;
  todayISO: string;
}

// =============================================================================
// Helpers
// =============================================================================

/** Formata um Date como YYYY-MM-DD em fuso local. */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface DaySlot {
  dateISO: string;
  date: Date;
  weekdayLabel: string;
  dayNumber: number;
  isToday: boolean;
  occurrences: AgendaOccurrence[];
}

function buildWeekSlots(
  weekStart: Date,
  byDay: Map<string, AgendaOccurrence[]>,
  todayISO: string,
): DaySlot[] {
  const out: DaySlot[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const iso = toISODate(d);
    out.push({
      dateISO: iso,
      date: d,
      weekdayLabel: WEEKDAYS_SHORT[i],
      dayNumber: d.getDate(),
      isToday: iso === todayISO,
      occurrences: byDay.get(iso) ?? [],
    });
  }
  return out;
}

/** Converte um epoch ms num offset em px dentro da timeline. */
function msToTopPx(ms: number, dayStart: Date): number {
  const offsetMin = (ms - dayStart.getTime()) / 60000;
  const visibleMin = offsetMin - HOUR_START * 60;
  return (visibleMin / 60) * HOUR_PX;
}

interface Positioned {
  occ: AgendaOccurrence;
  top: number;
  height: number;
  /** lane = índice da coluna de sobreposição (0-based) */
  lane: number;
  /** total de colunas no cluster onde esse evento está */
  laneCount: number;
}

/**
 * Calcula top/height + lanes pra sobreposição.
 *
 * Algoritmo de lanes: agrupa eventos que se sobrepõem entre si num "cluster",
 * dentro do cluster atribui a primeira lane livre (cada lane guarda o endMs do
 * último evento). Não tenta otimizar largura por sub-cluster — todo o cluster
 * compartilha a mesma divisão em N colunas. Simples e visualmente previsível.
 */
function positionTimedEvents(occs: AgendaOccurrence[], dayStart: Date): Positioned[] {
  const timed = occs
    .filter((o) => o.startMs != null && o.endMs != null)
    .sort((a, b) => (a.startMs ?? 0) - (b.startMs ?? 0));

  if (timed.length === 0) return [];

  const result: Positioned[] = [];
  let clusterStart = 0;
  let clusterEndMs = timed[0].endMs ?? 0;
  let cluster: { occ: AgendaOccurrence; lane: number }[] = [];
  let lanes: number[] = []; // lanes[i] = endMs do último evento na lane i

  const flush = () => {
    const laneCount = lanes.length;
    for (const item of cluster) {
      const start = item.occ.startMs ?? dayStart.getTime();
      const end = item.occ.endMs ?? start + 60 * 60 * 1000;
      const top = msToTopPx(start, dayStart);
      const bottom = msToTopPx(end, dayStart);
      const height = Math.max(22, bottom - top); // altura mínima legível
      result.push({
        occ: item.occ,
        top,
        height,
        lane: item.lane,
        laneCount,
      });
    }
    cluster = [];
    lanes = [];
  };

  for (let i = 0; i < timed.length; i++) {
    const occ = timed[i];
    const start = occ.startMs ?? 0;
    const end = occ.endMs ?? start;

    if (i === clusterStart || start < clusterEndMs) {
      // continua no cluster atual — encontra lane livre
      let lane = lanes.findIndex((laneEnd) => laneEnd <= start);
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(end);
      } else {
        lanes[lane] = end;
      }
      cluster.push({ occ, lane });
      clusterEndMs = Math.max(clusterEndMs, end);
    } else {
      // cluster terminou — fecha e começa um novo
      flush();
      clusterStart = i;
      clusterEndMs = end;
      lanes.push(end);
      cluster.push({ occ, lane: 0 });
    }
  }
  flush();
  return result;
}

// =============================================================================
// Componente
// =============================================================================

export default function WeekTimeline({
  weekStart,
  occurrencesByDay,
  onEventClick,
  onSlotClick,
  todayISO,
}: WeekTimelineProps) {
  const days = useMemo(
    () => buildWeekSlots(weekStart, occurrencesByDay, todayISO),
    [weekStart, occurrencesByDay, todayISO],
  );

  const [openDay, setOpenDay] = useState<string | null>(null);
  const openDaySlot = openDay ? days.find((d) => d.dateISO === openDay) : undefined;

  // Em mobile (<md): mostra "hoje + amanhã" se hoje estiver na semana,
  // senão mostra os 2 primeiros dias da semana exibida.
  const todayIdx = days.findIndex((d) => d.isToday);
  const mobileStartIdx = todayIdx >= 0 && todayIdx <= 5 ? todayIdx : 0;
  const mobileDays = days.slice(mobileStartIdx, mobileStartIdx + 2);

  return (
    <>
      {/* Desktop / tablet: grid de 7 dias */}
      <div className="hidden md:block">
        <WeekGrid
          days={days}
          onEventClick={onEventClick}
          onSlotClick={onSlotClick}
          onDayHeaderClick={(iso) => setOpenDay(iso)}
        />
      </div>

      {/* Mobile: 2 dias lado a lado, sem coluna de hora dedicada (label embutido) */}
      <div className="md:hidden">
        <WeekGrid
          days={mobileDays}
          onEventClick={onEventClick}
          onSlotClick={onSlotClick}
          onDayHeaderClick={(iso) => setOpenDay(iso)}
          compact
        />
      </div>

      {openDaySlot && (
        <DayDetail
          dateISO={openDaySlot.dateISO}
          occurrences={openDaySlot.occurrences}
          onClose={() => setOpenDay(null)}
          onEventClick={(occ) => {
            setOpenDay(null);
            onEventClick(occ);
          }}
          onAddEvent={() => {
            const iso = openDaySlot.dateISO;
            setOpenDay(null);
            onSlotClick(iso, 8);
          }}
        />
      )}
    </>
  );
}

// =============================================================================
// Subcomponente: grid (desktop e mobile compartilham)
// =============================================================================

interface WeekGridProps {
  days: DaySlot[];
  onEventClick: (occ: AgendaOccurrence) => void;
  onSlotClick: (dateISO: string, hour: number) => void;
  onDayHeaderClick: (dateISO: string) => void;
  compact?: boolean;
}

function WeekGrid({
  days,
  onEventClick,
  onSlotClick,
  onDayHeaderClick,
  compact = false,
}: WeekGridProps) {
  // grid: 1 coluna de hora (axis) + N colunas de dias
  const dayCols = days.length;
  const templateCols = compact
    ? `48px repeat(${dayCols}, minmax(0, 1fr))`
    : `60px repeat(${dayCols}, minmax(0, 1fr))`;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-soft">
      {/* Header sticky */}
      <div
        className="sticky top-0 z-20 grid border-b border-line bg-paper-soft"
        style={{ gridTemplateColumns: templateCols }}
      >
        <div className="flex items-end justify-center px-2 py-3">
          <span className="font-display text-[10px] uppercase tracking-[0.22em] text-gold">
            hora
          </span>
        </div>
        {days.map((d) => (
          <button
            key={d.dateISO}
            type="button"
            onClick={() => onDayHeaderClick(d.dateISO)}
            aria-label={`ver detalhes de ${d.weekdayLabel} ${d.dayNumber}`}
            className="flex flex-col items-center gap-1 border-l border-line/70 px-2 py-3 transition hover:bg-blush/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine/40"
          >
            <span className="font-display text-[11px] italic uppercase tracking-[0.18em] text-mute">
              {d.weekdayLabel}
            </span>
            <span
              className={[
                'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full px-2 font-display text-base italic',
                d.isToday ? 'bg-wine text-paper' : 'text-ink',
              ].join(' ')}
            >
              {d.dayNumber}
            </span>
          </button>
        ))}
      </div>

      {/* All-day strip */}
      <div
        className="grid border-b border-line/60 bg-paper"
        style={{ gridTemplateColumns: templateCols, minHeight: `${ALLDAY_HEIGHT}px` }}
      >
        <div className="flex items-start justify-center px-2 py-2">
          <span className="font-display text-[10px] uppercase tracking-[0.22em] text-gold">
            dia inteiro
          </span>
        </div>
        {days.map((d) => {
          const allDay = d.occurrences.filter(
            (o) => o.startMs == null || o.endMs == null,
          );
          return (
            <div
              key={d.dateISO}
              className="flex flex-col gap-1 border-l border-line/70 p-1.5"
            >
              {allDay.map((occ) => (
                <button
                  key={occ.occurrenceId}
                  type="button"
                  onClick={() => onEventClick(occ)}
                  aria-label={`${occ.kind === 'exam' ? 'prova' : occ.kind === 'task' ? 'atividade' : 'aula'}: ${occ.title}`}
                  style={{ borderLeftColor: occ.color, borderLeftWidth: '3px' }}
                  className={[
                    'truncate rounded-md border border-line px-1.5 py-1 text-left text-[11px] leading-tight transition',
                    occ.kind === 'exam'
                      ? 'bg-blush/60 font-display text-ink hover:bg-blush'
                      : occ.kind === 'task'
                        ? 'bg-card font-body italic text-ink hover:bg-paper'
                        : 'bg-card font-display text-ink hover:bg-paper',
                  ].join(' ')}
                >
                  {occ.examLabel && (
                    <span className="mr-1 font-display italic text-wine">{occ.examLabel}</span>
                  )}
                  {occ.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div
        className="relative grid"
        style={{
          gridTemplateColumns: templateCols,
          height: `${TIMELINE_HEIGHT}px`,
        }}
      >
        {/* Coluna de horas (axis) */}
        <div className="relative border-r border-line/70 bg-paper">
          {Array.from({ length: HOURS }).map((_, i) => (
            <div
              key={i}
              className="flex items-start justify-end pr-2 pt-0.5"
              style={{ height: `${HOUR_PX}px` }}
            >
              <span className="font-body text-[10px] tabular-nums text-mute">
                {String(HOUR_START + i).padStart(2, '0')}h
              </span>
            </div>
          ))}
        </div>

        {/* Colunas dos dias */}
        {days.map((d) => (
          <DayColumn
            key={d.dateISO}
            day={d}
            onEventClick={onEventClick}
            onSlotClick={onSlotClick}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Subcomponente: coluna de um dia (com eventos posicionados)
// =============================================================================

interface DayColumnProps {
  day: DaySlot;
  onEventClick: (occ: AgendaOccurrence) => void;
  onSlotClick: (dateISO: string, hour: number) => void;
}

function DayColumn({ day, onEventClick, onSlotClick }: DayColumnProps) {
  // Início do dia (00:00 local) — base pra calcular offsets em ms.
  const dayStart = useMemo(() => {
    const d = new Date(day.date);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [day.date]);

  const positioned = useMemo(
    () => positionTimedEvents(day.occurrences, dayStart),
    [day.occurrences, dayStart],
  );

  return (
    <div
      className={[
        'relative border-l border-line/70',
        day.isToday ? 'bg-blush/15' : 'bg-card',
      ].join(' ')}
    >
      {/* Linhas de hora + clickable slots */}
      {Array.from({ length: HOURS }).map((_, i) => {
        const hour = HOUR_START + i;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSlotClick(day.dateISO, hour)}
            aria-label={`adicionar evento em ${day.dateISO} às ${String(hour).padStart(2, '0')}:00`}
            className="absolute left-0 right-0 border-b border-dashed border-line/60 transition hover:bg-blush/30 focus:bg-blush/40 focus:outline-none"
            style={{
              top: `${i * HOUR_PX}px`,
              height: `${HOUR_PX}px`,
            }}
          />
        );
      })}

      {/* Eventos posicionados */}
      {positioned.map((p) => {
        // Largura: 100% dividido pelo número de lanes do cluster.
        const widthPct = 100 / p.laneCount;
        const leftPct = p.lane * widthPct;
        // Pequeno gap entre lanes pra respiro visual.
        const gap = p.laneCount > 1 ? 2 : 4;
        const style: CSSProperties = {
          top: `${Math.max(0, p.top)}px`,
          height: `${p.height}px`,
          left: `calc(${leftPct}% + ${p.lane === 0 ? gap : gap / 2}px)`,
          width: `calc(${widthPct}% - ${p.laneCount > 1 ? gap : gap * 2}px)`,
        };
        return (
          <EventChip
            key={p.occ.occurrenceId}
            occ={p.occ}
            onClick={() => onEventClick(p.occ)}
            style={style}
            compact={p.laneCount > 1 || p.height < 44}
          />
        );
      })}
    </div>
  );
}
