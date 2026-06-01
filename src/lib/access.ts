// Captura de IP + geolocalização (client-side, best-effort).
//
// Por que client-side: o app não tem backend ainda. Esse módulo é uma camada
// "informativa" de auditoria. NÃO é fonte de verdade pra anti-fraude — qualquer
// usuário técnico consegue spoofar o IP enviado por aqui. Quando subirmos as
// Cloud Functions, elas vão sobrescrever esses campos no servidor a partir do
// `request.ip` real (que é confiável). Até lá, isso aqui já serve pra:
//
//   - Ver de onde geralmente as pessoas acessam
//   - Detectar acessos óbvios de localizações estranhas
//
// Provedor: ipapi.co (HTTPS, sem chave, ~1000 req/dia grátis). Se cair, o app
// segue sem geo — só grava `ip: undefined` e segue a vida.

import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { AccessGeo } from '../types';

interface IpapiResponse {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  org?: string;
  timezone?: string;
  error?: boolean;
  reason?: string;
}

let cachedLookup: Promise<{ ip?: string; geo?: AccessGeo }> | null = null;

async function fetchIpGeo(): Promise<{ ip?: string; geo?: AccessGeo }> {
  if (cachedLookup) return cachedLookup;
  cachedLookup = (async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const resp = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timer);
      if (!resp.ok) return {};
      const data = (await resp.json()) as IpapiResponse;
      if (data.error) return {};
      const geo: AccessGeo = {
        city: data.city,
        region: data.region,
        country: data.country_name,
        countryCode: data.country_code,
        lat: data.latitude,
        lon: data.longitude,
        org: data.org,
        timezone: data.timezone,
      };
      return { ip: data.ip, geo };
    } catch {
      return {};
    }
  })();
  return cachedLookup;
}

export interface AccessRecordInput {
  uid: string;
  email: string;
  kind: 'signin' | 'signup' | 'session' | 'impersonate';
  impersonatedBy?: string;
}

/**
 * Grava um log de acesso em /access_logs. Best-effort: falhas são swallow.
 */
export async function recordAccess(input: AccessRecordInput): Promise<void> {
  const { ip, geo } = await fetchIpGeo();
  const payload = {
    uid: input.uid,
    email: input.email,
    kind: input.kind,
    when: Date.now(),
    whenServer: serverTimestamp(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    ...(ip ? { ip } : {}),
    ...(geo ? { geo } : {}),
    ...(input.impersonatedBy ? { impersonatedBy: input.impersonatedBy } : {}),
  };
  await addDoc(collection(firestore, 'access_logs'), payload);
}

export interface SignupRecordInput {
  uid: string;
  email: string;
  name: string;
}

/**
 * Cria um doc em /signup_requests/{uid} com info de IP/geo pra o admin avaliar.
 * Usa o próprio uid como ID do doc — assim novo cadastro mesmo email sobrescreve,
 * e a rule fica simples (cada usuário só vê/cria a sua).
 */
export async function recordSignupRequest(input: SignupRecordInput): Promise<void> {
  const { ip, geo } = await fetchIpGeo();
  const ref = doc(firestore, 'signup_requests', input.uid);
  await setDoc(ref, {
    uid: input.uid,
    email: input.email,
    name: input.name,
    status: 'pending',
    requestedAt: Date.now(),
    requestedAtServer: serverTimestamp(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    ...(ip ? { ip } : {}),
    ...(geo ? { geo } : {}),
  });
  // Também grava no log geral pro histórico unificado.
  try {
    await recordAccess({ uid: input.uid, email: input.email, kind: 'signup' });
  } catch (err) {
    console.warn('[access] recordAccess(signup) falhou:', err);
  }
}
