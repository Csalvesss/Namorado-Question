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
import IconChip from '../components/ui/IconChip';
import Eyebrow from '../components/ui/Eyebrow';
import TopicRow from '../components/TopicRow';
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

const CHAPTER_ORDER = ['UM', 'DOIS', 'TRÊS', 'QUATRO', 'CINCO', 'SEIS', 'SETE', 'OITO', 'NOVE', 'DEZ'];

export default function Course() {
  const { id = '' } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const course = useMemo(() => db.courses.get(id), [id]);
  const questions = useMemo(() => db.questions.listByCourse(id), [id]);
  const courses = useMemo(() => db.courses.list(), []);
  const courseIndex = useMemo(() => courses.findIndex((c) => c.id === id), [courses, id]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [blueprintOpen, setBlueprintOpen] = useState(false);
  const hasBlueprint = useMemo(
    () => (course ? blueprintsForCourse(course.title).length > 0 : false),
    [course],
  );
  const mistakeIds = useMemo(() => (user ? getMistakeQuestionIds(user.uid, id) : []), [user, id]);
  const caseCount = useMemo(() => questions.filter((q) => q.type === 'case').length, [questions]);
  const hasCases = caseCount > 0;
  const showBilheteMode = user?.displayMode !== 'doutora' && questions.length >= 6;

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

  // Tópicos com contagem e status
  const topicData = useMemo(() => {
    if (!course) return [];
    const qsByTopic = new Map<string, number>();
    questions.forEach((q) => qsByTopic.set(q.topic, (qsByTopic.get(q.topic) ?? 0) + 1));

    const topicAnswers = new Map<string, { right: number; total: number }>();
    allSessions
      .filter((s) => s.courseId === id && s.completedAt)
      .forEach((s) => {
        s.answers.forEach((a) => {
          const q = questions.find((x) => x.id === a.questionId);
          if (!q) return;
          const cur = topicAnswers.get(q.topic) ?? { right: 0, total: 0 };
          cur.total += 1;
          if (a.isRight) cur.right += 1;
          topicAnswers.set(q.topic, cur);
        });
      });

    return course.topics.map((topic) => {
      const total = qsByTopic.get(topic) ?? 0;
      const answers = topicAnswers.get(topic);
      let status: 'done' | 'in-progress' | 'todo' = 'todo';
      if (answers) {
        if (answers.total >= total && total > 0) status = 'done';
        else if (answers.total > 0) status = 'in-progress';
      }
      return { topic, count: total, status };
    });
  }, [course, questions, allSessions, id]);

  const completedTopics = topicData.filter((t) => t.status === 'done').length;
  const totalTopics = topicData.length;
  const completionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (!course) {
    return (
      <section className="bg-paper">
        <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center sm:px-10">
          <p className="font-display text-xl italic text-mute">Curso não encontrado.</p>
          <Link to="/cursos" className="btn-ghost mt-6 inline-flex">
            voltar
          </Link>
        </div>
      </section>
    );
  }

  const { icon: CourseIcon, module: moduleLabel } = metaForCourse(course.title);
  const chapterWord = CHAPTER_ORDER[Math.max(0, courseIndex)] ?? 'UM';

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
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16 lg:px-20">
        {/* Voltar */}
        <Link
          to="/cursos"
          className="inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.22em] text-mute transition hover:text-wine"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} /> voltar para cursos
        </Link>

        {/* Header card */}
        <div className="card mt-6 p-8 sm:p-10">
          <div className="flex items-start gap-5">
            <IconChip icon={CourseIcon} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="font-display text-[11px] uppercase tracking-[0.22em] text-gold">
                {moduleLabel} · capítulo {chapterWord.toLowerCase()}
              </div>
              <h1 className="mt-3 font-display text-[clamp(2.25rem,5vw,3.25rem)] italic leading-[1.05] text-ink">
                {course.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 font-display text-[11px] uppercase tracking-[0.2em] text-mute">
                <span>· {course.questionCount} questões</span>
                <span>· {course.topics.length} tópicos</span>
                {courseStats.attempts > 0 && <span>· {courseStats.accuracy}% acerto</span>}
              </div>

              {/* Progress bar */}
              {totalTopics > 0 && (
                <div className="mt-6">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-blush">
                    <div
                      className="h-full rounded-full bg-wine transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <div className="mt-2 font-display text-[11px] uppercase tracking-[0.2em] text-mute">
                    {completedTopics} de {totalTopics} tópicos concluídos · {completionPct}%
                  </div>
                </div>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => startQuiz('standard')}
                  disabled={questions.length < 1}
                  className="btn-primary"
                >
                  iniciar questões
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/intercalado')}
                  className="btn-ghost"
                >
                  modo intercalado
                </button>
                {hasBlueprint && (
                  <button
                    type="button"
                    onClick={() => setBlueprintOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-5 py-2 font-display text-[13px] italic text-gold transition hover:bg-blush"
                  >
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                    resumo rápido
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tópicos */}
        {topicData.length > 0 && (
          <div className="card mt-6 p-8 sm:p-10">
            <Eyebrow>tópicos</Eyebrow>
            <div className="mt-5">
              {topicData.map((t, idx) => (
                <TopicRow
                  key={t.topic}
                  number={idx + 1}
                  title={t.topic}
                  questionCount={t.count}
                  status={t.status}
                />
              ))}
            </div>

            {topicData.length > 1 && (
              <div className="mt-7 border-t border-line pt-6">
                <p className="mb-3 font-display text-[11px] uppercase tracking-[0.2em] text-mute">
                  filtrar quiz por tópico
                </p>
                <div className="flex flex-wrap gap-2">
                  {topicData.map(({ topic, count }) => {
                    const active = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-display text-[13px] italic transition active:scale-[0.97] ${
                          active
                            ? 'border-wine bg-wine text-[#FBEFEC]'
                            : 'border-line bg-card text-mute hover:border-wine/40 hover:text-wine'
                        }`}
                      >
                        {topic}
                        <span className={active ? 'text-blush' : 'text-mute/70'}>· {count}</span>
                      </button>
                    );
                  })}
                  {selectedTopics.length > 0 && (
                    <button
                      onClick={() => setSelectedTopics([])}
                      className="font-display text-[12px] italic text-mute underline-offset-4 hover:text-wine hover:underline"
                    >
                      limpar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Outros modos de estudo (preservando funcionalidade) */}
        <div className="card mt-6 p-8 sm:p-10">
          <Eyebrow>outros modos de estudo</Eyebrow>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(showBilheteMode ? (['bilhete', 'quick', 'marathon', 'timed', 'mistakes', 'clinical'] as QuizMode[]) : (['quick', 'marathon', 'timed', 'mistakes', 'clinical'] as QuizMode[]))
              .filter((m) => (m === 'clinical' ? hasCases : true))
              .map((m) => {
                const cfg = modeConfig(m);
                const noMistakes = m === 'mistakes' && mistakeIds.length < 1;
                const disabled = noMistakes || questions.length < 1;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => startQuiz(m)}
                    disabled={disabled}
                    className="group flex items-start gap-3 rounded-2xl border border-line bg-card p-5 text-left shadow-soft transition active:scale-[0.99] hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IconChip icon={cfg.Icon} size="sm" />
                    <div className="min-w-0">
                      <h3 className="font-display text-lg italic text-ink">{cfg.label}</h3>
                      <p className="mt-1 font-body text-[13px] italic leading-relaxed text-mute">
                        {cfg.description}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      <BlueprintModal
        open={blueprintOpen}
        courseTitle={course.title}
        onClose={() => setBlueprintOpen(false)}
      />
    </section>
  );
}
