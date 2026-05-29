// Sistema headless de notificações para a Agenda.
//
// Decisões:
// - Mantém-se ao máximo no-op se window.Notification não existir (SSR / Safari iOS
//   antigos). Nada explode, nada é agendado.
// - setTimeout não é confiável pra delays > 24d (overflow de int32). Aqui só
//   agendamos eventos cujo fireAt está dentro das próximas 24h. A página é
//   responsável por chamar scheduleReminders periodicamente (mount + ao receber
//   STUDY_PLAN_CHANGE_EVENT), o que dá auto-renovação.
// - Para evitar disparar 2x ao recarregar a página, guardamos os occurrenceIds já
//   notificados em localStorage por dia (chaves "guava.notified.YYYY-MM-DD").
//   Entries com mais de 3 dias são limpas em cada agendamento.

import type { AgendaOccurrence, NotificationPermission } from './agenda-types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const REMINDER_PRESETS: Array<{ minutes: number; label: string }> = [
  { minutes: 0, label: 'no início' },
  { minutes: 5, label: '5 min antes' },
  { minutes: 10, label: '10 min antes' },
  { minutes: 15, label: '15 min antes' },
  { minutes: 30, label: '30 min antes' },
  { minutes: 60, label: '1 h antes' },
  { minutes: 120, label: '2 h antes' },
  { minutes: 1440, label: '1 dia antes' },
];

const NOTIFIED_KEY_PREFIX = 'guava.notified.';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_TIMER_HORIZON_MS = ONE_DAY_MS; // só agenda eventos dentro de 24h

// ---------------------------------------------------------------------------
// State (module-scoped)
// ---------------------------------------------------------------------------

const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

// ---------------------------------------------------------------------------
// Browser support
// ---------------------------------------------------------------------------

function isSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.Notification !== 'undefined';
}

// ---------------------------------------------------------------------------
// Permission API
// ---------------------------------------------------------------------------

export function getPermission(): NotificationPermission {
  if (!isSupported()) return 'unsupported';
  const p = window.Notification.permission;
  if (p === 'granted') return 'granted';
  if (p === 'denied') return 'denied';
  return 'default';
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) return 'unsupported';
  try {
    const result = await window.Notification.requestPermission();
    if (result === 'granted') return 'granted';
    if (result === 'denied') return 'denied';
    return 'default';
  } catch {
    return getPermission();
  }
}

// ---------------------------------------------------------------------------
// Notified-store (localStorage dedupe)
// ---------------------------------------------------------------------------

function todayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function readNotified(dateKey: string): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY_PREFIX + dateKey);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (Array.isArray(arr)) return new Set(arr.filter((x): x is string => typeof x === 'string'));
    return new Set();
  } catch {
    return new Set();
  }
}

function writeNotified(dateKey: string, ids: Set<string>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(NOTIFIED_KEY_PREFIX + dateKey, JSON.stringify(Array.from(ids)));
  } catch {
    /* quota / privacy mode — silenciar */
  }
}

function cleanupOldNotifiedEntries(now: Date): void {
  if (typeof localStorage === 'undefined') return;
  const cutoffMs = now.getTime() - 3 * ONE_DAY_MS;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(NOTIFIED_KEY_PREFIX)) continue;
      const datePart = key.slice(NOTIFIED_KEY_PREFIX.length);
      const parsed = Date.parse(datePart + 'T00:00:00');
      if (Number.isFinite(parsed) && parsed < cutoffMs) {
        toRemove.push(key);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* silenciar */
  }
}

function markNotified(occurrenceId: string, date: Date): void {
  const key = todayKey(date);
  const set = readNotified(key);
  set.add(occurrenceId);
  writeNotified(key, set);
}

function wasNotified(occurrenceId: string, date: Date): boolean {
  return readNotified(todayKey(date)).has(occurrenceId);
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatReminderTitle(occ: AgendaOccurrence): string {
  const lead = occ.title || occ.subjectName || 'compromisso';
  const minutes = occ.reminderMinutes;
  if (minutes === undefined || minutes === 0) {
    return `${lead} agora`;
  }
  if (minutes < 60) {
    return `${lead} em ${minutes} min`;
  }
  if (minutes < 1440) {
    const h = Math.round(minutes / 60);
    return `${lead} em ${h} h`;
  }
  const d = Math.round(minutes / 1440);
  return `${lead} em ${d} ${d === 1 ? 'dia' : 'dias'}`;
}

export function formatReminderBody(occ: AgendaOccurrence): string {
  const parts: string[] = [];
  if (occ.startTime) parts.push(occ.startTime);
  if (occ.location) parts.push(occ.location);
  if (occ.examLabel) parts.push(occ.examLabel);
  if (!parts.length && occ.subjectName) parts.push(occ.subjectName);
  return parts.join(' · ');
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

function clearAllTimers(): void {
  activeTimers.forEach((t) => clearTimeout(t));
  activeTimers.clear();
}

export function cancelAll(): void {
  clearAllTimers();
}

/** Agenda lembretes para ocorrências com reminderMinutes definido cujo
 *  fireAt esteja entre `now` e `now + 24h`. Substitui agendamentos anteriores. */
export function scheduleReminders(occurrences: AgendaOccurrence[], now: Date): void {
  cleanupOldNotifiedEntries(now);
  clearAllTimers();

  if (!isSupported()) return;
  if (getPermission() !== 'granted') return;

  const nowMs = now.getTime();
  const horizonMs = nowMs + MAX_TIMER_HORIZON_MS;

  for (const occ of occurrences) {
    const minutes = occ.reminderMinutes;
    if (minutes === undefined) continue;
    if (occ.startMs === undefined) continue;

    const fireAt = occ.startMs - minutes * 60 * 1000;
    if (fireAt < nowMs) continue; // já passou
    if (fireAt > horizonMs) continue; // fora da janela de 24h
    if (wasNotified(occ.occurrenceId, now)) continue;

    const delay = Math.max(0, fireAt - nowMs);
    const occRef = occ;
    const timer = setTimeout(() => {
      activeTimers.delete(occRef.occurrenceId);
      try {
        if (!isSupported() || getPermission() !== 'granted') return;
        if (wasNotified(occRef.occurrenceId, new Date())) return;
        const title = formatReminderTitle(occRef);
        const body = formatReminderBody(occRef);
        // eslint-disable-next-line no-new
        new window.Notification(title, {
          body,
          tag: `guava-occ-${occRef.occurrenceId}`,
        });
        markNotified(occRef.occurrenceId, new Date());
      } catch {
        /* notificação falhou silenciosamente */
      }
    }, delay);
    activeTimers.set(occ.occurrenceId, timer);
  }
}

/** Utility pra disparar uma notificação imediata. No-op se sem permissão. */
export function notifyNow(title: string, body: string, tag?: string): void {
  if (!isSupported()) return;
  if (getPermission() !== 'granted') return;
  try {
    // eslint-disable-next-line no-new
    new window.Notification(title, { body, tag });
  } catch {
    /* silenciar */
  }
}
