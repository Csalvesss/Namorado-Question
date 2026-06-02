// Queries específicas do painel admin. As rules do Firestore exigem role=admin
// pra ler /access_logs, signup_requests com status != self, etc — então essas
// funções só funcionam se o caller for admin.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { AccessLog, Material, SignupRequest, UserProfile } from '../types';

function mapUser(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    email: (data.email as string) ?? '',
    name: (data.name as string) ?? '',
    displayMode: (data.displayMode as UserProfile['displayMode']) ?? 'namorado',
    track: data.track === 'odonto' ? 'odonto' : 'medicina',
    dailyGoal: typeof data.dailyGoal === 'number' ? data.dailyGoal : undefined,
    partnerName: typeof data.partnerName === 'string' ? data.partnerName : undefined,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    status:
      data.status === 'pending' || data.status === 'approved' || data.status === 'blocked'
        ? data.status
        : undefined,
    role: data.role === 'admin' ? 'admin' : data.role === 'user' ? 'user' : undefined,
    approvedAt: typeof data.approvedAt === 'number' ? data.approvedAt : undefined,
    approvedBy: typeof data.approvedBy === 'string' ? data.approvedBy : undefined,
  };
}

export async function listAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(firestore, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => mapUser(d.id, d.data() as Record<string, unknown>));
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(firestore, 'users', uid));
  if (!snap.exists()) return null;
  return mapUser(uid, snap.data() as Record<string, unknown>);
}

export async function listSignupRequests(
  statusFilter?: 'pending' | 'approved' | 'denied',
): Promise<SignupRequest[]> {
  let q = query(collection(firestore, 'signup_requests'), orderBy('requestedAt', 'desc'));
  if (statusFilter) {
    q = query(
      collection(firestore, 'signup_requests'),
      where('status', '==', statusFilter),
      orderBy('requestedAt', 'desc'),
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      uid: (data.uid as string) ?? d.id,
      email: (data.email as string) ?? '',
      name: (data.name as string) ?? '',
      status: (data.status as SignupRequest['status']) ?? 'pending',
      requestedAt: typeof data.requestedAt === 'number' ? data.requestedAt : 0,
      ip: typeof data.ip === 'string' ? data.ip : undefined,
      geo: (data.geo as SignupRequest['geo']) ?? undefined,
      userAgent: typeof data.userAgent === 'string' ? data.userAgent : undefined,
      approvalCode: typeof data.approvalCode === 'string' ? data.approvalCode : undefined,
      approvedAt: typeof data.approvedAt === 'number' ? data.approvedAt : undefined,
      approvedBy: typeof data.approvedBy === 'string' ? data.approvedBy : undefined,
      deniedAt: typeof data.deniedAt === 'number' ? data.deniedAt : undefined,
      deniedReason: typeof data.deniedReason === 'string' ? data.deniedReason : undefined,
    };
  });
}

export async function listAccessLogs(max = 200): Promise<AccessLog[]> {
  const snap = await getDocs(
    query(collection(firestore, 'access_logs'), orderBy('when', 'desc'), limit(max)),
  );
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      uid: (data.uid as string) ?? '',
      email: (data.email as string) ?? '',
      when: typeof data.when === 'number' ? data.when : 0,
      ip: typeof data.ip === 'string' ? data.ip : undefined,
      geo: (data.geo as AccessLog['geo']) ?? undefined,
      userAgent: typeof data.userAgent === 'string' ? data.userAgent : undefined,
      kind: (data.kind as AccessLog['kind']) ?? 'signin',
      impersonatedBy:
        typeof data.impersonatedBy === 'string' ? data.impersonatedBy : undefined,
    };
  });
}

export async function listMaterialsForUser(ownerUid: string): Promise<Material[]> {
  const snap = await getDocs(
    query(
      collection(firestore, 'materials'),
      where('ownerUid', '==', ownerUid),
      orderBy('uploadedAt', 'desc'),
    ),
  );
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      ownerUid: (data.ownerUid as string) ?? '',
      name: (data.name as string) ?? '',
      storagePath: (data.storagePath as string) ?? '',
      size: typeof data.size === 'number' ? data.size : 0,
      contentType: (data.contentType as string) ?? '',
      uploadedAt: typeof data.uploadedAt === 'number' ? data.uploadedAt : 0,
      uploadedBy: (data.uploadedBy as string) ?? '',
      notes: typeof data.notes === 'string' ? data.notes : undefined,
    };
  });
}

/**
 * Aprovação direta SEM código — usa privilégio admin via Firestore rules.
 * Flipa /users/{uid}.status e /signup_requests/{uid}.status pra approved.
 * Útil pra testar sem precisar deployar Cloud Functions.
 */
export async function adminDirectApprove(uid: string, adminUid: string): Promise<void> {
  const now = Date.now();
  await updateDoc(doc(firestore, 'users', uid), {
    status: 'approved',
    approvedAt: now,
    approvedBy: adminUid,
  });
  // signup_requests pode não existir pra usuárias antigas — try/catch silencioso.
  try {
    await updateDoc(doc(firestore, 'signup_requests', uid), {
      status: 'approved',
      approvedAt: now,
      approvedBy: adminUid,
    });
  } catch {
    /* sem solicitação registrada, ok */
  }
}

export async function adminBlockUser(uid: string): Promise<void> {
  await updateDoc(doc(firestore, 'users', uid), { status: 'blocked' });
}

export async function adminUnblockUser(uid: string): Promise<void> {
  await updateDoc(doc(firestore, 'users', uid), { status: 'approved' });
}
