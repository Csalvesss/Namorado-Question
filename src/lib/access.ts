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

// Dedupe: evita gravar a mesma tela duas vezes seguidas (StrictMode remonta o
// efeito; re-renders disparam o mesmo path). Só regrava se a tela mudou ou se
// passou tempo suficiente pra contar como uma nova visita.
let lastPageview: { path: string; at: number } | null = null;
const PAGEVIEW_DEDUPE_MS = 3000;

export interface PageViewInput {
  uid: string;
  email: string;
  path: string;
  screen: string;
  /** e-mail do admin, se a sessão atual for uma impersonação. */
  impersonatedBy?: string;
}

/**
 * Grava uma visita de tela em /access_logs (kind='pageview'). Best-effort e
 * barato: NÃO busca IP/geo por navegação (a localização já fica no log de
 * signin) — só registra quem, quando e qual tela. Falhas são silenciosas.
 */
export async function recordPageView(input: PageViewInput): Promise<void> {
  const now = Date.now();
  if (
    lastPageview &&
    lastPageview.path === input.path &&
    now - lastPageview.at < PAGEVIEW_DEDUPE_MS
  ) {
    return;
  }
  lastPageview = { path: input.path, at: now };
  try {
    await addDoc(collection(firestore, 'access_logs'), {
      uid: input.uid,
      email: input.email,
      kind: 'pageview',
      path: input.path,
      screen: input.screen,
      when: now,
      whenServer: serverTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...(input.impersonatedBy ? { impersonatedBy: input.impersonatedBy } : {}),
    });
  } catch (err) {
    // Telemetria de navegação não pode quebrar a navegação. Loga e segue.
    console.warn('[access] recordPageView falhou:', err);
  }
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
