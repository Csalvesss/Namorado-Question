import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { topicAccuracyColor, weakestTopics } from '../lib/analytics';
import { db } from '../lib/db';
import { modeConfig } from '../lib/quiz';
import { useSessions } from '../lib/useSessions';
import type { Question, QuizSession } from '../types';

const MONTHS_PT_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

function Sparkline({ values, width = 160, height = 44 }: SparklineProps) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 100);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const lastPoint = points.split(' ').pop()!;
  const [lx, ly] = lastPoint.split(',').map(Number);
  const areaPath = `M 0,${height} L ${points.replace(/ /g, ' L ')} L ${width},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height + 4}`}
      width={width}
      height={height + 4}
      aria-hidden
      className="overflow-visible"
    >
      <path d={areaPath} fill="#f3d9dd" opacity="0.5" />
      <polyline
        points={points}
        fill="none"
        stroke="#7a1f3d"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lx} cy={ly} r="2.5" fill="#7a1f3d" />
    </svg>
  );
}

interface RingProps {
  pct: number;
  size?: number;
  stroke?: number;
}

function Ring({ pct, size = 52, stroke = 4 }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = pct >= 80 ? '#4f6b4a' : pct >= 50 ? '#7a1f3d' : '#9a3a3a';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3d9dd" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="absolute font-serif text-xs font-semibold text-wine-deep">{pct}%</span>
    </div>
  );
}

function formatDay(d: Date): { day: string; month: string } {
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: MONTHS_PT_SHORT[d.getMonth()],
  };
}

export default function History() {
  const { sessions: allSessions } = useSessions();
  const sessions = useMemo(
    () => allSessions.filter((s) => s.completedAt),
    [allSessions],
  );

  const stats = useMemo(() => {
    const totalQuestions = sessions.reduce((acc, s) => acc + s.answers.length, 0);
    const totalRight = sessions.reduce(
      (acc, s) => acc + s.answers.filter((a) => a.isRight).length,
      0,
    );
    const accuracy = totalQuestions > 0 ? Math.round((totalRight / totalQuestions) * 100) : 0;
    const accuracies = [...sessions]
      .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
      .map((s: QuizSession) => Math.round((s.score / s.total) * 100));
    return { totalQuestions, totalRight, accuracy, accuracies };
  }, [sessions]);

  const weakSpots = useMemo(() => {
    if (sessions.length === 0) return [];
    const courses = db.courses.list();
    const questionsByCourse: Record<string, Question[]> = {};
    const courseTitles: Record<string, string> = {};
    courses.forEach((c) => {
      questionsByCourse[c.id] = db.questions.listByCourse(c.id);
      courseTitles[c.id] = c.title;
    });
    return weakestTopics(sessions, questionsByCourse, courseTitles, 3).slice(0, 8);
  }, [sessions]);

  return (
    <div className="space-y-10">
      <header>
        <div className="eyebrow-gold mb-3">seu progresso</div>
        <h1 className="display-title-sm">Histórico</h1>
        <p className="mt-3 max-w-xl font-serif text-lg italic leading-relaxed text-ink-soft">
          cada prova é um passo. aqui ficam guardadas as suas, na ordem da mais recente.
        </p>
      </header>

      {sessions.length === 0 ? (
        <EmptyState
          illustration="compass"
          title="Sem provas finalizadas ainda"
          description="O histórico aparece aqui depois da sua primeira prova. Cada uma marca o caminho."
          action={
            <Link to="/app" className="btn-primary">
              Estudar agora
            </Link>
          }
        />
      ) : (
        <>
          <section className="card grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center sm:gap-8 sm:px-7">
            <StatBlock label="provas realizadas" value={String(sessions.length)} />
            <StatBlock label="questões respondidas" value={String(stats.totalQuestions)} />
            <StatBlock label="acerto médio" value={`${stats.accuracy}%`} />
            {stats.accuracies.length >= 2 && (
              <div className="flex flex-col items-end">
                <Sparkline values={stats.accuracies} />
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted">
                  evolução por prova
                </div>
              </div>
            )}
          </section>

          {weakSpots.length > 0 && (
            <section>
              <div className="mb-5 flex items-baseline gap-3">
                <span className="font-serif text-3xl italic leading-none text-gold opacity-60">
                  II
                </span>
                <h2 className="font-serif text-2xl italic text-wine-deep">Pontos fracos</h2>
                <span className="ml-auto text-[11px] uppercase tracking-[0.22em] text-muted">
                  click leva ao modo erro do tópico
                </span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-ink-soft">
                Tópicos com menor acerto, ordenados pelo que mais precisa de revisão. Mínimo de 3
                tentativas para entrar nessa lista.
              </p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {weakSpots.map((w) => {
                  const color = topicAccuracyColor(w.accuracy, w.attempts);
                  return (
                    <li key={`${w.courseId}-${w.topic}`}>
                      <Link
                        to={`/quiz/${w.courseId}?mode=mistakes&topics=${encodeURIComponent(w.topic)}`}
                        className="card group flex items-center gap-4 p-4 transition active:scale-[0.99] hover:shadow-card-hover"
                      >
                        <span
                          aria-hidden
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-serif text-base font-semibold text-white"
                          style={{ backgroundColor: color }}
                        >
                          {w.accuracy}%
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-serif text-base italic text-wine-deep">
                            {w.topic}
                          </div>
                          <div className="mt-0.5 truncate text-[11px] uppercase tracking-[0.18em] text-muted">
                            {w.courseTitle} · {w.attempts} tentativas
                          </div>
                        </div>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-wine"
                          strokeWidth={1.75}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section>
            <div className="mb-5 flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl italic leading-none text-gold opacity-60">
                  {weakSpots.length > 0 ? 'III' : 'II'}
                </span>
                <h2 className="font-serif text-2xl italic text-wine-deep">Suas provas</h2>
              </div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                mais recentes primeiro
              </span>
            </div>

            <ul className="space-y-3">
              {sessions.map((s) => {
                const pct = Math.round((s.score / s.total) * 100);
                const cfg = modeConfig(s.mode);
                const date = new Date(s.completedAt ?? s.startedAt);
                const dur = s.durationMs ? Math.round(s.durationMs / 60000) : null;
                const { day, month } = formatDay(date);
                return (
                  <li
                    key={s.id}
                    className="card flex items-center gap-4 p-4 transition hover:shadow-card-hover sm:gap-6 sm:p-5"
                  >
                    <div className="flex shrink-0 flex-col items-center justify-center text-center font-serif text-wine-deep">
                      <span className="text-2xl font-semibold leading-none italic sm:text-3xl">
                        {day}
                      </span>
                      <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted">
                        {month}
                      </span>
                    </div>

                    <div className="hidden h-12 w-px shrink-0 bg-line sm:block" />

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-serif text-lg italic text-wine-deep sm:text-xl">
                        {s.courseTitle}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] uppercase tracking-[0.18em] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <cfg.Icon className="h-3 w-3 text-wine" strokeWidth={1.75} />
                          {cfg.label}
                        </span>
                        <span>·</span>
                        <span>
                          {date.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {dur !== null && (
                          <>
                            <span>·</span>
                            <span>{dur} min</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                      <div className="text-right">
                        <div className="font-serif text-2xl font-semibold leading-none text-wine-deep sm:text-3xl">
                          {s.score}
                          <span className="text-base text-muted"> / {s.total}</span>
                        </div>
                      </div>
                      <Ring pct={pct} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-serif text-3xl font-semibold leading-none text-wine-deep sm:text-4xl">
        {value}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted sm:text-[11px]">
        {label}
      </div>
    </div>
  );
}
