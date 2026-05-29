import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import BilheteFocus from '../components/BilheteFocus';
import Eyebrow from '../components/ui/Eyebrow';
import NoteCard from '../components/NoteCard';
import {
  BILHETES,
  BILHETES_IRMAO,
  type Bilhete,
} from '../data/bilhetes';
import {
  currentBilhete,
  formatRotationCountdown,
  nextRotationIn,
  type Tone,
} from '../lib/bilhete';
import { useUser } from '../lib/useUser';

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const FEED_SIZE = 6;

function bucketIndex(now: number) {
  return Math.floor(now / FIVE_HOURS_MS);
}

function timeLabelFor(date: Date, idx: number): string {
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  if (idx === 0) return 'há poucos minutos';
  if (isToday) return `hoje, ${hh}:${mm}`;
  if (isYesterday) return `ontem, ${hh}:${mm}`;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}, ${hh}:${mm}`;
}

interface FeedItem {
  bilhete: Bilhete;
  timeLabel: string;
}

function buildFeed(tone: Tone, now: number = Date.now()): FeedItem[] {
  const pool = tone === 'irmao' ? BILHETES_IRMAO : BILHETES;
  if (pool.length === 0) return [];
  const baseBucket = bucketIndex(now);
  const out: FeedItem[] = [];
  for (let i = 0; i < FEED_SIZE; i++) {
    const b = pool[(baseBucket - i + pool.length * 100) % pool.length];
    const ts = (baseBucket - i) * FIVE_HOURS_MS;
    out.push({ bilhete: b, timeLabel: timeLabelFor(new Date(ts), i) });
  }
  return out;
}

export default function Bilhetes() {
  const { user, loading } = useUser();
  const [rotationTick, setRotationTick] = useState(0);
  const [focusBilhete, setFocusBilhete] = useState<Bilhete | null>(null);

  const tone: Tone =
    user?.displayMode === 'irmao' ? 'irmao' : user?.displayMode === 'doutora' ? 'doutora' : 'namorado';

  useEffect(() => {
    const delay = nextRotationIn();
    const timer = setTimeout(() => setRotationTick((t) => t + 1), delay + 1000);
    return () => clearTimeout(timer);
  }, [rotationTick]);

  const feed = useMemo(() => buildFeed(tone), [rotationTick, tone]);
  const current = useMemo(() => currentBilhete(tone), [rotationTick, tone]);
  const nextIn = useMemo(() => formatRotationCountdown(nextRotationIn()), [rotationTick]);

  if (loading) return null;
  if (user?.displayMode === 'doutora') {
    return <Navigate to="/app" replace />;
  }

  const isIrmao = user?.displayMode === 'irmao';
  const partner = isIrmao
    ? user?.partnerName?.trim() || 'irmão'
    : user?.partnerName?.trim() || 'César';

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-10 sm:py-20 lg:px-20">
        <Eyebrow>a cada 5 horas</Eyebrow>

        <h1 className="mt-4 font-display font-light leading-[1.05] text-ink text-[clamp(2.5rem,7vw,4.5rem)]">
          Bilhetes
        </h1>
        <p className="mt-4 max-w-xl font-body text-lg italic leading-relaxed text-mute">
          {isIrmao
            ? 'recados do irmão chato que torce de verdade. rolam a cada 5 horas.'
            : 'recados do seu namorado para te dar forças, doutora.'}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {feed.map((item, i) => (
            <NoteCard
              key={`${item.bilhete.id}-${i}`}
              body={item.bilhete.body}
              timeLabel={item.timeLabel}
              signature={partner}
              highlighted={i % 2 === 0}
              onClick={
                item.bilhete.id === current.id
                  ? () => setFocusBilhete(item.bilhete)
                  : undefined
              }
            />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 font-display text-[11px] uppercase tracking-[0.22em] text-mute">
          <span>novo em {nextIn}</span>
          {!isIrmao && (!user?.partnerName || user.partnerName.trim() === '') && (
            <Link to="/perfil" className="italic text-wine hover:text-[#5A0F22]">
              configurar nome do namorado
            </Link>
          )}
        </div>
      </div>

      <BilheteFocus
        open={focusBilhete !== null}
        bilhete={focusBilhete}
        signature={partner}
        uid={user?.uid}
        onClose={() => setFocusBilhete(null)}
      />
    </section>
  );
}
