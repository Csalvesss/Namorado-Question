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
  Stethoscope,
  ThermometerSun,
  type LucideIcon,
} from 'lucide-react';
import CourseCard from '../components/CourseCard';
import Eyebrow from '../components/ui/Eyebrow';
import EmptyState from '../components/EmptyState';
import { COURSES_CHANGE_EVENT, db } from '../lib/db';
import { useSessions } from '../lib/useSessions';
import type { Course, QuizSession } from '../types';

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

const AREAS: Array<{ id: string; label: string; match: RegExp }> = [
  { id: 'infecto', label: 'Infectologia', match: /hiv|aids|menin|infect/i },
  { id: 'cardio', label: 'Cardiologia', match: /cardíac|coração|hipertensão|arterial|icc|insuficiência/i },
  { id: 'arbo', label: 'Arboviroses', match: /dengue|chikung|zika|febre amarela|oropouche|arbovirose/i },
  { id: 'neuro', label: 'Neurologia', match: /neuro|menin|cerebr|avc|epilep/i },
];

function areaForCourse(c: Course): string[] {
  const matches: string[] = [];
  for (const a of AREAS) {
    if (a.match.test(c.title) || a.match.test(c.description)) matches.push(a.id);
  }
  return matches;
}

function lastSeenCourseId(sessions: QuizSession[]): string | null {
  for (const s of sessions) {
    if (s.courseId) return s.courseId;
  }
  return null;
}

function buildAccuracyMap(sessions: QuizSession[]): Map<string, number | null> {
  const acc = new Map<string, { right: number; total: number }>();
  sessions.forEach((s) => {
    const cur = acc.get(s.courseId) ?? { right: 0, total: 0 };
    s.answers.forEach((a) => {
      cur.total += 1;
      if (a.isRight) cur.right += 1;
    });
    acc.set(s.courseId, cur);
  });
  const out = new Map<string, number | null>();
  acc.forEach((v, k) => out.set(k, v.total > 0 ? Math.round((v.right / v.total) * 100) : null));
  return out;
}

export default function Courses() {
  const [coursesTick, setCoursesTick] = useState(0);
  const courses = useMemo(() => db.courses.list(), [coursesTick]);
  const { sessions } = useSessions();
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    function bump() {
      setCoursesTick((t) => t + 1);
    }
    window.addEventListener(COURSES_CHANGE_EVENT, bump);
    return () => window.removeEventListener(COURSES_CHANGE_EVENT, bump);
  }, []);

  const completed = sessions.filter((s) => s.completedAt);
  const accuracyMap = useMemo(() => buildAccuracyMap(completed), [completed]);
  const lastSeen = useMemo(() => lastSeenCourseId(completed), [completed]);

  const filtered = useMemo(() => {
    if (filter === 'all') return courses;
    return courses.filter((c) => areaForCourse(c).includes(filter));
  }, [courses, filter]);

  const visibleAreas = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => areaForCourse(c).forEach((a) => set.add(a)));
    return AREAS.filter((a) => set.has(a.id));
  }, [courses]);

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 sm:py-20 lg:px-20">
        <Eyebrow>capítulo um</Eyebrow>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-baseline gap-5">
            <span className="font-display text-[3rem] italic font-light leading-none text-rose">
              I
            </span>
            <h1 className="font-display font-light text-ink text-[clamp(2rem,5vw,3rem)] leading-[1.05]">
              Cursos disponíveis
            </h1>
          </div>
          <Link to="/autor" className="btn-primary">
            + novo curso
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              illustration="book"
              title="Nenhum curso ainda"
              description="Mande os PDFs no chat com o Cesar para ele montar o banco de questões."
              action={
                <Link to="/autor" className="btn-primary">
                  ver autor
                </Link>
              }
            />
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
                Todos
              </FilterChip>
              {visibleAreas.map((a) => (
                <FilterChip
                  key={a.id}
                  active={filter === a.id}
                  onClick={() => setFilter(a.id)}
                >
                  {a.label}
                </FilterChip>
              ))}
            </div>

            {/* Grade */}
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {filtered.map((c, idx) => (
                <CourseCard
                  key={c.id}
                  to={`/curso/${c.id}`}
                  title={c.title}
                  description={c.description}
                  icon={iconForCourse(c.title)}
                  questionCount={c.questionCount}
                  topicCount={c.topics.length}
                  accuracy={accuracyMap.get(c.id) ?? null}
                  number={idx + 1}
                  isLastSeen={c.id === lastSeen}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-5 py-2 font-display text-[14px] italic transition active:scale-[0.97] ${
        active
          ? 'bg-wine border-wine text-[#FBEFEC] shadow-soft'
          : 'border-line bg-card text-mute hover:border-wine/40 hover:text-wine'
      }`}
    >
      {children}
    </button>
  );
}
