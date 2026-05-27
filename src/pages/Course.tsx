import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { db } from '../lib/db';
import { getMistakeQuestionIds, modeConfig } from '../lib/quiz';
import { useUser } from '../lib/useUser';
import type { QuizMode } from '../types';

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

  if (!course) {
    return (
      <div className="card p-10 text-center">
        <p className="font-serif text-xl italic text-ink-soft">Curso não encontrado.</p>
        <Link to="/app" className="btn-secondary mt-4 inline-block">Voltar</Link>
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
    <div className="space-y-8">
      <Link to="/app" className="btn-ghost -ml-2 text-xs uppercase tracking-wider">
        ← Voltar
      </Link>

      <header className="text-center">
        <div className="mb-3 text-5xl sm:text-6xl">{course.icon}</div>
        <h1 className="display-title-sm">{course.title}</h1>
        <p className="mt-3 mx-auto max-w-xl font-serif text-lg italic leading-relaxed text-ink-soft">
          {course.description}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <span className="label-tag">{course.questionCount} questões no banco</span>
        </div>
      </header>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 font-serif text-xl italic text-wine-deep">Modos de estudo</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(['standard', 'quick', 'marathon', 'timed'] as QuizMode[]).map((m) => {
            const cfg = modeConfig(m);
            return (
              <ModeCard
                key={m}
                Icon={cfg.Icon}
                title={cfg.label}
                description={cfg.description}
                onClick={() => startQuiz(m)}
                disabled={questions.length < 1}
              />
            );
          })}
          {(() => {
            const cfg = modeConfig('mistakes');
            return (
              <ModeCard
                Icon={cfg.Icon}
                title={cfg.label}
                description={`Só as questões que você errou (${mistakeIds.length} disponíveis).`}
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
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl italic text-wine-deep">Filtrar por tópico</h2>
            {selectedTopics.length > 0 && (
              <button onClick={() => setSelectedTopics([])} className="btn-ghost text-xs uppercase tracking-wider">
                Limpar
              </button>
            )}
          </div>
          <p className="mb-4 text-sm text-ink-soft">
            Selecione um ou mais tópicos. Se nada estiver selecionado, sorteio de todos.
          </p>
          <div className="flex flex-wrap gap-2">
            {topics.map(({ topic, count }) => {
              const active = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`inline-flex min-h-[36px] items-center rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wider transition active:scale-[0.98] ${
                    active
                      ? 'border-wine bg-rose-soft text-wine-deep'
                      : 'border-line bg-paper text-ink-soft hover:border-rose'
                  }`}
                >
                  {topic} · {count}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

interface ModeCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}

function ModeCard({ Icon, title, description, onClick, disabled, highlight }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group min-h-touch rounded-xl border p-5 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${
        highlight
          ? 'border-rose bg-rose-soft/30 hover:bg-rose-soft'
          : 'border-line bg-bg-soft hover:border-wine hover:bg-paper'
      }`}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
            highlight ? 'bg-rose-soft text-wine-deep' : 'bg-paper text-wine group-hover:bg-rose-soft'
          }`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
        <h3 className="font-serif text-lg italic text-wine-deep">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">{description}</p>
    </button>
  );
}
