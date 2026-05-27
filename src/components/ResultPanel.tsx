import { forwardRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Flame, Sparkles } from 'lucide-react';
import { getPhrases } from '../data/phrases';
import { duration, easeOutExpo } from '../lib/motion';
import type { PreparedQuestion } from '../lib/quiz';
import type { QuizSession } from '../types';

interface ResultPanelProps {
  session: QuizSession;
  questions: PreparedQuestion[];
  displayMode: 'namorado' | 'doutora';
}

export const ResultPanel = forwardRef<HTMLDivElement, ResultPanelProps>(function ResultPanel(
  { session, questions, displayMode },
  ref,
) {
  const pct = Math.round((session.score / session.total) * 100);
  const phrases = getPhrases(displayMode);
  const tier = pct >= 80 ? 'high' : pct >= 50 ? 'med' : 'low';
  const list = tier === 'high' ? phrases.finalHigh : tier === 'med' ? phrases.finalMed : phrases.finalLow;
  const praise = useMemo(() => list[Math.floor(Math.random() * list.length)], [list]);

  const { bestStreak, bestTopic, durationMin, durationSec } = useMemo(() => {
    let streak = 0;
    let max = 0;
    session.answers.forEach((a) => {
      if (a.isRight) {
        streak += 1;
        if (streak > max) max = streak;
      } else {
        streak = 0;
      }
    });

    const topicStats = new Map<string, { right: number; total: number }>();
    session.answers.forEach((a, i) => {
      const topic = questions[i]?.topic ?? '—';
      const t = topicStats.get(topic) ?? { right: 0, total: 0 };
      t.total += 1;
      if (a.isRight) t.right += 1;
      topicStats.set(topic, t);
    });

    type TopicScore = { topic: string; pct: number };
    const scored: TopicScore[] = [];
    topicStats.forEach((stat, topic) => {
      if (stat.total < 2) return;
      scored.push({ topic, pct: Math.round((stat.right / stat.total) * 100) });
    });
    const best = scored.reduce<TopicScore | null>(
      (acc, cur) => (!acc || cur.pct > acc.pct ? cur : acc),
      null,
    );

    const totalMs = session.durationMs ?? 0;
    return {
      bestStreak: max,
      bestTopic: best,
      durationMin: Math.floor(totalMs / 60000),
      durationSec: Math.floor((totalMs % 60000) / 1000),
    };
  }, [session, questions]);

  const accentClass =
    tier === 'high' ? 'text-wine-deep' : tier === 'med' ? 'text-wine' : 'text-ink-soft';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: duration.slow, ease: easeOutExpo }}
      className="relative overflow-hidden rounded-3xl border border-line bg-paper-soft px-5 py-8 text-center shadow-card sm:px-10 sm:py-12"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 select-none font-serif text-[260px] italic leading-none text-rose-soft/60 sm:text-[340px]"
      >
        G
      </span>

      <div className="relative">
        <div className="eyebrow-gold mb-2">Resultado da prova</div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: easeOutExpo, delay: 0.15 }}
          className={`font-serif text-[5.5rem] font-semibold leading-none sm:text-[7rem] ${accentClass}`}
        >
          {session.score}
          <span className="text-3xl font-normal text-muted sm:text-4xl"> / {session.total}</span>
        </motion.div>
        <div className="mt-1 font-serif text-xl italic text-ink-soft">{pct} por cento de acerto</div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: easeOutExpo, delay: 0.3 }}
          className="mx-auto mt-6 max-w-md font-serif text-2xl italic leading-snug text-wine-deep sm:text-3xl"
        >
          {praise}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: easeOutExpo, delay: 0.45 }}
          className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3 border-t border-line pt-6 sm:gap-4"
        >
          <MiniStat
            Icon={Clock3}
            label="tempo"
            value={durationMin > 0 ? `${durationMin}m ${String(durationSec).padStart(2, '0')}s` : `${durationSec}s`}
          />
          <MiniStat
            Icon={Flame}
            label="melhor sequência"
            value={bestStreak > 0 ? `${bestStreak}` : '—'}
          />
          <MiniStat
            Icon={Sparkles}
            label="mais forte"
            value={bestTopic ? `${bestTopic.pct}%` : '—'}
            sub={bestTopic?.topic}
          />
        </motion.div>

        <p className="mx-auto mt-6 max-w-md text-sm italic text-ink-soft">
          Olha a explicação de cada questão logo abaixo. Quando quiser, refaz a prova que eu sorteio outras questões.
        </p>
      </div>
    </motion.div>
  );
});

interface MiniStatProps {
  Icon: typeof Clock3;
  label: string;
  value: string;
  sub?: string;
}

function MiniStat({ Icon, label, value, sub }: MiniStatProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon className="mb-1.5 h-4 w-4 text-wine" strokeWidth={1.75} />
      <div className="font-serif text-2xl font-semibold leading-none text-wine-deep sm:text-3xl">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted">{label}</div>
      {sub && <div className="mt-0.5 max-w-[110px] truncate text-[11px] italic text-ink-soft">{sub}</div>}
    </div>
  );
}
