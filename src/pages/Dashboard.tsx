import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Brain,
  Bug,
  Calculator,
  Dna,
  HeartPulse,
  Layers,
  Mail,
  Moon,
  Shuffle,
  Stethoscope,
  ThermometerSun,
  type LucideIcon,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import Onboarding from '../components/Onboarding';
import SpringFlower from '../components/decorative/SpringFlower';
import { COURSES_CHANGE_EVENT, db } from '../lib/db';
import { listDueCards, SRS_CHANGE_EVENT } from '../lib/srs';
import { useSessions } from '../lib/useSessions';
import { useUser } from '../lib/useUser';
import type { Course, FlashcardQuestion, QuizSession } from '../types';

const WEEKDAYS_PT_UP = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const MONTHS_PT_UP = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
];

function greetingByHour(hour: number): string {
  if (hour < 5) return 'boa madrugada';
  if (hour < 12) return 'bom dia';
  if (hour < 18) return 'boa tarde';
  return 'boa noite';
}

function formatEditionDate(d: Date): string {
  return `${WEEKDAYS_PT_UP[d.getDay()]} · ${d.getDate()} ${MONTHS_PT_UP[d.getMonth()]} · ${d.getFullYear()}`;
}

function lastCourseFromSessions(sessions: QuizSession[], courses: Course[]): Course | null {
  for (const s of sessions) {
    const c = courses.find((c) => c.id === s.courseId);
    if (c) return c;
  }
  return null;
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

interface CourseStat {
  attempts: number;
  accuracy: number | null;
}

function buildCourseStats(sessions: QuizSession[]): Map<string, CourseStat> {
  const map = new Map<string, { right: number; total: number; attempts: number }>();
  sessions.forEach((s) => {
    const cur = map.get(s.courseId) ?? { right: 0, total: 0, attempts: 0 };
    cur.attempts += 1;
    s.answers.forEach((a) => {
      cur.total += 1;
      if (a.isRight) cur.right += 1;
    });
    map.set(s.courseId, cur);
  });
  const out = new Map<string, CourseStat>();
  map.forEach((v, k) => {
    out.set(k, {
      attempts: v.attempts,
      accuracy: v.total > 0 ? Math.round((v.right / v.total) * 100) : null,
    });
  });
  return out;
}

function performanceSentence(
  completed: QuizSession[],
  courses: Course[],
  stats: Map<string, CourseStat>,
): string {
  if (completed.length < 3) return '';
  const recent = completed.slice(0, 6);
  const recentTotal = recent.reduce((acc, s) => acc + s.answers.length, 0);
  const recentRight = recent.reduce(
    (acc, s) => acc + s.answers.filter((a) => a.isRight).length,
    0,
  );
  const recentPct = recentTotal > 0 ? Math.round((recentRight / recentTotal) * 100) : 0;

  const ranked: Array<{ title: string; accuracy: number }> = [];
  stats.forEach((v, courseId) => {
    if (v.attempts < 2 || v.accuracy === null) return;
    const c = courses.find((x) => x.id === courseId);
    if (!c) return;
    ranked.push({ title: c.title, accuracy: v.accuracy });
  });
  ranked.sort((a, b) => b.accuracy - a.accuracy);

  const provasLabel = recent.length === 1 ? 'última prova' : `últimas ${recent.length} provas`;
  if (ranked.length === 0) {
    return `Você acertou ${recentPct}% nas ${provasLabel}.`;
  }
  if (ranked.length === 1) {
    return `Você acertou ${recentPct}% nas ${provasLabel}. ${ranked[0].title} segue sendo seu ponto forte.`;
  }
  const top = ranked.slice(0, 2);
  const worst = ranked[ranked.length - 1];
  const topNames = top.map((t) => t.title).join(' e ');
  if (top.find((t) => t.title === worst.title)) {
    return `Você acertou ${recentPct}% nas ${provasLabel}. Os melhores resultados aparecem em ${topNames}.`;
  }
  return `Você acertou ${recentPct}% nas ${provasLabel}. Os melhores resultados aparecem em ${topNames}; ${worst.title} ainda merece outra visita esta semana.`;
}

export default function Dashboard() {
  const { user } = useUser();
  const [coursesTick, setCoursesTick] = useState(0);
  const courses = useMemo(() => db.courses.list(), [coursesTick]);
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
  const totalRight = completed.reduce((acc, s) => acc + s.answers.filter((a) => a.isRight).length, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalRight / totalQuestions) * 100) : 0;

  const lastCourse = useMemo(() => lastCourseFromSessions(completed, courses), [completed, courses]);
  const courseStats = useMemo(() => buildCourseStats(completed), [completed]);

  const now = new Date();
  const firstName = user?.name?.split(' ')[0] ?? 'doutora';
  const tone = user?.displayMode === 'doutora' ? 'doutora' : 'namorado';
  const showBilhete = tone === 'namorado';
  const greeting = greetingByHour(now.getHours());

  const subtitle =
    tone === 'namorado'
      ? 'o que vamos estudar hoje, doutora?'
      : 'selecione um curso para começar.';

  const perfBody = useMemo(
    () => performanceSentence(completed, courses, courseStats),
    [completed, courses, courseStats],
  );

  return (
    <div className="space-y-12">
      <Onboarding />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-start md:gap-10">
        <div>
          <div className="eyebrow-gold">{formatEditionDate(now).toLowerCase()}</div>

          <h1 className="mt-3 font-serif italic leading-[1.05] text-wine-deep">
            <span className="text-[clamp(1.75rem,4vw,2.75rem)]">{greeting}, </span>
            <span className="text-[clamp(1.75rem,4vw,2.75rem)] text-rose">{firstName}</span>
            <span className="text-[clamp(1.75rem,4vw,2.75rem)] text-wine-deep">.</span>
          </h1>

          <p className="mt-3 font-serif text-base italic leading-relaxed text-ink-soft sm:text-lg">
            {subtitle}
          </p>

          <div className="mt-5 flex items-center gap-2">
            {lastCourse && (
              <Link
                to={`/curso/${lastCourse.id}`}
                className="inline-flex min-h-touch items-center rounded-full bg-wine px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition active:scale-[0.98] hover:bg-wine-deep"
              >
                Continuar
              </Link>
            )}
            {showBilhete && (
              <Link
                to="/bilhetes"
                className="inline-flex min-h-touch items-center rounded-full border border-wine bg-paper px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-wine-deep transition active:scale-[0.98] hover:bg-rose-soft"
              >
                <Mail className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                Bilhete do dia
              </Link>
            )}
          </div>
          {dueCardCount > 0 && (
            <Link
              to="/revisar"
              className="mt-3 inline-flex items-center text-[11px] uppercase tracking-wider text-muted transition hover:text-wine"
            >
              <Layers className="mr-1 h-3 w-3" strokeWidth={1.75} />
              Revisar {dueCardCount} cards
            </Link>
          )}
        </div>

        {completed.length >= 3 && (
          <aside className="relative overflow-hidden rounded-2xl border border-line bg-paper px-5 py-4 shadow-soft md:min-w-[280px]">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="provas" value={String(completed.length)} />
              <Stat label="questões" value={String(totalQuestions)} />
              <Stat label="acerto" value={`${accuracy}%`} />
            </div>
            {perfBody && (
              <p className="mt-3 border-t border-line pt-3 font-serif text-[13px] italic leading-relaxed text-ink-soft">
                {perfBody}
              </p>
            )}
          </aside>
        )}
      </section>

      <hr className="border-line" />

      <section>
        <div className="mb-2 text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
          capítulo um
        </div>
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-[3.5rem] italic leading-none text-gold opacity-40">
              I
            </span>
            <h2 className="font-serif text-3xl italic text-wine-deep sm:text-4xl">
              Cursos disponíveis
            </h2>
          </div>
          <Link to="/autor" className="btn-ghost text-xs uppercase tracking-wider">
            + Novo curso
          </Link>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            illustration="book"
            title="Nenhum curso ainda"
            description="Mande os PDFs no chat com o Cesar para ele montar o banco de questões."
            action={
              <Link to="/autor" className="btn-primary">
                Ver Autor
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {courses.map((c, idx) => {
              const stat = courseStats.get(c.id);
              const isLastSeen = lastCourse?.id === c.id;
              const Icon = iconForCourse(c.title);
              return (
                <Link
                  key={c.id}
                  to={`/curso/${c.id}`}
                  className={`group relative block overflow-hidden rounded-2xl border p-5 transition active:scale-[0.99] hover:shadow-card-hover sm:p-6 ${
                    isLastSeen
                      ? 'border-rose bg-rose-soft/40 shadow-card'
                      : 'border-line bg-paper shadow-card'
                  }`}
                >
                  {isLastSeen ? (
                    <span className="absolute right-5 top-4 font-serif text-[10px] italic uppercase tracking-[0.28em] text-rose">
                      último visto
                    </span>
                  ) : (
                    <span className="absolute right-5 top-4 font-serif text-[10px] italic uppercase tracking-[0.22em] text-muted">
                      no. {String(idx + 1).padStart(2, '0')}
                    </span>
                  )}

                  <div className="mb-3 flex items-center gap-3">
                    <span
                      aria-hidden
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-soft text-wine-deep"
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <h3 className="font-serif text-2xl italic leading-tight text-wine-deep">
                      {c.title}
                    </h3>
                  </div>

                  <p className="mb-4 max-w-md text-sm leading-relaxed text-ink-soft">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-muted">
                    <span>
                      <span className="text-wine">·</span> {c.questionCount} questões
                    </span>
                    <span>{c.topics.length} tópicos</span>
                    {stat?.accuracy !== null && stat?.accuracy !== undefined && (
                      <span>{stat.accuracy}% acerto</span>
                    )}
                  </div>

                  {idx % 2 === 0 && (
                    <SpringFlower
                      size={70}
                      tone="rose"
                      className="pointer-events-none absolute -bottom-3 -right-3 opacity-60"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
          capítulo dois
        </div>
        <div className="mb-6 flex items-baseline gap-4">
          <span className="font-serif text-[3.5rem] italic leading-none text-gold opacity-40">
            II
          </span>
          <h2 className="font-serif text-3xl italic text-wine-deep sm:text-4xl">
            Ferramentas de estudo
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/intercalado"
            className="group block overflow-hidden rounded-2xl border border-line bg-paper p-5 shadow-card transition active:scale-[0.99] hover:shadow-card-hover sm:p-6"
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                aria-hidden
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-soft text-wine-deep"
              >
                <Shuffle className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <h3 className="font-serif text-xl italic leading-tight text-wine-deep">
                Modo intercalado
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              20 questões sorteadas entre cursos diferentes. Treina discriminação entre diagnósticos parecidos.
            </p>
          </Link>
          <Link
            to="/ferramentas"
            className="group block overflow-hidden rounded-2xl border border-line bg-paper p-5 shadow-card transition active:scale-[0.99] hover:shadow-card-hover sm:p-6"
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                aria-hidden
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-soft text-wine-deep"
              >
                <Calculator className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <h3 className="font-serif text-xl italic leading-tight text-wine-deep">
                Calculadoras
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              CKD-EPI, Wells, CHA₂DS₂-VASc, MELD, Glasgow, APGAR, IMC. O que você precisa no plantão.
            </p>
          </Link>
          <Link
            to="/passa-facil"
            className="group block overflow-hidden rounded-2xl border border-line bg-paper p-5 shadow-card transition active:scale-[0.99] hover:shadow-card-hover sm:p-6"
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                aria-hidden
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-soft text-wine-deep"
              >
                <Moon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <h3 className="font-serif text-xl italic leading-tight text-wine-deep">
                Passa-fácil noturno
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              Dez flashcards aleatórios, sem cobrança. Pra relembrar antes de dormir.
            </p>
          </Link>
        </div>
      </section>

      <section className="border-t border-line pt-8">
        <div className="text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
          uma carta da casa
        </div>
        <p className="mt-3 max-w-2xl font-serif text-base leading-relaxed text-ink-soft sm:text-[17px]">
          Cada questão aqui foi escolhida com cuidado, no seu tempo, para você revisar entre um
          descanso e outro. Estuda tranquila, respira quando precisar e lembra: a gente faz isso
          junto. Quando quiser uma pausa, abre um bilhete. Quando quiser acelerar, manda um
          simulado. O ritmo é seu.
        </p>
      </section>

      <div className="flex items-center justify-center gap-3 text-rose opacity-50">
        <span className="h-px w-12 bg-rose-soft" />
        <span className="font-serif text-lg italic">·</span>
        <span className="h-px w-12 bg-rose-soft" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-serif text-2xl font-semibold leading-none text-wine-deep sm:text-3xl">
        {value}
      </div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-muted">{label}</div>
    </div>
  );
}
