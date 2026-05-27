import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { firebaseAuth, firestore } from './firebase';
import { clearUserCustomData, hydrateCoursesFromCloud, hydrateSessionsFromCloud } from './db';
import { hydrateSrsFromCloud } from './srs';
import type { UserProfile } from '../types';

export const USER_CHANGE_EVENT = 'guava:user-change';
const ALLOWED_EMAILS_ENV = (import.meta.env.VITE_ALLOWED_EMAILS ?? '').toString();

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(USER_CHANGE_EVENT));
  }
}

export function getAllowedEmails(): string[] {
  return ALLOWED_EMAILS_ENV.split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string): boolean {
  const allowed = getAllowedEmails();
  if (allowed.length === 0) return true;
  return allowed.includes(email.trim().toLowerCase());
}

export interface AuthInput {
  email: string;
  password: string;
  name?: string;
}

export type AuthResult =
  | { ok: true; user: UserProfile }
  | { ok: false; error: string };

function userDocRef(uid: string) {
  return doc(firestore, 'users', uid);
}

async function fetchProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userDocRef(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    email: data.email,
    name: data.name,
    displayMode: data.displayMode ?? 'namorado',
    dailyGoal: typeof data.dailyGoal === 'number' ? data.dailyGoal : undefined,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
  };
}

async function ensureProfile(fbUser: FirebaseUser, fallbackName?: string): Promise<UserProfile> {
  const existing = await fetchProfile(fbUser.uid);
  if (existing) return existing;
  const profile: UserProfile = {
    uid: fbUser.uid,
    email: (fbUser.email ?? '').toLowerCase(),
    name: fallbackName?.trim() || fbUser.displayName || fbUser.email?.split('@')[0] || 'doutora',
    displayMode: 'namorado',
    createdAt: Date.now(),
  };
  await setDoc(userDocRef(fbUser.uid), {
    ...profile,
    createdAtServer: serverTimestamp(),
  });
  return profile;
}

function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/user-disabled':
      return 'Conta desativada.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Esse e-mail já tem cadastro. Use o modo Entrar.';
    case 'auth/weak-password':
      return 'Senha precisa ter pelo menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Sem internet ou Firebase indisponível.';
    default:
      return 'Não consegui completar a autenticação. Tenta de novo.';
  }
}

export async function signIn({ email, password }: AuthInput): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'E-mail inválido.' };
  }
  if (!password) return { ok: false, error: 'Digita sua senha.' };
  try {
    const cred = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);
    const profile = await ensureProfile(cred.user);
    emitChange();
    return { ok: true, user: profile };
  } catch (e) {
    const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : '';
    return { ok: false, error: mapAuthError(code) };
  }
}

export async function signUp({ email, password, name }: AuthInput): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (name ?? '').trim();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'E-mail inválido.' };
  }
  if (!cleanName) return { ok: false, error: 'Conta o seu nome aí, vai.' };
  if (!password || password.length < 6) {
    return { ok: false, error: 'Senha precisa ter pelo menos 6 caracteres.' };
  }
  if (!isEmailAllowed(cleanEmail)) {
    return {
      ok: false,
      error: 'E-mail não está na lista de convidadas. Fala com quem te chamou.',
    };
  }
  try {
    const cred = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, password);
    const profile = await ensureProfile(cred.user, cleanName);
    emitChange();
    return { ok: true, user: profile };
  } catch (e) {
    const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : '';
    return { ok: false, error: mapAuthError(code) };
  }
}

export async function signOutCurrentUser() {
  await fbSignOut(firebaseAuth);
  emitChange();
}

export function logout() {
  void signOutCurrentUser();
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const fb = firebaseAuth.currentUser;
  if (!fb) return null;
  return fetchProfile(fb.uid);
}

let hydratedFor: string | null = null;

async function hydrateUserData(uid: string) {
  if (hydratedFor === uid) return;
  hydratedFor = uid;
  await Promise.all([
    hydrateSessionsFromCloud(uid),
    hydrateSrsFromCloud(uid),
    hydrateCoursesFromCloud(uid),
  ]);
}

export function onAuthChange(callback: (user: UserProfile | null) => void) {
  return onAuthStateChanged(firebaseAuth, async (fbUser) => {
    if (!fbUser) {
      if (hydratedFor) clearUserCustomData(hydratedFor);
      hydratedFor = null;
      callback(null);
      return;
    }
    if (hydratedFor && hydratedFor !== fbUser.uid) {
      clearUserCustomData(hydratedFor);
      hydratedFor = null;
    }
    const profile = await ensureProfile(fbUser);
    callback(profile);
    void hydrateUserData(fbUser.uid);
  });
}

export async function patchProfile(patch: Partial<UserProfile>) {
  const fb = firebaseAuth.currentUser;
  if (!fb) return;
  const { uid: _uid, createdAt: _createdAt, email: _email, ...safe } = patch;
  void _uid;
  void _createdAt;
  void _email;
  await updateDoc(userDocRef(fb.uid), safe);
  emitChange();
}
