import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Layers, Mail } from 'lucide-react';
import BilheteCard from '../components/BilheteCard';
import DailyGoalRing from '../components/DailyGoalRing';
import EmptyState from '../components/EmptyState';
import Onboarding from '../components/Onboarding';
import StudyHeatmap from '../components/StudyHeatmap';
import {
  calculateStreak,
  questionsAnsweredToday,
  studyByDay,
} from '../lib/analytics';
import {
  currentBilhete,
  currentGreeting,
  currentPerformanceQuote,
  formatRotationCountdown,
  nextRotationIn,
  tierFromAccuracy,
} from '../lib/bilhete';
import { COURSES_CHANGE_EVENT, db } from '../lib/db';
import { listDueCards, SRS_CHANGE_EVENT } from '../lib/srs';
import { useSessions } from '../lib/useSessions';
import { useUser } from '../lib/useUser';
import type { Course, FlashcardQuestion, QuizSession } from '../types';

const MONTHS_PT = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
];

const WEEKDAYS_PT = [
  'domingo', 'segunda', 'terça', 'quarta',
  'quinta', 'sexta', 'sábado',
];

function greetingByHour(hour: number): string {
  if (hour < 5) return 'boa madrugada';
  if (hour < 12) return 'bom dia';
  if (hour < 18) return 'boa tarde';
  return 'boa noite';
}

function formatDateLabel(d: Date): string {
  return `${WEEKDAYS_PT[d.getDay()]}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()].toLowerCase()}`;
}

function lastCourseFromSessions(sessions: QuizSession[], courses: Course[]): Course | null {
  for (const s of sessions) {
    const c = courses.find((c) => c.id === s.courseId);
    if (c) return c;
  }
  return null;
}

export default function Dashboard() {
  const { user } = useUser();
  const [coursesTick, setCoursesTick] = useState(0);
  const courses = useMemo(() => db.courses.list(), [coursesTick]);
  const { sessions } = useSessions();
  const [srsTick, setSrsTick] = useState(0);

  useEffect(() => {
    function bumpSrs() {
      setSrsTick((t) => t + 1);
    }
    function bumpCourses() {
      setCoursesTick((t) => t + 1);
    }
    window.addEventListener(SRS_CHANGE_EVENT, bumpSrs);
    window.addEventListener(COURSES_CHANGE_EVENT, bumpCourses);
    return () => {
      window.removeEventListener(SRS_CHANGE_EVENT, bumpSrs);
      window.removeEventListener(COURSES_CHANGE_EVENT, bumpCourses);
    };
  }, []);

  const completed = sessions.filter((s) => s.completedAt);
  const totalQuestions = completed.reduce((acc, s) => acc + s.answers.length, 0);
  const totalRight = completed.reduce((acc, s) => acc + s.answers.filter((a) => a.isRight).length, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalRight / totalQuestions) * 100) : 0;

  const lastCourse = useMemo(() => lastCourseFromSessions(completed, courses), [completed, courses]);
  const now = new Date();
  const firstName = user?.name?.split(' ')[0] ?? 'doutora';
  const hour = now.getHours();
  const sub = greetingByHour(hour);

  const accuracyByCourse = useMemo(() => {
    const map = new Map<string, { right: number; total: number }>();
    completed.forEach((s) => {
      const cur = map.get(s.courseId) ?? { right: 0, total: 0 };
      s.answers.forEach((a) => {
        cur.total += 1;
        if (a.isRight) cur.right += 1;
      });
      map.set(s.courseId, cur);
    });
    return map;
  }, [completed]);

  const attemptsByCourse = useMemo(() => {
    const map = new Map<string, number>();
    completed.forEach((s) => map.set(s.courseId, (map.get(s.courseId) ?? 0) + 1));
    return map;
  }, [completed]);

  const studyMap = useMemo(() => studyByDay(completed), [completed]);
  const streak = useMemo(() => calculateStreak(studyMap), [studyMap]);
  const todayQuestions = useMemo(() => questionsAnsweredToday(studyMap), [studyMap]);
  const dailyGoal = user?.dailyGoal ?? 15;

  const flashcardIds = useMemo(() => {
    const all: string[] = [];
    courses.forEach((c) => {
      db.questions
        .listByCourse(c.id)
        .filter((q): q is FlashcardQuestion => q.type === 'flashcard')
        .forEach((q) => all.push(q.id));
    });
    return all;
  }, [courses]);

  const dueCardCount = useMemo(() => {
    if (!user || flashcardIds.length === 0) return 0;
    return listDueCards(user.uid, flashcardIds).length;
  }, [user, flashcardIds, srsTick]);

  const [rotationTick, setRotationTick] = useState(0);
  useEffect(() => {
    const delay = nextRotationIn();
    const timer = setTimeout(() => setRotationTick((t) => t + 1), delay + 1000);
    return () => clearTimeout(timer);
  }, [rotationTick]);

  const bilhete = useMemo(() => currentBilhete(), [rotationTick]);
  const greeting = useMemo(() => currentGreeting(), [rotationTick]);
  const tier = useMemo(() => tierFromAccuracy(accuracy, completed.length), [accuracy, completed.length]);
  const performanceQuote = useMemo(() => currentPerformanceQuote(tier), [tier, rotationTick]);
  const nextIn = useMemo(() => formatRotationCountdown(nextRotationIn()), [rotationTick]);
  const partner = user?.partnerName?.trim() || '';

  return (
    <div className="space-y-12">
      <Onboarding />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-start md:gap-8">
        <div>
          <div className="eyebrow-gold mb-3">
            {formatDateLabel(now)}
          </div>
          <h1 className="font-serif text-[clamp(2.25rem,5vw,3.75rem)] italic leading-[1.05] text-wine-deep">
            {sub},{' '}
            <span className="text-rose">{firstName}</span>
          </h1>
          <p className="mt-3 max-w-xl font-serif text-lg italic leading-relaxed text-ink-soft">
            {greeting}
          </p>
          {performanceQuote && completed.length > 0 && (
            <p className="mt-2 max-w-xl font-serif text-base italic leading-relaxed text-wine-deep/80">
              "{performanceQuote}"
            </p>
          )}

          {(lastCourse || completed.length > 0 || dueCardCount > 0) && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {lastCourse && (
                <Link to={`/curso/${lastCourse.id}`} className="btn-primary">
                  Continuar {lastCourse.title}
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
                </Link>
              )}
              {dueCardCount > 0 && (
                <Link to="/revisar" className="btn-secondary">
                  <Layers className="mr-2 h-4 w-4" strokeWidth={1.75} />
                  Revisar {dueCardCount} {dueCardCount === 1 ? 'card' : 'cards'}
                </Link>
              )}
              {completed.length > 0 && (
                <Link to="/historico" className="btn-ghost text-xs uppercase tracking-wider">
                  Ver últimas provas
                </Link>
              )}
            </div>
          )}
        </div>

        {completed.length > 0 && (
          <aside className="card relative overflow-hidden p-5 sm:p-6 md:min-w-[260px]">
            <div className="eyebrow absolute right-5 top-4 text-gold">resumo</div>
            <div className="grid grid-cols-3 gap-3 sm:gap-5">
              <Stat label="provas" value={String(completed.length)} />
              <Stat label="questões" value={String(totalQuestions)} />
              <Stat label="acerto" value={`${accuracy}%`} />
            </div>
          </aside>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <Mail className="h-4 w-4 self-center text-wine" strokeWidth={1.75} />
            <span className="eyebrow-gold">bilhete do dia</span>
          </div>
          <span className="text-[11px] italic text-muted">novo em {nextIn}</span>
        </div>
        <BilheteCard
          bilhete={bilhete}
          signature={partner || undefined}
          recipientFirstName={firstName}
        />
      </section>

      {completed.length > 0 && (
        <section>
          <div className="mb-5 flex items-baseline gap-3">
            <span className="font-serif text-3xl italic leading-none text-gold opacity-60">I</span>
            <h2 className="font-serif text-2xl italic text-wine-deep">Ritmo de estudo</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-stretch">
            <div className="card flex flex-col gap-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <div className="flex items-baseline gap-2">
                  <Flame className="h-5 w-5 self-center text-wine" strokeWidth={1.75} />
                  <span className="font-serif text-3xl font-semibold leading-none text-wine-deep sm:text-4xl">
                    {streak.current}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                    {streak.current === 1 ? 'dia seguido' : 'dias seguidos'}
                  </span>
                </div>
                {streak.longest > streak.current && (
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-lg italic text-ink-soft">recorde:</span>
                    <span className="font-serif text-xl font-semibold text-wine-deep">
                      {streak.longest}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                      dias
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-lg italic text-ink-soft">total:</span>
                  <span className="font-serif text-xl font-semibold text-wine-deep">
                    {streak.studyDaysTotal}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                    dias estudados
                  </span>
                </div>
              </div>

              <StudyHeatmap sessions={completed} />
            </div>

            <div className="card flex flex-col items-center justify-center gap-3 p-5 sm:p-6 md:min-w-[200px]">
              <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
                meta de hoje
              </span>
              <DailyGoalRing done={todayQuestions} goal={dailyGoal} />
              <p className="text-center font-serif text-sm italic leading-snug text-ink-soft">
                {todayQuestions >= dailyGoal
                  ? 'meta batida. orgulho de você.'
                  : todayQuestions > 0
                    ? `faltam ${dailyGoal - todayQuestions} para fechar o dia`
                    : 'comece com uma revisão rápida'}
              </p>
              <Link
                to="/perfil"
                className="text-[11px] uppercase tracking-[0.18em] text-muted transition hover:text-wine"
              >
                ajustar meta
              </Link>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl italic leading-none text-gold opacity-60">
              {completed.length > 0 ? 'II' : 'I'}
            </span>
            <h2 className="font-serif text-2xl italic text-wine-deep">Cursos</h2>
          </div>
          <Link to="/autor" className="btn-ghost text-xs uppercase tracking-wider">
            Novo curso
          </Link>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            illustration="book"
            title="Nenhum curso ainda"
            description="Vá em Autor para criar ou importar um banco de questões. É rápido e o Claude monta as questões para você."
            action={
              <Link to="/autor" className="btn-primary">
                Criar primeiro curso
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => {
              const acc = accuracyByCourse.get(c.id);
              const pct = acc && acc.total > 0 ? Math.round((acc.right / acc.total) * 100) : null;
              const attempts = attemptsByCourse.get(c.id) ?? 0;
              return (
                <Link
                  key={c.id}
                  to={`/curso/${c.id}`}
                  className="card group relative block overflow-hidden p-5 transition active:scale-[0.99] hover:shadow-card-hover sm:p-6"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-soft transition group-hover:bg-wine" />
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-paper-soft font-serif text-xl italic text-wine-deep"
                      >
                        {c.title.charAt(0).toUpperCase()}
                      </span>
                      <h3 className="font-serif text-xl italic leading-tight text-wine-deep">
                        {c.title}
                      </h3>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 translate-x-0 text-muted transition group-hover:translate-x-1 group-hover:text-wine"
                      strokeWidth={1.75}
                    />
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-ink-soft">{c.description}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="label-tag">{c.questionCount} questões</span>
                    <span className="label-tag">{c.topics.length} tópicos</span>
                    {pct !== null && <span className="label-tag">{pct}% acerto</span>}
                    {attempts > 0 && (
                      <span className="label-tag">{attempts} tentativa{attempts > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-2xl font-semibold leading-none text-wine-deep sm:text-3xl">
        {value}
      </div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-muted sm:text-[11px]">
        {label}
      </div>
    </div>
  );
}
