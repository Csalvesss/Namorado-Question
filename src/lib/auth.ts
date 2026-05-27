import type { UserProfile } from '../types';
import { db } from './db';

export const USER_CHANGE_EVENT = 'guava:user-change';

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(USER_CHANGE_EVENT));
  }
}

const ALLOWED_EMAILS_ENV = (import.meta.env.VITE_ALLOWED_EMAILS ?? '').toString();

export function getAllowedEmails(): string[] {
  return ALLOWED_EMAILS_ENV
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string): boolean {
  const allowed = getAllowedEmails();
  if (allowed.length === 0) return true;
  return allowed.includes(email.trim().toLowerCase());
}

export interface LoginInput {
  email: string;
  name: string;
}

export function login({ email, name }: LoginInput): { ok: true; user: UserProfile } | { ok: false; error: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'E-mail inválido' };
  }
  if (!cleanName) {
    return { ok: false, error: 'Conta o seu nome aí, vai' };
  }
  if (!isEmailAllowed(cleanEmail)) {
    return { ok: false, error: 'E-mail não está na lista de convidadas. Fala com quem te chamou.' };
  }

  const existing = db.user.get();
  const user: UserProfile = existing && existing.email === cleanEmail
    ? { ...existing, name: cleanName }
    : {
        uid: db.ids.user(),
        email: cleanEmail,
        name: cleanName,
        displayMode: 'namorado',
        createdAt: Date.now(),
      };

  db.user.save(user);
  emitChange();
  return { ok: true, user };
}

export function logout() {
  db.user.clear();
  emitChange();
}

export function getCurrentUser(): UserProfile | null {
  return db.user.get();
}

export function updateUser(patch: Partial<UserProfile>) {
  const current = db.user.get();
  if (!current) return;
  db.user.save({ ...current, ...patch });
  emitChange();
}
