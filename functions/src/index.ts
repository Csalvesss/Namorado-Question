/**
 * Cloud Functions do Guava Education — painel admin & gate de aprovação.
 *
 * Funções exportadas:
 *   - redeemSignupCode    (callable)        usuária digita código e libera o acesso
 *   - approveSignup       (callable, admin) gera código de aprovação
 *   - denySignup          (callable, admin) marca solicitação como negada
 *   - createImpersonationToken (callable, admin) custom token p/ logar como outro
 *   - logAccessReal       (callable)        sobrescreve log com IP real do servidor
 *
 * Deploy: `firebase deploy --only functions`
 * Pré-requisito: projeto no plano Blaze (pay-as-you-go).
 */

import * as admin from 'firebase-admin';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';

admin.initializeApp();
const db = admin.firestore();

const ADMIN_EMAILS = ['ads.cesaralves@gmail.com', 'guavacodex@gmail.com'];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

interface CallerInfo {
  uid: string;
  email: string;
  isAdmin: boolean;
}

async function getCaller(auth: { uid?: string; token?: { email?: string } } | undefined): Promise<CallerInfo> {
  if (!auth?.uid) {
    throw new HttpsError('unauthenticated', 'Faça login antes.');
  }
  const uid = auth.uid;
  let email = (auth.token?.email ?? '').toLowerCase();
  if (!email) {
    try {
      const u = await admin.auth().getUser(uid);
      email = (u.email ?? '').toLowerCase();
    } catch {
      // ignore
    }
  }
  // Fonte primária de verdade pra role: doc do Firestore.
  const userDoc = await db.collection('users').doc(uid).get();
  const role = userDoc.exists ? (userDoc.data()?.role as string | undefined) : undefined;
  const isAdmin = role === 'admin' || ADMIN_EMAILS.includes(email);
  return { uid, email, isAdmin };
}

function requireAdmin(caller: CallerInfo): void {
  if (!caller.isAdmin) {
    throw new HttpsError('permission-denied', 'Apenas admin.');
  }
}

/**
 * Geolocaliza um IP via ipapi.co (sem chave, ~30k req/mês free). Falha silenciosa.
 */
async function geolocateIp(ip: string | undefined): Promise<Record<string, unknown> | undefined> {
  if (!ip) return undefined;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!resp.ok) return undefined;
    const data = (await resp.json()) as Record<string, unknown>;
    if (data.error) return undefined;
    return {
      city: data.city,
      region: data.region,
      country: data.country_name,
      countryCode: data.country_code,
      lat: data.latitude,
      lon: data.longitude,
      org: data.org,
      timezone: data.timezone,
    };
  } catch {
    return undefined;
  }
}

/**
 * Gera código curto e legível, no estilo XXXX-XXXX (8 chars + hífen).
 * Evita confundir 0/O e 1/I.
 */
function generateApprovalCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function chunk(n: number) {
    let s = '';
    for (let i = 0; i < n; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    return s;
  }
  return `${chunk(4)}-${chunk(4)}`;
}

// ---------------------------------------------------------------------------
// redeemSignupCode
// ---------------------------------------------------------------------------

export const redeemSignupCode = onCall<{ code: string }>(async (request) => {
  const caller = await getCaller(request.auth);
  const code = (request.data?.code ?? '').trim().toUpperCase();
  if (!code) throw new HttpsError('invalid-argument', 'Código vazio.');

  const reqRef = db.collection('signup_requests').doc(caller.uid);
  const userRef = db.collection('users').doc(caller.uid);

  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) {
    throw new HttpsError('not-found', 'Não achei solicitação ativa pra essa conta.');
  }
  const data = reqSnap.data() ?? {};
  if (data.status === 'approved') {
    // já estava aprovada — só garante o doc do usuário aprovado
    await userRef.set({ status: 'approved' }, { merge: true });
    return { ok: true };
  }
  if (data.status !== 'pending') {
    throw new HttpsError('failed-precondition', 'Solicitação não está pendente.');
  }
  const expected = (data.approvalCode as string | undefined)?.toUpperCase();
  if (!expected) {
    throw new HttpsError(
      'failed-precondition',
      'Admin ainda não gerou código pra você. Espera o contato.',
    );
  }
  if (expected !== code) {
    throw new HttpsError('invalid-argument', 'Código incorreto.');
  }

  const now = Date.now();
  await Promise.all([
    userRef.set(
      {
        status: 'approved',
        approvedAt: now,
        approvedBy: data.approvedBy ?? 'admin',
      },
      { merge: true },
    ),
    reqRef.set(
      {
        status: 'approved',
        redeemedAt: now,
      },
      { merge: true },
    ),
  ]);

  logger.info(`[redeemSignupCode] uid=${caller.uid} approved`);
  return { ok: true };
});

// ---------------------------------------------------------------------------
// approveSignup (admin) — gera código
// ---------------------------------------------------------------------------

export const approveSignup = onCall<{ uid: string }>(async (request) => {
  const caller = await getCaller(request.auth);
  requireAdmin(caller);
  const uid = (request.data?.uid ?? '').trim();
  if (!uid) throw new HttpsError('invalid-argument', 'uid obrigatório.');

  const code = generateApprovalCode();
  await db.collection('signup_requests').doc(uid).set(
    {
      approvalCode: code,
      approvedBy: caller.uid,
      approvedByEmail: caller.email,
      approvalCodeIssuedAt: Date.now(),
    },
    { merge: true },
  );
  logger.info(`[approveSignup] admin=${caller.email} target=${uid} code issued`);
  return { ok: true, code };
});

// ---------------------------------------------------------------------------
// denySignup (admin)
// ---------------------------------------------------------------------------

export const denySignup = onCall<{ uid: string; reason?: string }>(async (request) => {
  const caller = await getCaller(request.auth);
  requireAdmin(caller);
  const uid = (request.data?.uid ?? '').trim();
  const reason = request.data?.reason?.trim();
  if (!uid) throw new HttpsError('invalid-argument', 'uid obrigatório.');

  await Promise.all([
    db.collection('signup_requests').doc(uid).set(
      {
        status: 'denied',
        deniedAt: Date.now(),
        deniedBy: caller.uid,
        deniedReason: reason ?? null,
      },
      { merge: true },
    ),
    db.collection('users').doc(uid).set({ status: 'blocked' }, { merge: true }),
  ]);
  logger.info(`[denySignup] admin=${caller.email} target=${uid} reason=${reason ?? '-'}`);
  return { ok: true };
});

// ---------------------------------------------------------------------------
// createImpersonationToken (admin)
// ---------------------------------------------------------------------------

export const createImpersonationToken = onCall<{ uid: string }>(async (request) => {
  const caller = await getCaller(request.auth);
  requireAdmin(caller);
  const targetUid = (request.data?.uid ?? '').trim();
  if (!targetUid) throw new HttpsError('invalid-argument', 'uid obrigatório.');
  if (targetUid === caller.uid) {
    throw new HttpsError('invalid-argument', 'Você já é você.');
  }

  // Audita o uso da impersonação ANTES de devolver o token.
  const ip = (request.rawRequest as { ip?: string })?.ip;
  const ua = request.rawRequest?.headers?.['user-agent'];
  const geo = await geolocateIp(ip);
  await db.collection('access_logs').add({
    uid: targetUid,
    email: (await admin.auth().getUser(targetUid)).email ?? '',
    when: Date.now(),
    whenServer: admin.firestore.FieldValue.serverTimestamp(),
    kind: 'impersonate',
    impersonatedBy: caller.uid,
    impersonatedByEmail: caller.email,
    ip: ip ?? null,
    geo: geo ?? null,
    userAgent: typeof ua === 'string' ? ua : null,
  });

  const token = await admin.auth().createCustomToken(targetUid, {
    impersonatedBy: caller.uid,
  });
  logger.info(`[impersonate] admin=${caller.email} target=${targetUid}`);
  return { ok: true, token };
});

// ---------------------------------------------------------------------------
// logAccessReal — sobrescreve o log do client com IP do servidor
// ---------------------------------------------------------------------------

export const logAccessReal = onCall<{ kind: string }>(async (request) => {
  const caller = await getCaller(request.auth);
  const kind = ['signin', 'signup', 'session'].includes(request.data?.kind as string)
    ? (request.data?.kind as string)
    : 'session';

  const ip = (request.rawRequest as { ip?: string })?.ip;
  const ua = request.rawRequest?.headers?.['user-agent'];
  const geo = await geolocateIp(ip);

  await db.collection('access_logs').add({
    uid: caller.uid,
    email: caller.email,
    when: Date.now(),
    whenServer: admin.firestore.FieldValue.serverTimestamp(),
    kind,
    ip: ip ?? null,
    geo: geo ?? null,
    userAgent: typeof ua === 'string' ? ua : null,
    serverside: true,
  });
  return { ok: true };
});
