import { cloudSrs } from './cloud-db';

const DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_PREFIX = 'guava.srs.';

export const SRS_CHANGE_EVENT = 'guava:srs-change';

function emitSrsChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SRS_CHANGE_EVENT));
  }
}

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface CardState {
  cardId: string;
  ease: number;
  interval: number;
  reps: number;
  due: number;
  lapses: number;
  lastReviewed?: number;
}

export function defaultState(cardId: string): CardState {
  return { cardId, ease: 2.5, interval: 0, reps: 0, due: 0, lapses: 0 };
}

function storageKey(userId: string): string {
  return STORAGE_PREFIX + userId;
}

function load(userId: string): Record<string, CardState> {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) ?? '{}');
  } catch {
    return {};
  }
}

function save(userId: string, data: Record<string, CardState>) {
  localStorage.setItem(storageKey(userId), JSON.stringify(data));
}

export function getCardState(userId: string, cardId: string): CardState {
  return load(userId)[cardId] ?? defaultState(cardId);
}

export function reviewCard(userId: string, cardId: string, grade: Grade): CardState {
  const data = load(userId);
  const next = applyGrade(data[cardId] ?? defaultState(cardId), grade);
  data[cardId] = next;
  save(userId, data);
  emitSrsChange();
  void cloudSrs
    .save({
      cardId: next.cardId,
      ease: next.ease,
      interval: next.interval,
      reps: next.reps,
      due: next.due,
      lapses: next.lapses,
      lastReviewed: next.lastReviewed,
    })
    .catch(() => {
      // best-effort sync; local cache holds the truth offline
    });
  return next;
}

export async function hydrateSrsFromCloud(userId: string): Promise<void> {
  try {
    const all = await cloudSrs.getAll(userId);
    save(userId, all);
    emitSrsChange();
  } catch {
    // ignore — local cache continues working offline
  }
}

export function applyGrade(state: CardState, grade: Grade): CardState {
  const now = Date.now();
  const next: CardState = { ...state, lastReviewed: now };

  switch (grade) {
    case 'again':
      next.reps = 0;
      next.interval = 0;
      next.ease = Math.max(1.3, state.ease - 0.2);
      next.lapses = state.lapses + 1;
      next.due = now + 10 * 60 * 1000;
      return next;
    case 'hard':
      next.interval = Math.max(1, Math.ceil(state.interval * 1.2));
      next.ease = Math.max(1.3, state.ease - 0.15);
      next.reps = state.reps + 1;
      next.due = now + next.interval * DAY_MS;
      return next;
    case 'good':
      if (state.reps === 0) next.interval = 1;
      else if (state.reps === 1) next.interval = 3;
      else next.interval = Math.ceil(state.interval * state.ease);
      next.reps = state.reps + 1;
      next.due = now + next.interval * DAY_MS;
      return next;
    case 'easy':
      if (state.reps === 0) next.interval = 4;
      else next.interval = Math.ceil(state.interval * state.ease * 1.3);
      next.ease = Math.min(3.0, state.ease + 0.15);
      next.reps = state.reps + 1;
      next.due = now + next.interval * DAY_MS;
      return next;
  }
}

export interface ReviewPreview {
  again: string;
  hard: string;
  good: string;
  easy: string;
}

export function previewIntervals(state: CardState): ReviewPreview {
  const again = applyGrade(state, 'again');
  const hard = applyGrade(state, 'hard');
  const good = applyGrade(state, 'good');
  const easy = applyGrade(state, 'easy');
  return {
    again: formatInterval(again.due - Date.now()),
    hard: formatInterval(hard.due - Date.now()),
    good: formatInterval(good.due - Date.now()),
    easy: formatInterval(easy.due - Date.now()),
  };
}

function formatInterval(ms: number): string {
  if (ms < 60 * 60 * 1000) return `${Math.max(1, Math.round(ms / 60000))} min`;
  if (ms < DAY_MS) return `${Math.round(ms / (60 * 60 * 1000))}h`;
  const days = Math.round(ms / DAY_MS);
  if (days < 30) return `${days} ${days === 1 ? 'dia' : 'dias'}`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? 'mês' : 'meses'}`;
}

export function listDueCards(
  userId: string,
  cardIds: string[],
  now: number = Date.now(),
): string[] {
  const data = load(userId);
  return cardIds.filter((id) => (data[id]?.due ?? 0) <= now);
}

export function listNewCards(
  userId: string,
  cardIds: string[],
): string[] {
  const data = load(userId);
  return cardIds.filter((id) => !data[id]);
}

export interface SRSStats {
  total: number;
  due: number;
  newCount: number;
  learning: number;
  mature: number;
}

export function srsStats(userId: string, cardIds: string[], now: number = Date.now()): SRSStats {
  const data = load(userId);
  let due = 0;
  let learning = 0;
  let mature = 0;
  let newCount = 0;
  for (const id of cardIds) {
    const state = data[id];
    if (!state) {
      newCount += 1;
      due += 1;
      continue;
    }
    if (state.due <= now) due += 1;
    if (state.interval >= 21) mature += 1;
    else learning += 1;
  }
  return { total: cardIds.length, due, newCount, learning, mature };
}
