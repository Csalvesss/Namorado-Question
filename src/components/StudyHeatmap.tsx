import { useMemo } from 'react';
import { buildHeatmapGrid, intensityColor } from '../lib/analytics';
import type { QuizSession } from '../types';
import { studyByDay } from '../lib/analytics';

interface StudyHeatmapProps {
  sessions: QuizSession[];
  weeks?: number;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const CELL = 12;
const GAP = 3;
const LEFT_LABEL = 14;
const TOP_LABEL = 14;

export default function StudyHeatmap({ sessions, weeks = 13 }: StudyHeatmapProps) {
  const grid = useMemo(() => {
    const map = studyByDay(sessions);
    return buildHeatmapGrid(map, weeks);
  }, [sessions, weeks]);

  const monthLabels = useMemo(() => {
    const seen = new Set<number>();
    const labels: { week: number; label: string }[] = [];
    grid.forEach((column, w) => {
      const first = column.find((c) => c.count >= 0);
      if (!first) return;
      const [y, m] = first.date.split('-').map(Number);
      const key = y * 12 + m;
      if (!seen.has(key)) {
        seen.add(key);
        labels.push({ week: w, label: MONTHS[m - 1] });
      }
    });
    return labels;
  }, [grid]);

  const width = weeks * (CELL + GAP) + LEFT_LABEL;
  const height = 7 * (CELL + GAP) + TOP_LABEL;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="block"
        role="img"
        aria-label="Mapa de calor dos dias de estudo"
      >
        {monthLabels.map(({ week, label }) => (
          <text
            key={`${week}-${label}`}
            x={LEFT_LABEL + week * (CELL + GAP)}
            y={10}
            fontSize="9"
            fill="#8a7771"
            fontFamily="Inter, sans-serif"
            letterSpacing="0.05em"
          >
            {label}
          </text>
        ))}

        {[1, 3, 5].map((d) => (
          <text
            key={d}
            x={0}
            y={TOP_LABEL + d * (CELL + GAP) + CELL - 2}
            fontSize="9"
            fill="#8a7771"
            fontFamily="Inter, sans-serif"
          >
            {WEEKDAYS[d]}
          </text>
        ))}

        {grid.map((column, w) =>
          column.map((day, d) => (
            <rect
              key={`${w}-${d}`}
              x={LEFT_LABEL + w * (CELL + GAP)}
              y={TOP_LABEL + d * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={2}
              fill={intensityColor(day.count)}
              stroke={day.count > 0 ? '#e6d9d2' : 'transparent'}
              strokeWidth="0.5"
            >
              <title>
                {day.date}
                {day.count >= 0 ? ` · ${day.count} questões` : ''}
              </title>
            </rect>
          )),
        )}
      </svg>

      <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted">
        <span>menos</span>
        {[0, 3, 10, 20, 40].map((n) => (
          <span
            key={n}
            className="inline-block h-3 w-3 rounded-sm border border-line"
            style={{ background: intensityColor(n) }}
          />
        ))}
        <span>mais</span>
      </div>
    </div>
  );
}
