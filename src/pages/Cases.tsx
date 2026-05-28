import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Brain, HeartPulse, Siren, Stethoscope, type LucideIcon } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';
import { db } from '../lib/db';
import type { CaseQuestion } from '../types';

const SPECIALTY_ICON: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /cardio|coração|cardíac/i, icon: HeartPulse },
  { match: /neuro|cerebr/i, icon: Brain },
  { match: /trauma|emergência|urgência/i, icon: Siren },
  { match: /pneumo|respirat/i, icon: Activity },
];

function iconForSpecialty(text: string): LucideIcon {
  for (const { match, icon } of SPECIALTY_ICON) {
    if (match.test(text)) return icon;
  }
  return Stethoscope;
}

function difficultyLabel(d?: string): { label: string; tone: 'soft' | 'medium' | 'hard' } {
  if (d === 'hard') return { label: 'pesado', tone: 'hard' };
  if (d === 'medium') return { label: 'intermediário', tone: 'medium' };
  return { label: 'inicial', tone: 'soft' };
}

export default function Cases() {
  const cases = useMemo(() => {
    const courses = db.courses.list();
    const all: Array<{ q: CaseQuestion; courseTitle: string }> = [];
    courses.forEach((c) => {
      db.questions
        .listByCourse(c.id)
        .filter((q): q is CaseQuestion => q.type === 'case')
        .forEach((q) => all.push({ q, courseTitle: c.title }));
    });
    return all.sort((a, b) => {
      const da = a.q.difficulty === 'hard' ? 0 : a.q.difficulty === 'medium' ? 1 : 2;
      const db = b.q.difficulty === 'hard' ? 0 : b.q.difficulty === 'medium' ? 1 : 2;
      return da - db;
    });
  }, []);

  return (
    <PageContainer>
    <div className="space-y-10">
      <section>
        <div className="eyebrow-gold">simulações clínicas</div>
        <h1 className="mt-3 font-serif italic leading-[1.05] text-wine-deep">
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">no plantão,</span>{' '}
          <span className="text-[clamp(1.75rem,4vw,2.75rem)] text-rose">doutora</span>
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">.</span>
        </h1>
        <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-ink-soft sm:text-lg">
          casos que parecem reais. o paciente entra na sua frente, a equipe espera sua decisão. respira, pensa, conduz.
        </p>
      </section>

      {cases.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-paper-soft px-5 py-8 text-center font-serif text-base italic text-ink-soft">
          nenhuma simulação disponível ainda.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cases.map(({ q, courseTitle }) => {
            const Icon = iconForSpecialty(q.specialty ?? q.topic);
            const diff = difficultyLabel(q.difficulty);
            const diffClass =
              diff.tone === 'hard'
                ? 'bg-red text-white'
                : diff.tone === 'medium'
                  ? 'bg-gold/80 text-white'
                  : 'bg-rose-soft text-wine-deep';
            return (
              <Link
                key={q.id}
                to={`/casos/${q.id}`}
                className="group relative block overflow-hidden rounded-3xl border border-line bg-paper shadow-card transition active:scale-[0.995] hover:shadow-card-hover"
              >
                <div className="relative flex items-start gap-3 bg-wine-deep px-5 py-4 text-paper">
                  <span
                    aria-hidden
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-rose-soft"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-rose-soft/80">
                      {q.specialty ?? q.topic}
                    </div>
                    <h3 className="mt-0.5 font-serif text-xl italic leading-tight text-paper sm:text-2xl">
                      {q.topic}
                    </h3>
                  </div>
                </div>
                <div className="px-5 py-4">
                  {q.subtitle && (
                    <p className="font-serif text-base italic leading-relaxed text-ink-soft">
                      {q.subtitle}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider">
                    <span className={`rounded-full px-2.5 py-0.5 ${diffClass}`}>{diff.label}</span>
                    {q.timeStamp && (
                      <span className="rounded-full bg-paper-soft px-2.5 py-0.5 text-muted">{q.timeStamp}</span>
                    )}
                    {q.location && (
                      <span className="rounded-full bg-paper-soft px-2.5 py-0.5 text-muted">{q.location}</span>
                    )}
                    <span className="rounded-full bg-paper-soft px-2.5 py-0.5 text-muted">
                      {q.steps.length} {q.steps.length === 1 ? 'passo' : 'passos'}
                    </span>
                  </div>
                  <div className="mt-3 text-[11px] italic text-muted">{courseTitle}</div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </div>
    </PageContainer>
  );
}
