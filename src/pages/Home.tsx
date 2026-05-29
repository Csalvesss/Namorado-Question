import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Brain,
  Bug,
  Dna,
  HeartPulse,
  Layers,
  Mail,
  Siren,
  Stethoscope,
  ThermometerSun,
  type LucideIcon,
} from 'lucide-react';
import Onboarding from '../components/Onboarding';
import IconChip from '../components/ui/IconChip';
import Eyebrow from '../components/ui/Eyebrow';
import { COURSES_CHANGE_EVENT, db } from '../lib/db';
import { listDueCards, SRS_CHANGE_EVENT } from '../lib/srs';
import { useSessions } from '../lib/useSessions';
import { useUser } from '../lib/useUser';
import type { Course, FlashcardQuestion, QuizSession } from '../types';

const WEEKDAYS_PT_UP = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const MONTHS_PT_UP = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function greetingByHour(hour: number): string {
  if (hour < 5) return 'boa madrugada';
  if (hour < 12) return 'bom dia';
  if (hour < 18) return 'boa tarde';
  return 'boa noite';
}

function formatEditionDate(d: Date): string {
  return `${WEEKDAYS_PT_UP[d.getDay()]} · ${d.getDate()} ${MONTHS_PT_UP[d.getMonth()]} · ${d.getFullYear()}`;
}

const COURSE_ICONS: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /hiv|aids/i, icon: Dna },
  { match: /insuficiência|cardíaca|coração/i, icon: HeartPulse },
  { match: /meningites?/i, icon: Brain },
  { match: /hipertensão|arterial/i, icon: HeartPulse },
  { match: /dengue|chikungunya|zika|oropouche|arbovirose/i, icon: Bug },
  { match: /febre amarela/i, icon: ThermometerSun },
  { match: /flashcard/i, icon: Layers },
  { match: /eletro|ecg/i, icon: Activity },
  { match: /caso|clínic/i, icon: Stethoscope },
];

function iconForCourse(title: string): LucideIcon {
  for (const { match, icon } of COURSE_ICONS) {
    if (match.test(title)) return icon;
  }
  return BookOpen;
}

function lastCourseFromSessions(sessions: QuizSession[], courses: Course[]): Course | null {
  for (const s of sessions) {
    const c = courses.find((c) => c.id === s.courseId);
    if (c) return c;
  }
  return null;
}

function questionsDoneToday(sessions: QuizSession[]): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startMs = start.getTime();
  return sessions
    .filter((s) => (s.completedAt ?? s.startedAt) >= startMs)
    .reduce((acc, s) => acc + s.answers.length, 0);
}

function streakDays(sessions: QuizSession[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set<string>();
  sessions.forEach((s) => {
    const d = new Date(s.completedAt ?? s.startedAt);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });
  let count = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (days.has(key)) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

function courseProgressPct(courseId: string, sessions: QuizSession[], questionCount: number): number {
  if (questionCount === 0) return 0;
  const answered = new Set<string>();
  sessions.forEach((s) => {
    if (s.courseId !== courseId) return;
    s.answers.forEach((a) => answered.add(a.questionId));
  });
  return Math.min(100, Math.round((answered.size / questionCount) * 100));
}

export default function Home() {
  const { user } = useUser();
  const userTrack = user?.track ?? 'medicina';
  const [coursesTick, setCoursesTick] = useState(0);
  const courses = useMemo(
    () =>
      db.courses
        .list()
        .filter((c) => (c.track ?? 'medicina') === userTrack),
    [coursesTick, userTrack],
  );
  const { sessions } = useSessions();

  useEffect(() => {
    function bump() {
      setCoursesTick((t) => t + 1);
    }
    window.addEventListener(COURSES_CHANGE_EVENT, bump);
    window.addEventListener(SRS_CHANGE_EVENT, bump);
    return () => {
      window.removeEventListener(COURSES_CHANGE_EVENT, bump);
      window.removeEventListener(SRS_CHANGE_EVENT, bump);
    };
  }, []);

  const dueCardCount = useMemo(() => {
    if (!user) return 0;
    const allCardIds: string[] = [];
    courses.forEach((c) => {
      db.questions
        .listByCourse(c.id)
        .filter((q): q is FlashcardQuestion => q.type === 'flashcard')
        .forEach((card) => allCardIds.push(card.id));
    });
    if (allCardIds.length === 0) return 0;
    return listDueCards(user.uid, allCardIds).length;
  }, [user, courses, coursesTick]);

  const completed = sessions.filter((s) => s.completedAt);
  const totalQuestions = completed.reduce((acc, s) => acc + s.answers.length, 0);
  const totalRight = completed.reduce(
    (acc, s) => acc + s.answers.filter((a) => a.isRight).length,
    0,
  );
  const accuracy = totalQuestions > 0 ? Math.round((totalRight / totalQuestions) * 100) : 0;

  const lastCourse = useMemo(
    () => lastCourseFromSessions(completed, courses),
    [completed, courses],
  );
  const lastCourseProgress = useMemo(
    () => (lastCourse ? courseProgressPct(lastCourse.id, completed, lastCourse.questionCount) : 0),
    [lastCourse, completed],
  );
  const lastCourseTopicIdx = useMemo(() => {
    if (!lastCourse || lastCourse.topics.length === 0) return null;
    const topicsTouched = new Set<string>();
    const courseQuestions = db.questions.listByCourse(lastCourse.id);
    const qById = new Map(courseQuestions.map((q) => [q.id, q]));
    completed
      .filter((s) => s.courseId === lastCourse.id)
      .forEach((s) =>
        s.questionIds.forEach((qid) => {
          const q = qById.get(qid);
          if (q) topicsTouched.add(q.topic);
        }),
      );
    const inOrder = lastCourse.topics.findIndex((t) => !topicsTouched.has(t));
    return inOrder === -1 ? lastCourse.topics.length : inOrder + 1;
  }, [lastCourse, completed]);

  const now = new Date();
  const firstName = user?.name?.split(' ')[0] ?? 'doutora';
  const tone = user?.displayMode === 'doutora' ? 'doutora' : 'namorado';
  const showBilhete = tone === 'namorado';
  const greeting = greetingByHour(now.getHours());

  const subtitle =
    tone === 'namorado'
      ? 'o que vamos estudar hoje, doutora?'
      : 'selecione um curso para começar.';

  const goal = user?.dailyGoal ?? 15;
  const doneToday = questionsDoneToday(completed);
  const streak = streakDays(completed);
  const goalPct = Math.min(1, doneToday / Math.max(1, goal));
  const goalDeg = Math.round(goalPct * 360);

  const recentAccuracy = useMemo(() => {
    const recent = completed.slice(0, 5);
    const recTotal = recent.reduce((a, s) => a + s.answers.length, 0);
    const recRight = recent.reduce((a, s) => a + s.answers.filter((x) => x.isRight).length, 0);
    return recTotal > 0 ? Math.round((recRight / recTotal) * 100) : 0;
  }, [completed]);

  return (
    <div>
      <Onboarding />

      {/* Hero */}
      <section className="bg-paper">
        <div className="mx-auto w-full max-w-6xl px-6 pb-10 pt-14 sm:px-10 sm:pb-14 sm:pt-20 lg:px-20">
          <Eyebrow>{formatEditionDate(now).toLowerCase()}</Eyebrow>

          <h1 className="mt-6 font-display font-light leading-[1.02] text-ink">
            <span className="text-[clamp(2.5rem,7vw,4.5rem)]">{greeting}, </span>
            <span className="text-[clamp(2.5rem,7vw,4.5rem)] italic text-rose">{firstName}</span>
            <span className="text-[clamp(2.5rem,7vw,4.5rem)]">.</span>
          </h1>

          <p className="mt-4 font-body text-lg italic leading-relaxed text-mute">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Linha de cards */}
      <section className="bg-paper">
        <div className="mx-auto w-full max-w-6xl px-6 pb-12 sm:px-10 lg:px-20">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* Continue de onde parou */}
            <div className="card p-7 sm:p-8">
              <Eyebrow>continue de onde parou</Eyebrow>
              {lastCourse ? (
                <>
                  <div className="mt-5 flex items-start gap-4">
                    <IconChip icon={iconForCourse(lastCourse.title)} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-[28px] italic leading-tight text-ink">
                        {lastCourse.title}
                      </h2>
                      {lastCourseTopicIdx !== null && (
                        <p className="mt-1 font-body text-sm italic text-mute">
                          Tópico {lastCourseTopicIdx} de {lastCourse.topics.length}
                          {lastCourse.topics[lastCourseTopicIdx - 1] &&
                            ` · ${lastCourse.topics[lastCourseTopicIdx - 1]}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-blush">
                      <div
                        className="h-full rounded-full bg-wine transition-all"
                        style={{ width: `${lastCourseProgress}%` }}
                      />
                    </div>
                    <div className="mt-2 font-display text-[11px] uppercase tracking-[0.2em] text-mute">
                      {lastCourseProgress}% concluído
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link to={`/curso/${lastCourse.id}`} className="btn-primary">
                      continuar leitura
                    </Link>
                    <Link to={`/curso/${lastCourse.id}`} className="btn-ghost">
                      ver tópicos
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-4 font-body italic leading-relaxed text-mute">
                    Você ainda não começou nenhum curso. Vamos escolher um para abrir o caderno?
                  </p>
                  <div className="mt-6">
                    <Link to="/cursos" className="btn-primary">
                      ver cursos
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Direita: stats + meta */}
            <div className="space-y-6">
              <div className="card p-7">
                <div className="grid grid-cols-3 gap-4">
                  <Stat label="provas" value={String(completed.length)} />
                  <Stat label="questões" value={String(totalQuestions)} />
                  <Stat label="acerto" value={`${accuracy}%`} />
                </div>
                {completed.length > 0 && (
                  <p className="mt-5 border-t border-line pt-4 font-body text-sm italic leading-relaxed text-mute">
                    você acertou {recentAccuracy}% nas últimas {Math.min(5, completed.length)}{' '}
                    provas.
                  </p>
                )}
              </div>

              <div className="card flex items-center gap-5 p-7">
                <div
                  className="relative h-[92px] w-[92px] shrink-0 rounded-full"
                  style={{
                    background: `conic-gradient(var(--wine) ${goalDeg}deg, var(--blush) ${goalDeg}deg)`,
                  }}
                >
                  <div className="absolute inset-[6px] flex flex-col items-center justify-center rounded-full bg-card">
                    <span className="font-display text-2xl italic leading-none text-ink">
                      {goal}
                    </span>
                    <span className="mt-0.5 font-display text-[9px] uppercase tracking-[0.2em] text-mute">
                      /dia
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-xl italic text-ink">Meta diária</h3>
                  <p className="mt-1 font-body text-sm italic leading-snug text-mute">
                    {doneToday} de {goal} questões
                  </p>
                  {streak > 0 && (
                    <p className="mt-1 font-display text-[11px] uppercase tracking-[0.2em] text-wine">
                      {streak} {streak === 1 ? 'dia' : 'dias seguidos'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Atalhos */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ShortcutCard
              to="/revisar"
              icon={Layers}
              title="Revisar cards"
              subtitle={dueCardCount > 0 ? `${dueCardCount} cards na fila` : 'sem cards pendentes'}
            />
            {showBilhete ? (
              <ShortcutCard
                to="/bilhetes"
                icon={Mail}
                title="Bilhete do dia"
                subtitle="um recado te espera"
              />
            ) : (
              <ShortcutCard
                to="/historico"
                icon={Activity}
                title="Histórico"
                subtitle="suas últimas provas"
              />
            )}
            <ShortcutCard
              to="/casos"
              icon={Siren}
              title="Simulação rápida"
              subtitle="casos de plantão"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-[34px] leading-none text-ink">{value}</div>
      <div className="mt-2 font-display text-[10px] uppercase tracking-[0.2em] text-mute">
        {label}
      </div>
    </div>
  );
}

function ShortcutCard({
  to,
  icon: Icon,
  title,
  subtitle,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="card flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.99]"
    >
      <IconChip icon={Icon} />
      <div>
        <h3 className="font-display text-xl italic text-ink">{title}</h3>
        <p className="mt-1 font-body text-sm italic text-mute">{subtitle}</p>
      </div>
    </Link>
  );
}
