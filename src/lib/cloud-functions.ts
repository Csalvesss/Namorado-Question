// Wrappers das Cloud Functions do projeto.
//
// IMPORTANTE: o código das functions vive em /functions e precisa ser deployado
// com `firebase deploy --only functions`. Se não estiver deployado ainda, todas
// as chamadas aqui retornam um erro claro ("função não deployada").
//
// Os nomes precisam casar exatamente com os exports em /functions/src/index.ts.

import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from './firebase';
import type { AccessGeo, SignupRequest } from '../types';

// Região: us-central1 é o default do Firebase. Se mudar lá, muda aqui também.
const functions = getFunctions(firebaseApp, 'us-central1');

function mapFunctionError(e: unknown): string {
  if (!e || typeof e !== 'object') return 'Erro desconhecido.';
  const err = e as { code?: string; message?: string };
  switch (err.code) {
    case 'functions/not-found':
    case 'not-found':
      return 'Função ainda não foi deployada no Firebase. Roda `firebase deploy --only functions` (ou peça pra quem te chamou).';
    case 'functions/unauthenticated':
    case 'unauthenticated':
      return 'Você precisa estar logada pra fazer isso.';
    case 'functions/permission-denied':
    case 'permission-denied':
      return 'Sem permissão pra essa ação.';
    case 'functions/invalid-argument':
    case 'invalid-argument':
      return err.message || 'Dado inválido.';
    default:
      return err.message || 'Não consegui completar a operação.';
  }
}

// ---- redeemSignupCode --------------------------------------------------
// Usuária digita o código que o admin gerou. Server valida e flipa status=approved.
export async function redeemSignupCode(code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const fn = httpsCallable<{ code: string }, { ok: boolean }>(functions, 'redeemSignupCode');
    const res = await fn({ code: code.trim() });
    if (res.data?.ok) return { ok: true };
    return { ok: false, error: 'Código inválido ou expirado.' };
  } catch (e) {
    return { ok: false, error: mapFunctionError(e) };
  }
}

// ---- approveSignup (admin only) ---------------------------------------
// Gera código de aprovação pra uma solicitação. Retorna o código pro admin enviar.
export async function approveSignupAndGenerateCode(
  uid: string,
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  try {
    const fn = httpsCallable<{ uid: string }, { ok: boolean; code: string }>(
      functions,
      'approveSignup',
    );
    const res = await fn({ uid });
    if (res.data?.ok && res.data.code) return { ok: true, code: res.data.code };
    return { ok: false, error: 'Servidor não devolveu um código.' };
  } catch (e) {
    return { ok: false, error: mapFunctionError(e) };
  }
}

// ---- denySignup (admin only) ------------------------------------------
export async function denySignup(
  uid: string,
  reason?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const fn = httpsCallable<{ uid: string; reason?: string }, { ok: boolean }>(
      functions,
      'denySignup',
    );
    const res = await fn({ uid, reason });
    return res.data?.ok ? { ok: true } : { ok: false, error: 'Não foi possível negar.' };
  } catch (e) {
    return { ok: false, error: mapFunctionError(e) };
  }
}

// ---- createImpersonationToken (admin only) ----------------------------
// Retorna custom token pra admin logar como qualquer usuária. Cria também
// um access_log marcado como 'impersonate' no servidor.
export async function createImpersonationToken(
  uid: string,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  try {
    const fn = httpsCallable<{ uid: string }, { ok: boolean; token: string }>(
      functions,
      'createImpersonationToken',
    );
    const res = await fn({ uid });
    if (res.data?.ok && res.data.token) return { ok: true, token: res.data.token };
    return { ok: false, error: 'Não consegui gerar token.' };
  } catch (e) {
    return { ok: false, error: mapFunctionError(e) };
  }
}

// ---- logAccessReal (sobrescreve IP cliente com IP servidor) -----------
// Chamada após signin/signup pra reforçar o log com IP confiável do servidor.
// Se a função não existe, segue silenciosa — o log client-side já tá gravado.
export async function logAccessServerside(kind: 'signin' | 'signup' | 'session'): Promise<void> {
  try {
    const fn = httpsCallable<{ kind: string }, { ok: boolean }>(functions, 'logAccessReal');
    await fn({ kind });
  } catch {
    // ignore — best-effort
  }
}

// Re-export types pro UI.
export type { SignupRequest, AccessGeo };
