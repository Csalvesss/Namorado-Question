import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { db } from '../lib/db';
import { getMistakeQuestionIds, modeConfig } from '../lib/quiz';
import { useSessions } from '../lib/useSessions';
import { useUser } from '../lib/useUser';
import type { QuizMode } from '../types';

const FEATURED_BASE: QuizMode[] = ['standard', 'quick'];
const COMPACT_BASE: QuizMode[] = ['marathon', 'timed'];

export default function Course() {
  const { id = '' } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const course = useMemo(() => db.courses.get(id), [id]);
  const questions = useMemo(() => db.questions.listByCourse(id), [id]);
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    questions.forEach((q) => counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1));
    return Array.from(counts.entries()).map(([topic, count]) => ({ topic, count }));
  }, [questions]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const mistakeIds = useMemo(() => (user ? getMistakeQuestionIds(user.uid, id) : []), [user, id]);
  const caseCount = useMemo(() => questions.filter((q) => q.type === 'case').length, [questions]);
  const hasCases = caseCount > 0;
  const featuredModes: QuizMode[] = hasCases ? ['standard', 'clinical'] : FEATURED_BASE;
  const compactModes: QuizMode[] = hasCases ? ['quick', 'marathon', 'timed'] : COMPACT_BASE;

  const { sessions: allSessions } = useSessions();
  const courseStats = useMemo(() => {
    const sessions = allSessions.filter((s) => s.courseId === id && s.completedAt);
    const totalQ = sessions.reduce((acc, s) => acc + s.answers.length, 0);
    const totalRight = sessions.reduce(
      (acc, s) => acc + s.answers.filter((a) => a.isRight).length,
      0,
    );
    return {
      attempts: sessions.length,
      accuracy: totalQ > 0 ? Math.round((totalRight / totalQ) * 100) : 0,
    };
  }, [allSessions, id]);

  if (!course) {
    return (
      <div className="card p-10 text-center">
        <p className="font-serif text-xl italic text-ink-soft">Curso não encontrado.</p>
        <Link to="/app" className="btn-secondary mt-4 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  function toggleTopic(topic: string) {
    setSelectedTopics((cur) =>
      cur.includes(topic) ? cur.filter((t) => t !== topic) : [...cur, topic],
    );
  }

  function startQuiz(mode: QuizMode) {
    if (!course) return;
    const params = new URLSearchParams({ mode });
    if (selectedTopics.length > 0) params.set('topics', selectedTopics.join(','));
    navigate(`/quiz/${course.id}?${params.toString()}`);
  }

  return (
    <div className="space-y-10">
      <Link
        to="/app"
        className="inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-wine"
      >
        ← Voltar aos cursos
      </Link>

      <header>
        <div className="eyebrow-gold mb-3">Módulo de estudo</div>
        <h1 className="display-title-sm">{course.title}</h1>
        <p className="mt-4 max-w-2xl font-serif text-lg italic leading-relaxed text-ink-soft">
          {course.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          <span className="label-tag">{course.questionCount} questões no banco</span>
          <span className="label-tag">{course.topics.length} tópicos</span>
          {courseStats.attempts > 0 && (
            <>
              <span className="label-tag">{courseStats.accuracy}% acerto</span>
              <span className="label-tag">
                {courseStats.attempts} tentativa{courseStats.attempts > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </header>

      <section>
        <div className="mb-5 flex items-baseline gap-3">
          <span className="font-serif text-3xl italic leading-none text-gold opacity-60">II</span>
          <h2 className="font-serif text-2xl italic text-wine-deep">Modos de estudo</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featuredModes.map((m) => {
            const cfg = modeConfig(m);
            const isClinical = m === 'clinical';
            const displayCount = isClinical
              ? `${Math.min(cfg.count, caseCount)} casos`
              : `${cfg.count} questões`;
            const description = isClinical
              ? `${cfg.description} ${caseCount} caso${caseCount > 1 ? 's' : ''} no banco.`
              : cfg.description;
            return (
              <FeaturedModeCard
                key={m}
                Icon={cfg.Icon}
                title={cfg.label}
                description={description}
                count={displayCount}
                onClick={() => startQuiz(m)}
                disabled={isClinical ? caseCount < 1 : questions.length < 1}
                eyebrow={isClinical ? 'Casos clínicos' : 'Recomendado'}
              />
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {compactModes.map((m) => {
            const cfg = modeConfig(m);
            return (
              <CompactModeCard
                key={m}
                Icon={cfg.Icon}
                title={cfg.label}
                description={cfg.description}
                count={`${cfg.count}`}
                onClick={() => startQuiz(m)}
                disabled={questions.length < 1}
              />
            );
          })}
          {(() => {
            const cfg = modeConfig('mistakes');
            return (
              <CompactModeCard
                Icon={cfg.Icon}
                title={cfg.label}
                description={`Só as questões que você errou (${mistakeIds.length} disponíveis).`}
                count={String(mistakeIds.length)}
                onClick={() => startQuiz('mistakes')}
                disabled={mistakeIds.length < 1}
                highlight
              />
            );
          })()}
        </div>
      </section>

      {topics.length > 1 && (
        <section className="card p-6">
          <div className="mb-3 flex items-baseline gap-3">
            <span className="font-serif text-2xl italic leading-none text-gold opacity-60">III</span>
            <h2 className="font-serif text-2xl italic text-wine-deep">Filtrar por tópico</h2>
            {selectedTopics.length > 0 && (
              <button
                onClick={() => setSelectedTopics([])}
                className="ml-auto btn-ghost text-xs uppercase tracking-wider"
              >
                Limpar
              </button>
            )}
          </div>
          <p className="mb-4 text-sm leading-relaxed text-ink-soft">
            Selecione um ou mais tópicos. Sem seleção, sorteio de todos.
          </p>
          <div className="flex flex-wrap gap-2">
            {topics.map(({ topic, count }) => {
              const active = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wider transition active:scale-[0.98] ${
                    active
                      ? 'border-wine bg-wine text-white'
                      : 'border-line bg-paper text-ink-soft hover:border-rose'
                  }`}
                >
                  {topic}
                  <span className={active ? 'text-rose-soft' : 'text-muted'}>· {count}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

interface FeaturedModeCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  count: string;
  onClick: () => void;
  disabled?: boolean;
  eyebrow?: string;
}

function FeaturedModeCard({
  Icon,
  title,
  description,
  count,
  onClick,
  disabled,
  eyebrow = 'Recomendado',
}: FeaturedModeCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="card group relative flex min-h-[180px] flex-col justify-between overflow-hidden p-6 text-left transition active:scale-[0.99] hover:shadow-card-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-soft transition group-hover:bg-wine" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow-gold mb-2">{eyebrow}</div>
          <h3 className="font-serif text-2xl italic leading-tight text-wine-deep">{title}</h3>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-soft text-wine-deep">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">{description}</p>
      <div className="flex items-center justify-between border-t border-line pt-3">
        <span className="text-[11px] uppercase tracking-[0.22em] text-muted">{count}</span>
        <ArrowRight
          className="h-4 w-4 translate-x-0 text-wine transition group-hover:translate-x-1"
          strokeWidth={2}
        />
      </div>
    </button>
  );
}

interface CompactModeCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  count: string;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}

function CompactModeCard({
  Icon,
  title,
  description,
  count,
  onClick,
  disabled,
  highlight,
}: CompactModeCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group min-h-touch rounded-xl border p-4 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${
        highlight
          ? 'border-rose bg-rose-soft/40 hover:bg-rose-soft'
          : 'border-line bg-bg-soft hover:border-wine hover:bg-paper'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
            highlight ? 'bg-paper text-wine-deep' : 'bg-paper text-wine'
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted">{count}</span>
      </div>
      <h3 className="mb-1 font-serif text-lg italic leading-tight text-wine-deep">{title}</h3>
      <p className="text-[13px] leading-relaxed text-ink-soft">{description}</p>
    </button>
  );
}
