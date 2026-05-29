// Camada de view-model da agenda: projeta ClassEvent/ExamEvent/TaskEvent em
// AgendaOccurrence (uma ocorrência concreta num dia específico, com horário
// absoluto resolvido). Consumida pela timeline, pelo assistente e pelo agendador
// de notificações.

import type { ClassEvent, DayOfWeek, ExamEvent, Subject } from '../types';
import {
  TASK_CATEGORY_COLOR,
  type AgendaOccurrence,
  type TaskEvent,
} from './agenda-types';

const DEFAULT_COLOR = '#7C2D3A';

export interface AgendaContext {
  subjects: Map<string, Subject>;
  classes: ClassEvent[];
  exams: ExamEvent[];
  tasks: TaskEvent[];
}

// =============================================================================
// Helpers de data/hora
// =============================================================================

function parseDateISO(dateISO: string): { y: number; m: number; d: number } {
  const [y, m, d] = dateISO.split('-').map(Number);
  return { y: y ?? 1970, m: m ?? 1, d: d ?? 1 };
}

/** Constrói um Date LOCAL a partir de ISO + "HH:MM"; retorna ms epoch. */
export function parseTimeToMs(dateISO: string, hhmm: string): number {
  const { y, m, d } = parseDateISO(dateISO);
  const [hh, mm] = hhmm.split(':').map(Number);
  return new Date(y, m - 1, d, hh ?? 0, mm ?? 0, 0, 0).getTime();
}

function dateToISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Gera todos os dateISO (YYYY-MM-DD) entre start e end, inclusive. */
export function* iterateDates(startISO: string, endISO: string): Generator<string> {
  const { y: ys, m: ms, d: ds } = parseDateISO(startISO);
  const { y: ye, m: me, d: de } = parseDateISO(endISO);
  const start = new Date(ys, ms - 1, ds);
  const end = new Date(ye, me - 1, de);
  if (end.getTime() < start.getTime()) return;
  const cur = new Date(start.getTime());
  while (cur.getTime() <= end.getTime()) {
    yield dateToISO(cur);
    cur.setDate(cur.getDate() + 1);
  }
}

function getDayOfWeek(dateISO: string): DayOfWeek {
  const { y, m, d } = parseDateISO(dateISO);
  return new Date(y, m - 1, d).getDay() as DayOfWeek;
}

// =============================================================================
// Expansão de eventos → ocorrências
// =============================================================================

export function expandClassToOccurrence(
  c: ClassEvent,
  dateISO: string,
  subjects: Map<string, Subject>,
): AgendaOccurrence {
  const subject = subjects.get(c.subjectId);
  const startMs = parseTimeToMs(dateISO, c.startTime);
  const endMs = parseTimeToMs(dateISO, c.endTime);
  return {
    occurrenceId: `class-${c.id}-${dateISO}`,
    sourceId: c.id,
    kind: 'class',
    title: subject?.name ?? 'Aula',
    subjectId: c.subjectId,
    subjectName: subject?.name,
    color: subject?.color ?? DEFAULT_COLOR,
    date: dateISO,
    startMs,
    endMs,
    startTime: c.startTime,
    endTime: c.endTime,
    location: c.location,
    dayOfWeek: c.dayOfWeek,
  };
}

export function expandExamToOccurrence(
  e: ExamEvent,
  subjects: Map<string, Subject>,
): AgendaOccurrence {
  const subject = subjects.get(e.subjectId);
  const baseTitle = subject?.name ?? 'Prova';
  const title = e.label ? `${baseTitle} — ${e.label}` : baseTitle;
  const startMs = e.time ? parseTimeToMs(e.date, e.time) : undefined;
  return {
    occurrenceId: `exam-${e.id}-${e.date}`,
    sourceId: e.id,
    kind: 'exam',
    title,
    subjectId: e.subjectId,
    subjectName: subject?.name,
    color: subject?.color ?? DEFAULT_COLOR,
    date: e.date,
    startMs,
    startTime: e.time,
    location: e.location,
    examLabel: e.label,
  };
}

export function expandTaskToOccurrence(
  t: TaskEvent,
  subjects: Map<string, Subject>,
): AgendaOccurrence {
  const subject = t.subjectId ? subjects.get(t.subjectId) : undefined;
  // Cor: override explícito > disciplina > categoria
  const color =
    t.color ?? subject?.color ?? TASK_CATEGORY_COLOR[t.category] ?? DEFAULT_COLOR;
  const startMs = t.startTime ? parseTimeToMs(t.date, t.startTime) : undefined;
  const endMs = t.endTime ? parseTimeToMs(t.date, t.endTime) : undefined;
  return {
    occurrenceId: `task-${t.id}-${t.date}`,
    sourceId: t.id,
    kind: 'task',
    title: t.title,
    subjectId: t.subjectId,
    subjectName: subject?.name,
    color,
    date: t.date,
    startMs,
    endMs,
    startTime: t.startTime,
    endTime: t.endTime,
    location: t.location,
    description: t.description,
    category: t.category,
    reminderMinutes: t.reminderMinutes,
  };
}

// =============================================================================
// Ordenação
// =============================================================================

function compareOccurrences(a: AgendaOccurrence, b: AgendaOccurrence): number {
  const aHas = a.startMs !== undefined;
  const bHas = b.startMs !== undefined;
  if (aHas && bHas) {
    if (a.startMs! !== b.startMs!) return a.startMs! - b.startMs!;
    return a.title.localeCompare(b.title, 'pt');
  }
  if (aHas) return -1;
  if (bHas) return 1;
  return a.title.localeCompare(b.title, 'pt');
}

// =============================================================================
// Consultas
// =============================================================================

export function getOccurrencesForDate(
  dateISO: string,
  ctx: AgendaContext,
): AgendaOccurrence[] {
  const dow = getDayOfWeek(dateISO);
  const out: AgendaOccurrence[] = [];

  for (const c of ctx.classes) {
    if (c.dayOfWeek === dow) {
      out.push(expandClassToOccurrence(c, dateISO, ctx.subjects));
    }
  }
  for (const e of ctx.exams) {
    if (e.date === dateISO) {
      out.push(expandExamToOccurrence(e, ctx.subjects));
    }
  }
  for (const t of ctx.tasks) {
    if (t.date === dateISO) {
      out.push(expandTaskToOccurrence(t, ctx.subjects));
    }
  }

  out.sort(compareOccurrences);
  return out;
}

export function getOccurrencesForRange(
  startISO: string,
  endISO: string,
  ctx: AgendaContext,
): AgendaOccurrence[] {
  const out: AgendaOccurrence[] = [];
  for (const dateISO of iterateDates(startISO, endISO)) {
    const day = getOccurrencesForDate(dateISO, ctx);
    for (const occ of day) out.push(occ);
  }
  return out;
}

export function getOccurrencesByDay(
  startISO: string,
  endISO: string,
  ctx: AgendaContext,
): Map<string, AgendaOccurrence[]> {
  const map = new Map<string, AgendaOccurrence[]>();
  for (const dateISO of iterateDates(startISO, endISO)) {
    map.set(dateISO, getOccurrencesForDate(dateISO, ctx));
  }
  return map;
}

/**
 * Próximas ocorrências com horário definido a partir de `now`, ordenadas por
 * proximidade. Varre uma janela de 60 dias — suficiente para qualquer UI da
 * agenda e barato (apenas projeções recorrentes das aulas).
 */
export function getNextUpcoming(
  ctx: AgendaContext,
  now: Date,
  limit = 5,
): AgendaOccurrence[] {
  const nowMs = now.getTime();
  const startISO = dateToISO(now);
  const horizon = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  horizon.setDate(horizon.getDate() + 60);
  const endISO = dateToISO(horizon);

  const all = getOccurrencesForRange(startISO, endISO, ctx);
  const filtered = all.filter(
    (occ) => occ.startMs !== undefined && occ.startMs >= nowMs,
  );
  filtered.sort((a, b) => (a.startMs! - b.startMs!));
  return filtered.slice(0, limit);
}
