import {
  BILHETES,
  BILHETES_DOUTORA,
  BILHETES_IRMAO,
  GREETINGS,
  GREETINGS_DOUTORA,
  PERFORMANCE_QUOTES,
  PERFORMANCE_QUOTES_DOUTORA,
  type Bilhete,
} from '../data/bilhetes';

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

function bucket(now: number = Date.now()): number {
  return Math.floor(now / FIVE_HOURS_MS);
}

export type Tone = 'namorado' | 'doutora' | 'irmao';

function poolFor(tone: Tone): Bilhete[] {
  if (tone === 'doutora') return BILHETES_DOUTORA;
  if (tone === 'irmao') return BILHETES_IRMAO;
  return BILHETES;
}

export function currentBilhete(tone: Tone = 'namorado', now: number = Date.now()): Bilhete {
  const pool = poolFor(tone);
  if (pool.length === 0) {
    return { id: 'empty', body: '', mood: 'amor' };
  }
  return pool[bucket(now) % pool.length];
}

export function currentGreeting(tone: Tone = 'namorado', now: number = Date.now()): string {
  // Modo doutora tem pool próprio; irmão e namorado compartilham (vibe afetiva)
  const pool = tone === 'doutora' ? GREETINGS_DOUTORA : GREETINGS;
  if (pool.length === 0) return '';
  return pool[bucket(now) % pool.length];
}

export type PerformanceTier = 'high' | 'mid' | 'low';

export function tierFromAccuracy(accuracy: number, samples: number): PerformanceTier {
  if (samples < 3) return 'mid';
  if (accuracy >= 75) return 'high';
  if (accuracy >= 55) return 'mid';
  return 'low';
}

export function currentPerformanceQuote(
  tier: PerformanceTier,
  tone: Tone = 'namorado',
  now: number = Date.now(),
): string {
  const quotes = tone === 'doutora' ? PERFORMANCE_QUOTES_DOUTORA : PERFORMANCE_QUOTES;
  const pool = quotes[tier];
  if (!pool || pool.length === 0) return '';
  return pool[bucket(now) % pool.length];
}

export function nextRotationIn(now: number = Date.now()): number {
  const next = (Math.floor(now / FIVE_HOURS_MS) + 1) * FIVE_HOURS_MS;
  return Math.max(0, next - now);
}

export function formatRotationCountdown(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}min`;
  return `${minutes} min`;
}
