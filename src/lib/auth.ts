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
import { hydrateStudyPlanFromCloud } from './studyPlan';
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
  track?: 'medicina' | 'odonto';
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
    // Backward-compat: usuários existentes sem track ficam em 'medicina'
    track: data.track === 'odonto' ? 'odonto' : 'medicina',
    dailyGoal: typeof data.dailyGoal === 'number' ? data.dailyGoal : undefined,
    partnerName: typeof data.partnerName === 'string' ? data.partnerName : undefined,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
  };
}

async function ensureProfile(
  fbUser: FirebaseUser,
  fallbackName?: string,
  fallbackTrack: 'medicina' | 'odonto' = 'medicina',
): Promise<UserProfile> {
  const existing = await fetchProfile(fbUser.uid);
  if (existing) return existing;
  const profile: UserProfile = {
    uid: fbUser.uid,
    email: (fbUser.email ?? '').toLowerCase(),
    name: fallbackName?.trim() || fbUser.displayName || fbUser.email?.split('@')[0] || 'doutora',
    displayMode: 'namorado',
    track: fallbackTrack,
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

export async function signUp({ email, password, name, track }: AuthInput): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (name ?? '').trim();
  const safeTrack: 'medicina' | 'odonto' = track === 'odonto' ? 'odonto' : 'medicina';
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
    await setDoc(
      userDocRef(cred.user.uid),
      {
        uid: cred.user.uid,
        email: cleanEmail,
        name: cleanName,
        displayMode: 'namorado',
        track: safeTrack,
        createdAt: Date.now(),
        createdAtServer: serverTimestamp(),
      },
      { merge: true },
    );
    const profile = (await fetchProfile(cred.user.uid)) ?? {
      uid: cred.user.uid,
      email: cleanEmail,
      name: cleanName,
      displayMode: 'namorado',
      track: safeTrack,
      createdAt: Date.now(),
    };
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

async function hydrateUserData(uid: string, track: 'medicina' | 'odonto' = 'medicina') {
  const key = `${uid}::${track}`;
  if (hydratedFor === key) return;
  hydratedFor = key;
  await Promise.all([
    hydrateSessionsFromCloud(uid, track),
    hydrateSrsFromCloud(uid, track),
    hydrateCoursesFromCloud(uid),
    hydrateStudyPlanFromCloud(uid),
  ]);
}

export function onAuthChange(callback: (user: UserProfile | null) => void) {
  let lastUid: string | null = null;

  const unsubAuth = onAuthStateChanged(firebaseAuth, async (fbUser) => {
    if (!fbUser) {
      if (hydratedFor) clearUserCustomData(hydratedFor);
      hydratedFor = null;
      lastUid = null;
      callback(null);
      return;
    }
    if (hydratedFor && hydratedFor !== fbUser.uid) {
      clearUserCustomData(hydratedFor);
      hydratedFor = null;
    }
    lastUid = fbUser.uid;
    const profile = await ensureProfile(fbUser);
    callback(profile);
    void hydrateUserData(fbUser.uid, profile.track ?? 'medicina');
  });

  async function handleManualChange() {
    if (!lastUid) return;
    const profile = await fetchProfile(lastUid);
    if (profile) {
      callback(profile);
      // Re-hidratar quando o track muda — invalida o cache de hidratação
      hydratedFor = null;
      void hydrateUserData(lastUid, profile.track ?? 'medicina');
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener(USER_CHANGE_EVENT, handleManualChange);
  }

  return () => {
    unsubAuth();
    if (typeof window !== 'undefined') {
      window.removeEventListener(USER_CHANGE_EVENT, handleManualChange);
    }
  };
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
