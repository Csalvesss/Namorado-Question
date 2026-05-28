import {
  BILHETES,
  GREETINGS,
  PERFORMANCE_QUOTES,
  type Bilhete,
} from '../data/bilhetes';

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

function bucket(now: number = Date.now()): number {
  return Math.floor(now / FIVE_HOURS_MS);
}

export function currentBilhete(now: number = Date.now()): Bilhete {
  if (BILHETES.length === 0) {
    return { id: 'empty', body: '', mood: 'amor' };
  }
  return BILHETES[bucket(now) % BILHETES.length];
}

export function currentGreeting(now: number = Date.now()): string {
  if (GREETINGS.length === 0) return '';
  return GREETINGS[bucket(now) % GREETINGS.length];
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
  now: number = Date.now(),
): string {
  const pool = PERFORMANCE_QUOTES[tier];
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
