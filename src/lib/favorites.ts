const STORAGE_PREFIX = 'guava.bilheteFav.';

export const FAVORITES_CHANGE_EVENT = 'guava:bilhete-favorites-change';

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FAVORITES_CHANGE_EVENT));
  }
}

function key(uid: string): string {
  return STORAGE_PREFIX + uid;
}

function load(uid: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(key(uid)) ?? '{}');
  } catch {
    return {};
  }
}

function save(uid: string, data: Record<string, number>) {
  localStorage.setItem(key(uid), JSON.stringify(data));
}

export function getFavorites(uid: string): string[] {
  return Object.keys(load(uid)).sort((a, b) => (load(uid)[b] ?? 0) - (load(uid)[a] ?? 0));
}

export function isFavorited(uid: string, bilheteId: string): boolean {
  return Boolean(load(uid)[bilheteId]);
}

export function toggleFavorite(uid: string, bilheteId: string): boolean {
  const data = load(uid);
  if (data[bilheteId]) {
    delete data[bilheteId];
  } else {
    data[bilheteId] = Date.now();
  }
  save(uid, data);
  emitChange();
  return Boolean(data[bilheteId]);
}

export function favoritesCount(uid: string): number {
  return Object.keys(load(uid)).length;
}
