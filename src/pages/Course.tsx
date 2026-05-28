import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Brain,
  Bug,
  Dna,
  HeartPulse,
  Layers,
  Sparkles,
  Stethoscope,
  ThermometerSun,
  type LucideIcon,
} from 'lucide-react';
import BlueprintModal from '../components/BlueprintModal';
import SpringFlower from '../components/decorative/SpringFlower';
import { blueprintsForCourse } from '../data/blueprints';
import { db } from '../lib/db';
import { getMistakeQuestionIds, modeConfig } from '../lib/quiz';
import { useSessions } from '../lib/useSessions';
import { useUser } from '../lib/useUser';
import type { QuizMode } from '../types';

const COURSE_ICONS: Array<{ match: RegExp; icon: LucideIcon; module: string }> = [
  { match: /hiv|aids/i, icon: Dna, module: 'INFECTOLOGIA' },
  { match: /insuficiência|cardíaca|coração/i, icon: HeartPulse, module: 'CARDIOLOGIA' },
  { match: /meningites?/i, icon: Brain, module: 'NEUROLOGIA' },
  { match: /hipertensão|arterial/i, icon: HeartPulse, module: 'CARDIOLOGIA' },
  { match: /dengue|chikungunya|zika|oropouche|arbovirose/i, icon: Bug, module: 'INFECTOLOGIA' },
  { match: /febre amarela/i, icon: ThermometerSun, module: 'INFECTOLOGIA' },
  { match: /flashcard/i, icon: Layers, module: 'REVISÃO' },
  { match: /eletro|ecg/i, icon: Activity, module: 'CARDIOLOGIA' },
  { match: /caso|clínic/i, icon: Stethoscope, module: 'CLÍNICA' },
];

function metaForCourse(title: string): { icon: LucideIcon; module: string } {
  for (const { match, icon, module } of COURSE_ICONS) {
    if (match.test(title)) return { icon, module };
  }
  return { icon: BookOpen, module: 'GUAVA' };
}

export default function Course() {
  const { id = '' } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const course = useMemo(() => db.courses.get(id), [id]);
  const questions = useMemo(() => db.questions.listByCourse(id), [id]);
  const courses = useMemo(() => db.courses.list(), []);
  const courseIndex = useMemo(() => courses.findIndex((c) => c.id === id), [courses, id]);
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    questions.forEach((q) => counts.set(q.topic, (counts.get(q.topic) ?? 0) + 1));
    return Array.from(counts.entries()).map(([topic, count]) => ({ topic, count }));
  }, [questions]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [blueprintOpen, setBlueprintOpen] = useState(false);
  const hasBlueprint = useMemo(() => course ? blueprintsForCourse(course.title).length > 0 : false, [course]);
  const mistakeIds = useMemo(() => (user ? getMistakeQuestionIds(user.uid, id) : []), [user, id]);
  const caseCount = useMemo(() => questions.filter((q) => q.type === 'case').length, [questions]);
  const hasCases = caseCount > 0;
  const showBilheteMode = user?.displayMode !== 'doutora' && questions.length >= 6;
  const featuredModes: QuizMode[] = hasCases ? ['standard', 'clinical'] : ['standard', 'quick'];
  const compactModes: QuizMode[] = hasCases ? ['quick', 'marathon', 'timed'] : ['marathon', 'timed'];

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

  const { icon: CourseIcon, module: moduleLabel } = metaForCourse(course.title);
  const moduleNumber = courseIndex >= 0 ? String(courseIndex + 1).padStart(2, '0') : '01';
  const titleParts = course.title.split('/').map((s) => s.trim());

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
    <div className="space-y-12">
      <Link
        to="/app"
        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-wine"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={2} /> Voltar aos cursos
      </Link>

      <header className="relative grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <div className="eyebrow-gold">
            {moduleLabel} · módulo {moduleNumber}
          </div>
          <h1 className="mt-3 font-serif italic leading-[0.95] text-wine-deep">
            {titleParts.length > 1 ? (
              <>
                <span className="block text-[clamp(3rem,7vw,5rem)]">{titleParts[0]}</span>
                <span className="block text-[clamp(3rem,7vw,5rem)]">/ {titleParts.slice(1).join(' / ')}</span>
              </>
            ) : (
              <span className="block text-[clamp(3rem,7vw,5rem)]">{course.title}</span>
            )}
          </h1>
          <p className="mt-5 max-w-xl font-serif text-lg italic leading-relaxed text-ink-soft">
            {course.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="label-tag">{course.questionCount} questões no banco</span>
            <span className="label-tag">{course.topics.length} tópicos</span>
            {courseStats.attempts > 0 && (
              <>
                <span className="label-tag">{courseStats.accuracy} % acerto</span>
                <span className="label-tag">
                  {courseStats.attempts} tentativa{courseStats.attempts > 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
          {hasBlueprint && (
            <button
              type="button"
              onClick={() => setBlueprintOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold transition hover:bg-gold/20 active:scale-[0.98]"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
              resumo rápido do tópico
            </button>
          )}
        </div>

        <div className="relative flex items-center justify-center md:min-w-[180px]">
          <SpringFlower size={140} tone="rose" className="opacity-80" />
          <span
            aria-hidden
            className="absolute inset-0 flex items-end justify-center pb-4 font-serif text-[10px] italic lowercase tracking-[0.3em] text-wine"
          >
            {moduleLabel.toLowerCase()}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center text-wine-deep"
          >
            <CourseIcon className="h-7 w-7" strokeWidth={1.4} />
          </span>
        </div>
      </header>

      <hr className="border-line" />

      <section>
        <div className="mb-2 text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
          como você quer estudar
        </div>
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-[3.5rem] italic leading-none text-gold opacity-40">
              II
            </span>
            <h2 className="font-serif text-3xl italic text-wine-deep sm:text-4xl">
              Modos de estudo
            </h2>
          </div>
          <span className="text-[11px] italic text-muted">escolha um abaixo</span>
        </div>

        {showBilheteMode && (
          <button
            onClick={() => startQuiz('bilhete')}
            disabled={questions.length < 6}
            className="group relative mb-4 flex w-full items-stretch overflow-hidden rounded-3xl border border-rose bg-gradient-to-br from-paper via-rose-soft/40 to-rose-soft/70 p-6 text-left transition active:scale-[0.995] hover:shadow-card-hover sm:p-7"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-wine px-2.5 py-0.5 text-[10px] uppercase tracking-[0.22em] text-white">
                  novo
                </span>
                <span className="font-serif text-[10px] italic uppercase tracking-[0.28em] text-wine">
                  para os dias longos
                </span>
              </div>
              <h3 className="mt-3 font-serif text-3xl italic leading-tight text-wine-deep sm:text-4xl">
                Modo Bilhete
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft sm:text-[15px]">
                Uma prova com um bilhete carinhoso no meio do caminho. Mensagem fofa, dica de
                cuidado (água, descanso, alongar) e uma pausa para respirar antes de seguir.
              </p>
              <div className="mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted">
                <span>{Math.min(15, questions.length)} questões + um bilhete</span>
              </div>
            </div>
            <div className="relative hidden w-32 shrink-0 sm:block">
              <div className="absolute right-2 top-2 rotate-6 rounded-xl border border-line bg-paper-soft px-3 py-2 text-[10px] italic text-ink-soft shadow-soft">
                do seu namorado
              </div>
              <div className="absolute bottom-2 right-6 -rotate-3 rounded-xl border border-line bg-paper-soft px-3 py-2 font-hand text-base text-wine-deep shadow-soft">
                amor,
              </div>
            </div>
          </button>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featuredModes.map((m) => {
            const cfg = modeConfig(m);
            const isClinical = m === 'clinical';
            const displayCount = isClinical
              ? `${Math.min(cfg.count, caseCount)} casos`
              : `${cfg.count} questões`;
            return (
              <FeaturedModeCard
                key={m}
                Icon={cfg.Icon}
                title={cfg.label}
                description={cfg.description}
                count={displayCount}
                eyebrow={isClinical ? 'casos clínicos' : 'a recomendada'}
                tone={isClinical ? 'gold' : m === 'quick' ? 'plain' : 'highlight'}
                onClick={() => startQuiz(m)}
                disabled={isClinical ? caseCount < 1 : questions.length < 1}
              />
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {compactModes.map((m) => {
            const cfg = modeConfig(m);
            const eyebrow =
              m === 'marathon'
                ? 'treino longo'
                : m === 'timed'
                  ? 'cronometrado'
                  : m === 'quick'
                    ? 'rapidinho'
                    : '';
            return (
              <CompactModeCard
                key={m}
                Icon={cfg.Icon}
                title={cfg.label}
                description={cfg.description}
                count={`${cfg.count}`}
                eyebrow={eyebrow}
                onClick={() => startQuiz(m)}
                disabled={questions.length < 1}
              />
            );
          })}
          {(() => {
            const cfg = modeConfig('mistakes');
            const noMistakes = mistakeIds.length < 1;
            return (
              <CompactModeCard
                Icon={cfg.Icon}
                title={cfg.label}
                description={
                  noMistakes
                    ? 'Só as questões que você errou. Nenhuma disponível ainda.'
                    : `Só as questões que você errou. ${mistakeIds.length} disponíveis.`
                }
                count={String(mistakeIds.length)}
                eyebrow="só erros"
                onClick={() => startQuiz('mistakes')}
                disabled={noMistakes}
                striped={noMistakes}
              />
            );
          })()}
        </div>
      </section>

      {topics.length > 1 && (
        <section className="card p-6 sm:p-7">
          <div className="mb-2 text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
            refine se quiser
          </div>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl italic text-wine-deep sm:text-3xl">
              Filtrar por tópico
            </h2>
            {selectedTopics.length > 0 && (
              <button
                onClick={() => setSelectedTopics([])}
                className="btn-ghost text-xs uppercase tracking-wider"
              >
                Limpar
              </button>
            )}
          </div>
          <p className="mb-5 text-sm leading-relaxed text-ink-soft">
            Selecione um ou mais tópicos. Se nada estiver marcado, sorteio do banco inteiro.
          </p>
          <div className="flex flex-wrap gap-2">
            {topics.map(({ topic, count }) => {
              const active = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition active:scale-[0.98] ${
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

      <BlueprintModal
        open={blueprintOpen}
        courseTitle={course.title}
        onClose={() => setBlueprintOpen(false)}
      />
    </div>
  );
}

interface FeaturedModeCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  count: string;
  eyebrow?: string;
  tone?: 'highlight' | 'plain' | 'gold';
  onClick: () => void;
  disabled?: boolean;
}

function FeaturedModeCard({
  Icon,
  title,
  description,
  count,
  eyebrow = 'a recomendada',
  tone = 'highlight',
  onClick,
  disabled,
}: FeaturedModeCardProps) {
  const toneClasses =
    tone === 'highlight'
      ? 'border-rose bg-rose-soft/50 shadow-card hover:shadow-card-hover'
      : tone === 'gold'
        ? 'border-gold/60 bg-gradient-to-br from-paper to-gold/10 shadow-card hover:shadow-card-hover'
        : 'border-line bg-paper shadow-card hover:shadow-card-hover';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-2xl border p-6 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${toneClasses}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-serif text-[10px] italic lowercase tracking-[0.28em] text-wine">
            {eyebrow}
          </div>
          <h3 className="mt-2 font-serif text-3xl italic leading-tight text-wine-deep">{title}</h3>
        </div>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper/80 text-wine">
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </span>
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">{description}</p>
      <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
        <span className="text-[11px] uppercase tracking-[0.22em] text-muted">{count}</span>
      </div>
    </button>
  );
}

interface CompactModeCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  count: string;
  eyebrow?: string;
  onClick: () => void;
  disabled?: boolean;
  striped?: boolean;
}

function CompactModeCard({
  Icon,
  title,
  description,
  count,
  eyebrow,
  onClick,
  disabled,
  striped,
}: CompactModeCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-2xl border border-line p-5 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${
        striped
          ? 'bg-[repeating-linear-gradient(135deg,#fdf7f3_0px,#fdf7f3_10px,#f3d9dd_10px,#f3d9dd_11px)]'
          : 'bg-paper shadow-card hover:shadow-card-hover'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          {eyebrow && (
            <div className="font-serif text-[10px] italic lowercase tracking-[0.22em] text-wine">
              {eyebrow}
            </div>
          )}
          <h3 className="mt-1 font-serif text-xl italic leading-tight text-wine-deep">{title}</h3>
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-paper-soft text-wine">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
      </div>
      <p className="text-[13px] leading-relaxed text-ink-soft">{description}</p>
      <div className="mt-1 border-t border-line/60 pt-2 text-[11px] uppercase tracking-[0.22em] text-muted">
        <span>{count} {count === '1' ? 'questão' : 'questões'}</span>
      </div>
    </button>
  );
}
