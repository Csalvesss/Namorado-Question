import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  Bug,
  Dna,
  HeartPulse,
  Layers,
  Mail,
  Stethoscope,
  ThermometerSun,
  type LucideIcon,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import Onboarding from '../components/Onboarding';
import SpringFlower from '../components/decorative/SpringFlower';
import WaxSeal from '../components/decorative/WaxSeal';
import { COURSES_CHANGE_EVENT, db } from '../lib/db';
import { useSessions } from '../lib/useSessions';
import { useUser } from '../lib/useUser';
import type { Course, QuizSession } from '../types';

const WEEKDAYS_PT_UP = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const MONTHS_PT_UP = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
];

function formatEditionDate(d: Date): string {
  return `${WEEKDAYS_PT_UP[d.getDay()]} · ${d.getDate()} ${MONTHS_PT_UP[d.getMonth()]} · ${d.getFullYear()}`;
}

function daysSince(ts: number, now: number = Date.now()): number {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((now - ts) / dayMs));
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
  const [, setCoursesTick] = useState(0);
  const courses = useMemo(() => db.courses.list(), []);
  const { sessions } = useSessions();

  useEffect(() => {
    function bump() {
      setCoursesTick((t) => t + 1);
    }
    window.addEventListener(COURSES_CHANGE_EVENT, bump);
    return () => window.removeEventListener(COURSES_CHANGE_EVENT, bump);
  }, []);

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

  const editionDays = user ? daysSince(user.createdAt) + 1 : 1;
  const volume = Math.max(1, Math.floor(editionDays / 7) + 1);
  const editionLabel = `N.° ${String(editionDays).padStart(3, '0')}  ·  EDIÇÃO DIÁRIA`;
  const volumeLabel = `VOL. ${String(volume).padStart(2, '0')}`;

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

      <section className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_minmax(320px,400px)] md:items-start">
        <div>
          <div className="eyebrow-gold mb-2">{formatEditionDate(now)}</div>
          <div className="text-[10px] uppercase tracking-[0.32em] text-muted">{editionLabel}</div>

          <h1 className="mt-6 font-serif italic leading-[0.95] text-wine-deep">
            <span className="block text-[clamp(2.5rem,6vw,4.25rem)]">olá,</span>
            <span className="block text-[clamp(3rem,8vw,5.5rem)] text-rose">
              {firstName}
              <span className="text-wine-deep">.</span>
            </span>
          </h1>

          <p className="mt-5 max-w-xl font-serif text-lg italic leading-relaxed text-ink-soft">
            {subtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {lastCourse && (
              <Link to={`/curso/${lastCourse.id}`} className="btn-primary">
                Continuar {lastCourse.title}
                <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2} />
              </Link>
            )}
            {showBilhete && (
              <Link to="/bilhetes" className="btn-secondary">
                <Mail className="mr-2 h-4 w-4" strokeWidth={1.75} />
                Abrir bilhete do dia
              </Link>
            )}
          </div>
        </div>

        {completed.length >= 3 && (
          <aside className="card-elevated relative overflow-hidden p-5 sm:p-6">
            <SpringFlower
              size={110}
              className="pointer-events-none absolute -right-6 -top-8 opacity-90"
            />
            <div className="relative flex items-baseline justify-between gap-3">
              <span className="eyebrow">seu desempenho</span>
              <span className="font-serif text-[11px] uppercase tracking-[0.28em] text-gold">
                {volumeLabel}
              </span>
            </div>
            {perfBody && (
              <p className="relative mt-4 max-w-prose font-serif text-base leading-relaxed text-ink-soft">
                {perfBody}
              </p>
            )}
            <hr className="my-5 border-line" />
            <div className="grid grid-cols-3 gap-3">
              <Stat label="provas" value={String(completed.length)} />
              <Stat label="questões" value={String(totalQuestions)} />
              <Stat label="acerto médio" value={`${accuracy}%`} />
            </div>
          </aside>
        )}
      </section>

      <hr className="border-line" />

      <section>
        <div className="mb-2 text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
          — CAPÍTULO UM
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

      <section className="border-t border-line pt-8">
        <div className="flex items-start gap-5">
          <WaxSeal size={84} />
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-gold opacity-70">
              — UMA CARTA DA CASA
            </div>
            <p className="mt-3 max-w-2xl font-serif text-base leading-relaxed text-ink-soft sm:text-[17px]">
              Cada questão aqui foi escolhida com cuidado, pensada para residência, para prática
              clínica e para você revisar entre um plantão e outro. Estuda sem culpa, descansa
              quando precisar, e lembra: a gente faz isso junto. Quando quiser uma pausa, abre um
              bilhete; quando quiser correr, manda um simulado. O ritmo é seu.
            </p>
          </div>
        </div>
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
