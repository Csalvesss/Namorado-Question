// Engine determinística do EDUCATION ASSISTANT.
//
// Regras de ouro:
// - Sem IA, sem LLM, sem rede. Lógica pura sobre AgendaOccurrence.
// - Determinístico: mesmo (ctx, now) ⇒ mesmo output.
// - Não emite strings de UI: só `code` + `params`. A camada de copy traduz.
// - Não toca em Notification API, localStorage ou React.

import type {
  AgendaOccurrence,
  AssistantInsight,
  AssistantSeverity,
  AssistantSummary,
  InsightCode,
  NotificationPermission,
} from './agenda-types';
import type { ClassEvent, ExamEvent, Subject } from '../types';
import type { TaskEvent } from './agenda-types';
import {
  type AgendaContext,
  getOccurrencesForDate,
  getOccurrencesForRange,
  getNextUpcoming,
} from './agenda';

// =============================================================================
// Contexto público
// =============================================================================

export interface AssistantContext {
  subjects: Subject[];
  classes: ClassEvent[];
  exams: ExamEvent[];
  tasks: TaskEvent[];
  reminderPermission: NotificationPermission;
}

// =============================================================================
// Helpers de data (locais — não toca em ./agenda)
// =============================================================================

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** YYYY-MM-DD em horário local. */
function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Adiciona N dias a uma data (local), retornando nova Date à meia-noite local. */
function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

/** Diferença em dias inteiros entre duas datas ISO (YYYY-MM-DD), usando midday local
 *  para evitar problemas de DST. */
function daysBetweenISO(fromISO: string, toISO: string): number {
  const a = parseISODateLocal(fromISO);
  const b = parseISODateLocal(toISO);
  const am = new Date(a.getFullYear(), a.getMonth(), a.getDate(), 12).getTime();
  const bm = new Date(b.getFullYear(), b.getMonth(), b.getDate(), 12).getTime();
  return Math.round((bm - am) / MS_PER_DAY);
}

function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map((part) => Number(part));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Converte "HH:MM" pra minutos do dia. Retorna NaN se inválido. */
function timeToMinutes(time: string | undefined): number {
  if (!time) return Number.NaN;
  const [h, m] = time.split(':').map((part) => Number(part));
  if (Number.isNaN(h) || Number.isNaN(m)) return Number.NaN;
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

/** Ordena ocorrências por startMs (sem horário no final, ordem estável por id). */
function compareOccurrences(a: AgendaOccurrence, b: AgendaOccurrence): number {
  const aHas = typeof a.startMs === 'number';
  const bHas = typeof b.startMs === 'number';
  if (aHas && bHas) {
    if (a.startMs! !== b.startMs!) return a.startMs! - b.startMs!;
  } else if (aHas !== bHas) {
    return aHas ? -1 : 1;
  }
  return a.occurrenceId.localeCompare(b.occurrenceId);
}

// =============================================================================
// Detecção de conflitos
// =============================================================================

/** Detecta sobreposições de horário no MESMO dia. Considera apenas ocorrências
 *  com startMs e endMs definidos. Tocar nas bordas (end === start) NÃO conta. */
export function findConflicts(
  occurrences: AgendaOccurrence[],
): Array<{ a: AgendaOccurrence; b: AgendaOccurrence }> {
  const byDate = new Map<string, AgendaOccurrence[]>();
  for (const occ of occurrences) {
    if (typeof occ.startMs !== 'number' || typeof occ.endMs !== 'number') continue;
    if (occ.endMs <= occ.startMs) continue;
    const list = byDate.get(occ.date);
    if (list) list.push(occ);
    else byDate.set(occ.date, [occ]);
  }

  const conflicts: Array<{ a: AgendaOccurrence; b: AgendaOccurrence }> = [];
  for (const list of byDate.values()) {
    const sorted = [...list].sort(compareOccurrences);
    for (let i = 0; i < sorted.length; i += 1) {
      const a = sorted[i];
      for (let j = i + 1; j < sorted.length; j += 1) {
        const b = sorted[j];
        if (b.startMs! >= a.endMs!) break; // ordenado por start; nada mais sobrepõe
        // overlap real
        if (a.startMs! < b.endMs! && b.startMs! < a.endMs!) {
          conflicts.push({ a, b });
        }
      }
    }
  }
  return conflicts;
}

// =============================================================================
// Janelas livres
// =============================================================================

const FREE_DAY_START = 7 * 60; // 07:00
const FREE_DAY_END = 22 * 60; // 22:00

/** Janelas livres ≥ minHours entre 07:00 e 22:00 num dia. Considera apenas
 *  ocorrências do dia com horário definido. */
export function findFreeBlocks(
  date: string,
  occurrences: AgendaOccurrence[],
  minHours = 2,
): Array<{ start: string; end: string; hours: number }> {
  const dayOccs = occurrences
    .filter((o) => o.date === date && typeof o.startMs === 'number' && typeof o.endMs === 'number')
    .map((o) => {
      const startDate = new Date(o.startMs!);
      const endDate = new Date(o.endMs!);
      const start = startDate.getHours() * 60 + startDate.getMinutes();
      const end = endDate.getHours() * 60 + endDate.getMinutes();
      return { start, end };
    })
    .filter((seg) => seg.end > seg.start);

  // Mescla segmentos sobrepostos pra calcular ocupação real do dia.
  const sorted = [...dayOccs].sort((x, y) => x.start - y.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const seg of sorted) {
    const last = merged[merged.length - 1];
    if (last && seg.start <= last.end) {
      last.end = Math.max(last.end, seg.end);
    } else {
      merged.push({ ...seg });
    }
  }

  const blocks: Array<{ start: string; end: string; hours: number }> = [];
  const minMinutes = Math.round(minHours * 60);
  let cursor = FREE_DAY_START;

  for (const seg of merged) {
    if (seg.end <= FREE_DAY_START) continue;
    if (seg.start >= FREE_DAY_END) break;
    const segStart = Math.max(seg.start, FREE_DAY_START);
    const segEnd = Math.min(seg.end, FREE_DAY_END);
    if (segStart > cursor) {
      const gap = segStart - cursor;
      if (gap >= minMinutes) {
        blocks.push({
          start: minutesToTime(cursor),
          end: minutesToTime(segStart),
          hours: gap / 60,
        });
      }
    }
    cursor = Math.max(cursor, segEnd);
  }
  if (FREE_DAY_END > cursor) {
    const gap = FREE_DAY_END - cursor;
    if (gap >= minMinutes) {
      blocks.push({
        start: minutesToTime(cursor),
        end: minutesToTime(FREE_DAY_END),
        hours: gap / 60,
      });
    }
  }
  return blocks;
}

// =============================================================================
// Carga do dia
// =============================================================================

/** Soma de horas "cravadas" (intervalos com horário) no dia, com merge de
 *  sobreposições pra não contar duplo. Eventos sem horário só somam à contagem. */
export function summarizeDayLoad(occurrences: AgendaOccurrence[]): {
  eventCount: number;
  busyHours: number;
  isHeavy: boolean;
} {
  const timed = occurrences
    .filter((o) => typeof o.startMs === 'number' && typeof o.endMs === 'number' && o.endMs! > o.startMs!)
    .map((o) => ({ start: o.startMs!, end: o.endMs! }))
    .sort((a, b) => a.start - b.start);

  let busyMs = 0;
  let curStart = -1;
  let curEnd = -1;
  for (const seg of timed) {
    if (curStart === -1) {
      curStart = seg.start;
      curEnd = seg.end;
    } else if (seg.start <= curEnd) {
      curEnd = Math.max(curEnd, seg.end);
    } else {
      busyMs += curEnd - curStart;
      curStart = seg.start;
      curEnd = seg.end;
    }
  }
  if (curStart !== -1) busyMs += curEnd - curStart;

  const busyHours = busyMs / MS_PER_HOUR;
  return {
    eventCount: occurrences.length,
    busyHours,
    isHeavy: busyHours >= 5,
  };
}

// =============================================================================
// Maior bloco contínuo do dia (pra tip-long-block)
// =============================================================================

function longestContinuousBlock(occurrences: AgendaOccurrence[]): number {
  const timed = occurrences
    .filter((o) => typeof o.startMs === 'number' && typeof o.endMs === 'number' && o.endMs! > o.startMs!)
    .map((o) => ({ start: o.startMs!, end: o.endMs! }))
    .sort((a, b) => a.start - b.start);

  let longestMs = 0;
  let curStart = -1;
  let curEnd = -1;
  for (const seg of timed) {
    if (curStart === -1) {
      curStart = seg.start;
      curEnd = seg.end;
    } else if (seg.start <= curEnd) {
      curEnd = Math.max(curEnd, seg.end);
    } else {
      longestMs = Math.max(longestMs, curEnd - curStart);
      curStart = seg.start;
      curEnd = seg.end;
    }
  }
  if (curStart !== -1) longestMs = Math.max(longestMs, curEnd - curStart);
  return longestMs / MS_PER_HOUR;
}

// =============================================================================
// Ordenação e prioridade de insights
// =============================================================================

const SEVERITY_ORDER: Record<AssistantSeverity, number> = {
  urgent: 0,
  info: 1,
  positive: 2,
  tip: 3,
};

function sortInsights(insights: AssistantInsight[]): AssistantInsight[] {
  return [...insights].sort((a, b) => {
    const sa = SEVERITY_ORDER[a.severity];
    const sb = SEVERITY_ORDER[b.severity];
    if (sa !== sb) return sa - sb;
    return a.id.localeCompare(b.id);
  });
}

function makeInsight(
  code: InsightCode,
  severity: AssistantSeverity,
  params: Record<string, string | number | undefined>,
  idParts: Array<string | number | undefined> = [],
  occurrenceId?: string,
): AssistantInsight {
  const idTail = idParts
    .map((p) => (p === undefined || p === null ? '' : String(p)))
    .join('-');
  const id = idTail ? `${code}-${idTail}` : code;
  return { id, code, severity, params, occurrenceId };
}

// =============================================================================
// Função principal
// =============================================================================

export function buildAssistantSummary(
  ctx: AssistantContext,
  now: Date,
): AssistantSummary {
  const todayISO = toISODate(now);
  const tomorrowISO = toISODate(addDays(now, 1));
  const horizonISO = toISODate(addDays(now, 30));
  const nowMs = now.getTime();

  // Adapta AssistantContext (subjects como array) → AgendaContext (subjects Map).
  const subjectsMap = new Map<string, Subject>();
  for (const s of ctx.subjects) subjectsMap.set(s.id, s);
  const agendaCtx: AgendaContext = {
    subjects: subjectsMap,
    classes: ctx.classes,
    exams: ctx.exams,
    tasks: ctx.tasks,
  };

  // 1) Ocorrências relevantes — hoje, amanhã, próximos 30 dias.
  const todayOccs = [...getOccurrencesForDate(todayISO, agendaCtx)].sort(compareOccurrences);
  const tomorrowOccs = [...getOccurrencesForDate(tomorrowISO, agendaCtx)].sort(compareOccurrences);
  const next30 = getOccurrencesForRange(todayISO, horizonISO, agendaCtx);

  // 2) next: próxima ocorrência com horário ≥ now (primeira do array).
  const upcomingList = getNextUpcoming(agendaCtx, now, 1);
  const next = upcomingList[0];

  // 3) Provas futuras (≤ 30 dias)
  const upcomingExams = next30
    .filter((o) => o.kind === 'exam')
    .filter((o) => daysBetweenISO(todayISO, o.date) >= 0 && daysBetweenISO(todayISO, o.date) <= 30)
    .sort((a, b) => {
      const da = daysBetweenISO(todayISO, a.date);
      const db = daysBetweenISO(todayISO, b.date);
      if (da !== db) return da - db;
      return compareOccurrences(a, b);
    });

  // 4) Insights
  const insights: AssistantInsight[] = [];

  // A) starting-soon — em até 60min
  for (const occ of [...todayOccs, ...tomorrowOccs]) {
    if (typeof occ.startMs !== 'number') continue;
    const diffMin = Math.round((occ.startMs - nowMs) / MS_PER_MINUTE);
    if (diffMin >= 0 && diffMin <= 60) {
      insights.push(
        makeInsight(
          'starting-soon',
          'urgent',
          { title: occ.title, minutes: diffMin },
          [occ.occurrenceId],
          occ.occurrenceId,
        ),
      );
    }
  }

  // B) conflict — hoje + amanhã
  const conflictPool = [...todayOccs, ...tomorrowOccs];
  const conflicts = findConflicts(conflictPool);
  for (const { a, b } of conflicts) {
    const overlapStart = Math.max(a.startMs!, b.startMs!);
    const overlapEnd = Math.min(a.endMs!, b.endMs!);
    const overlapMin = Math.round((overlapEnd - overlapStart) / MS_PER_MINUTE);
    const startD = new Date(overlapStart);
    const endD = new Date(overlapEnd);
    const overlapLabel = `${pad2(startD.getHours())}:${pad2(startD.getMinutes())}–${pad2(endD.getHours())}:${pad2(endD.getMinutes())}`;
    insights.push(
      makeInsight(
        'conflict',
        'urgent',
        {
          titleA: a.title,
          titleB: b.title,
          dateISO: a.date,
          timeOverlap: overlapLabel,
          overlapMinutes: overlapMin,
        },
        [a.date, a.occurrenceId, b.occurrenceId],
      ),
    );
  }

  // C) exam-imminent — daysUntil ≤ 2
  // E) exam-upcoming — 3 ≤ daysUntil ≤ 14 (apenas a mais próxima não-iminente)
  const imminentIds = new Set<string>();
  let nearestUpcoming: AgendaOccurrence | undefined;
  let nearestUpcomingDays = Number.POSITIVE_INFINITY;
  for (const exam of upcomingExams) {
    const daysUntil = daysBetweenISO(todayISO, exam.date);
    if (daysUntil < 0) continue;
    if (daysUntil <= 2) {
      imminentIds.add(exam.occurrenceId);
      insights.push(
        makeInsight(
          'exam-imminent',
          'urgent',
          {
            subjectName: exam.subjectName ?? exam.title,
            examLabel: exam.examLabel,
            daysUntil,
            dateLabel: exam.date,
          },
          [exam.occurrenceId],
          exam.occurrenceId,
        ),
      );
    } else if (daysUntil >= 3 && daysUntil <= 14 && daysUntil < nearestUpcomingDays) {
      nearestUpcoming = exam;
      nearestUpcomingDays = daysUntil;
    }
  }
  if (nearestUpcoming) {
    insights.push(
      makeInsight(
        'exam-upcoming',
        'info',
        {
          subjectName: nearestUpcoming.subjectName ?? nearestUpcoming.title,
          daysUntil: nearestUpcomingDays,
        },
        [nearestUpcoming.occurrenceId],
        nearestUpcoming.occurrenceId,
      ),
    );
  }

  // D) exam-week-heavy — ≥ 2 provas em ≤ 7 dias
  const within7 = upcomingExams.filter(
    (e) => daysBetweenISO(todayISO, e.date) >= 0 && daysBetweenISO(todayISO, e.date) <= 7,
  );
  if (within7.length >= 2) {
    const first = within7[0];
    insights.push(
      makeInsight(
        'exam-week-heavy',
        'info',
        {
          count: within7.length,
          days: 7,
          firstSubject: first.subjectName ?? first.title,
          daysToFirst: daysBetweenISO(todayISO, first.date),
        },
        [todayISO, within7.length],
      ),
    );
  }

  // F) heavy-day — hoje com ≥ 5h cravadas
  const todayLoad = summarizeDayLoad(todayOccs);
  if (todayLoad.isHeavy) {
    insights.push(
      makeInsight(
        'heavy-day',
        'info',
        {
          busyHours: Math.round(todayLoad.busyHours * 10) / 10,
          eventCount: todayLoad.eventCount,
        },
        [todayISO],
      ),
    );
  }

  // G) free-day — hoje sem ocorrências E há prova em ≤ 14 dias
  if (todayOccs.length === 0) {
    const nextExam = upcomingExams.find((e) => {
      const d = daysBetweenISO(todayISO, e.date);
      return d >= 0 && d <= 14;
    });
    if (nextExam) {
      insights.push(
        makeInsight(
          'free-day',
          'positive',
          {
            nextExamSubject: nextExam.subjectName ?? nextExam.title,
            daysToExam: daysBetweenISO(todayISO, nextExam.date),
          },
          [todayISO],
        ),
      );
    }
  }

  // H) free-block — janela livre ≥ 2h entre 08:00 e 20:00 hoje/amanhã,
  //    SE houver prova em ≤ 14 dias.
  const hasExamSoon = upcomingExams.some((e) => {
    const d = daysBetweenISO(todayISO, e.date);
    return d >= 0 && d <= 14;
  });
  if (hasExamSoon) {
    for (const [iso, label] of [
      [todayISO, 'hoje'] as const,
      [tomorrowISO, 'amanhã'] as const,
    ]) {
      const dayOccs = iso === todayISO ? todayOccs : tomorrowOccs;
      const blocks = findFreeBlocks(iso, dayOccs, 2);
      // Restringir ao intervalo 08:00–20:00.
      for (const blk of blocks) {
        const bs = timeToMinutes(blk.start);
        const be = timeToMinutes(blk.end);
        const clampedStart = Math.max(bs, 8 * 60);
        const clampedEnd = Math.min(be, 20 * 60);
        if (clampedEnd - clampedStart >= 120) {
          insights.push(
            makeInsight(
              'free-block',
              'tip',
              {
                start: minutesToTime(clampedStart),
                end: minutesToTime(clampedEnd),
                hours: Math.round(((clampedEnd - clampedStart) / 60) * 10) / 10,
                dayLabel: label,
              },
              [iso, clampedStart, clampedEnd],
            ),
          );
          break; // só a primeira janela útil do dia
        }
      }
    }
  }

  // I) tip-no-exams — 0 provas em > 30 dias (i.e., nenhuma prova nos próximos 30)
  if (ctx.subjects.length > 0 && upcomingExams.length === 0) {
    insights.push(makeInsight('tip-no-exams', 'tip', {}, [todayISO]));
  }

  // J) tip-empty-plan — 0 disciplinas
  if (ctx.subjects.length === 0) {
    insights.push(makeInsight('tip-empty-plan', 'tip', {}, []));
  }

  // K) tip-long-block — algum dia (hoje/amanhã) tem bloco contínuo > 4h
  for (const [iso, label, occs] of [
    [todayISO, 'hoje', todayOccs] as const,
    [tomorrowISO, 'amanhã', tomorrowOccs] as const,
  ]) {
    const longest = longestContinuousBlock(occs);
    if (longest > 4) {
      insights.push(
        makeInsight(
          'tip-long-block',
          'tip',
          {
            hours: Math.round(longest * 10) / 10,
            dayLabel: label,
          },
          [iso],
        ),
      );
    }
  }

  // L) tip-enable-reminders — permissão 'default' E ≥ 1 occ com horário nos próximos 7 dias
  if (ctx.reminderPermission === 'default') {
    const week = getOccurrencesForRange(todayISO, toISODate(addDays(now, 7)), agendaCtx);
    const hasTimed = week.some((o) => typeof o.startMs === 'number' && o.startMs >= nowMs);
    if (hasTimed) {
      insights.push(makeInsight('tip-enable-reminders', 'tip', {}, [todayISO]));
    }
  }

  // Dedupe por id (mantém o primeiro de cada id).
  const seen = new Set<string>();
  const deduped: AssistantInsight[] = [];
  for (const ins of insights) {
    if (seen.has(ins.id)) continue;
    seen.add(ins.id);
    deduped.push(ins);
  }

  return {
    next,
    today: todayOccs,
    tomorrow: tomorrowOccs,
    upcomingExams,
    insights: sortInsights(deduped),
  };
}
