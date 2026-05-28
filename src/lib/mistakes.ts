const STORAGE_PREFIX = 'guava.mistakes.';

export const MISTAKES_CHANGE_EVENT = 'guava:mistakes-change';

export type MistakeTag =
  | 'nao-sabia'
  | 'leu-errado'
  | 'confundiu'
  | 'distracao'
  | 'fraco-tema';

export const MISTAKE_TAG_LABELS: Record<MistakeTag, string> = {
  'nao-sabia': 'não sabia',
  'leu-errado': 'li errado',
  confundiu: 'confundi com outra',
  distracao: 'distração / pressa',
  'fraco-tema': 'tema fraco',
};

export const MISTAKE_TAG_HINTS: Record<MistakeTag, string> = {
  'nao-sabia': 'lacuna de base. Volte ao material original.',
  'leu-errado': 'leu o enunciado errado. Treine grifar palavras-chave.',
  confundiu: 'confundiu com outra entidade. Faça quadro comparativo.',
  distracao: 'distração ou pressa. Marque ritmo de leitura.',
  'fraco-tema': 'tema fraco no geral. Considere uma sessão dedicada.',
};

export interface MistakeNote {
  questionId: string;
  tag?: MistakeTag;
  note?: string;
  updatedAt: number;
}

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MISTAKES_CHANGE_EVENT));
  }
}

function key(uid: string): string {
  return STORAGE_PREFIX + uid;
}

function loadAll(uid: string): Record<string, MistakeNote> {
  try {
    return JSON.parse(localStorage.getItem(key(uid)) ?? '{}');
  } catch {
    return {};
  }
}

function saveAll(uid: string, data: Record<string, MistakeNote>) {
  localStorage.setItem(key(uid), JSON.stringify(data));
}

export function getMistakeNote(uid: string, questionId: string): MistakeNote | null {
  return loadAll(uid)[questionId] ?? null;
}

export function setMistakeTag(uid: string, questionId: string, tag: MistakeTag | null): void {
  const all = loadAll(uid);
  const existing = all[questionId] ?? { questionId, updatedAt: Date.now() };
  if (tag === null) {
    delete existing.tag;
  } else {
    existing.tag = tag;
  }
  existing.updatedAt = Date.now();
  if (!existing.tag && !existing.note) {
    delete all[questionId];
  } else {
    all[questionId] = existing;
  }
  saveAll(uid, all);
  emitChange();
}

export function setMistakeNote(uid: string, questionId: string, note: string): void {
  const all = loadAll(uid);
  const existing = all[questionId] ?? { questionId, updatedAt: Date.now() };
  const trimmed = note.trim();
  if (!trimmed) {
    delete existing.note;
  } else {
    existing.note = trimmed;
  }
  existing.updatedAt = Date.now();
  if (!existing.tag && !existing.note) {
    delete all[questionId];
  } else {
    all[questionId] = existing;
  }
  saveAll(uid, all);
  emitChange();
}

export interface MistakeStats {
  byTag: Record<MistakeTag, number>;
  untagged: number;
  total: number;
}

export function statsForQuestions(uid: string, questionIds: string[]): MistakeStats {
  const all = loadAll(uid);
  const byTag: Record<MistakeTag, number> = {
    'nao-sabia': 0,
    'leu-errado': 0,
    confundiu: 0,
    distracao: 0,
    'fraco-tema': 0,
  };
  let untagged = 0;
  questionIds.forEach((id) => {
    const note = all[id];
    if (note?.tag) {
      byTag[note.tag] += 1;
    } else {
      untagged += 1;
    }
  });
  return { byTag, untagged, total: questionIds.length };
}
