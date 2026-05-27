import type { QuizSession } from '../types';

export function isoDay(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export interface DayStudy {
  date: string;
  count: number;
}

export function studyByDay(sessions: QuizSession[]): Map<string, number> {
  const map = new Map<string, number>();
  sessions
    .filter((s) => s.completedAt)
    .forEach((s) => {
      const key = isoDay(new Date(s.completedAt!));
      map.set(key, (map.get(key) ?? 0) + s.answers.length);
    });
  return map;
}

export interface StreakInfo {
  current: number;
  longest: number;
  studyDaysTotal: number;
}

export function calculateStreak(
  studyMap: Map<string, number>,
  today: Date = new Date(),
): StreakInfo {
  if (studyMap.size === 0) return { current: 0, longest: 0, studyDaysTotal: 0 };

  let current = 0;
  const cursor = new Date(today);
  if (!studyMap.has(isoDay(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (studyMap.has(isoDay(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sortedDates = Array.from(studyMap.keys()).sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of sortedDates) {
    const [y, m, d] = key.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    if (prev === null || daysBetween(prev, cur) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = cur;
  }

  return { current, longest, studyDaysTotal: studyMap.size };
}

export function questionsAnsweredToday(studyMap: Map<string, number>, today: Date = new Date()): number {
  return studyMap.get(isoDay(today)) ?? 0;
}

export function buildHeatmapGrid(
  studyMap: Map<string, number>,
  weeks: number,
  today: Date = new Date(),
): DayStudy[][] {
  const cells: DayStudy[][] = [];
  const end = startOfDay(today);
  const dayOfWeek = end.getDay();
  const totalDays = weeks * 7;
  const start = new Date(end);
  start.setDate(start.getDate() - (totalDays - 1 - (6 - dayOfWeek)));

  for (let w = 0; w < weeks; w++) {
    const column: DayStudy[] = [];
    for (let d = 0; d < 7; d++) {
      const cursor = new Date(start);
      cursor.setDate(start.getDate() + w * 7 + d);
      if (cursor > end) {
        column.push({ date: isoDay(cursor), count: -1 });
      } else {
        const key = isoDay(cursor);
        column.push({ date: key, count: studyMap.get(key) ?? 0 });
      }
    }
    cells.push(column);
  }
  return cells;
}

export function intensityColor(count: number): string {
  if (count < 0) return 'transparent';
  if (count === 0) return '#f7ebe7';
  if (count <= 5) return '#f3d9dd';
  if (count <= 15) return '#c97b8a';
  if (count <= 30) return '#7a1f3d';
  return '#5a1530';
}
