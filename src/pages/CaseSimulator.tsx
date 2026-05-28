import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, MapPin, Stethoscope, Timer } from 'lucide-react';
import { db } from '../lib/db';
import { duration as motionDuration, easeOutExpo } from '../lib/motion';
import { useUser } from '../lib/useUser';
import type { CaseQuestion } from '../types';

interface StepAnswer {
  stepId: string;
  selected: number;
  correct: number;
  isRight: boolean;
}

export default function CaseSimulator() {
  const { caseId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const caseQ = useMemo<CaseQuestion | null>(() => {
    const courses = db.courses.list();
    for (const c of courses) {
      const found = db.questions
        .listByCourse(c.id)
        .find((q) => q.id === caseId && q.type === 'case');
      if (found && found.type === 'case') return found;
    }
    return null;
  }, [caseId]);

  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<StepAnswer[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setStepIndex(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setFinished(false);
  }, [caseId]);

  if (!caseQ) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="font-serif text-xl italic text-ink-soft">Simulação não encontrada.</p>
        <Link to="/casos" className="btn-secondary mt-4 inline-block">Voltar</Link>
      </div>
    );
  }

  const step = caseQ.steps[stepIndex];
  const total = caseQ.steps.length;
  const progress = ((stepIndex + (revealed ? 1 : 0)) / total) * 100;
  const isLast = stepIndex === total - 1;

  function confirmAnswer() {
    if (selected === null) return;
    if (revealed) return;
    setRevealed(true);
    setAnswers((a) => [
      ...a,
      {
        stepId: step.id,
        selected,
        correct: step.correct,
        isRight: selected === step.correct,
      },
    ]);
  }

  function nextStep() {
    if (isLast) {
      setFinished(true);
      return;
    }
    setStepIndex((s) => s + 1);
    setSelected(null);
    setRevealed(false);
  }

  function restart() {
    setStepIndex(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setFinished(false);
  }

  const score = answers.filter((a) => a.isRight).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <Link
        to="/casos"
        className="inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-wine"
      >
        <ArrowLeft className="mr-1 h-3 w-3" strokeWidth={2} />
        voltar aos casos
      </Link>

      <header className="overflow-hidden rounded-3xl border border-wine-deep bg-wine-deep text-paper shadow-card">
        <div className="px-6 py-7 sm:px-9 sm:py-9">
          <div className="text-[10px] uppercase tracking-[0.32em] text-rose-soft/80">
            {caseQ.specialty ?? 'caso clínico'}
          </div>
          <h1 className="mt-2 font-serif text-3xl italic leading-tight sm:text-4xl">
            {caseQ.topic}
          </h1>
          {caseQ.subtitle && (
            <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-paper/85 sm:text-lg">
              {caseQ.subtitle}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-rose-soft/80">
            {caseQ.timeStamp && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                <Timer className="h-3 w-3" strokeWidth={1.75} />
                {caseQ.timeStamp}
              </span>
            )}
            {caseQ.location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                <MapPin className="h-3 w-3" strokeWidth={1.75} />
                {caseQ.location}
              </span>
            )}
            <span className="rounded-full bg-white/10 px-2.5 py-1">
              {stepIndex + 1} de {total} passos
            </span>
          </div>
        </div>
        <div className="h-1 bg-white/10">
          <div
            className="h-full bg-rose transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {finished ? (
        <OutcomeCard
          caseQ={caseQ}
          score={score}
          total={total}
          onRestart={restart}
          onBack={() => navigate('/casos')}
        />
      ) : (
        <>
          {stepIndex === 0 && (
            <article className="rounded-3xl border border-line bg-paper px-6 py-7 shadow-soft sm:px-9 sm:py-9">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-soft text-wine-deep sm:inline-flex"
                >
                  <Stethoscope className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-gold">cenário</div>
                  <p className="mt-3 whitespace-pre-line font-serif text-[15px] leading-relaxed text-ink sm:text-base">
                    {caseQ.vignette}
                  </p>
                </div>
              </div>
            </article>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: motionDuration.slow, ease: easeOutExpo }}
              className="rounded-3xl border border-line bg-paper px-6 py-7 shadow-card sm:px-9 sm:py-9"
            >
              {step.prompt && (
                <p className="mb-4 whitespace-pre-line font-serif text-[14px] italic leading-relaxed text-ink-soft sm:text-[15px]">
                  {step.prompt}
                </p>
              )}
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl italic font-semibold leading-none text-wine-deep sm:text-4xl">
                  {String(stepIndex + 1).padStart(2, '0')}
                </span>
                <h2 className="font-serif text-xl italic leading-snug text-wine-deep sm:text-2xl">
                  {step.question}
                </h2>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                {step.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrectOpt = i === step.correct;
                  let classes =
                    'border-line bg-paper text-ink-soft hover:border-rose hover:text-ink active:bg-bg-soft';
                  if (!revealed && isSelected)
                    classes = 'border-wine bg-rose-soft/60 text-wine-deep font-medium';
                  if (revealed && isCorrectOpt) classes = 'border-green bg-green-soft/80 text-green';
                  if (revealed && isSelected && !isCorrectOpt)
                    classes = 'border-red bg-red-soft/80 text-red';
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (!revealed) setSelected(i);
                      }}
                      disabled={revealed}
                      className={`flex min-h-[56px] items-start gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] leading-snug transition ${classes} disabled:cursor-default`}
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-serif text-sm font-semibold ${
                          revealed && isCorrectOpt
                            ? 'border-green bg-green text-white'
                            : revealed && isSelected && !isCorrectOpt
                              ? 'border-red bg-red text-white'
                              : isSelected
                                ? 'border-wine bg-wine text-white'
                                : 'border-line text-wine bg-paper'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: motionDuration.base, ease: easeOutExpo }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`mt-5 rounded-xl p-4 text-sm leading-relaxed ${
                        selected === step.correct
                          ? 'border-l-[3px] border-green bg-green-soft text-ink'
                          : 'border-l-[3px] border-red bg-red-soft text-ink'
                      }`}
                    >
                      <div
                        className={`mb-1 font-serif text-base italic ${
                          selected === step.correct ? 'text-green' : 'text-red'
                        }`}
                      >
                        {selected === step.correct ? 'conduta correta.' : 'não foi essa.'}
                      </div>
                      <div>{step.expl}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                {!revealed ? (
                  <button
                    type="button"
                    onClick={confirmAnswer}
                    disabled={selected === null}
                    className="inline-flex min-h-touch items-center rounded-full bg-wine px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:shadow-none"
                  >
                    confirmar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex min-h-touch items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98]"
                  >
                    {isLast ? 'ver desfecho' : 'próximo passo'}
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                )}
              </div>
            </motion.article>
          </AnimatePresence>

          {!user && <div className="text-[11px] italic text-muted">faça login para salvar seu progresso.</div>}
        </>
      )}
    </div>
  );
}

interface OutcomeProps {
  caseQ: CaseQuestion;
  score: number;
  total: number;
  onRestart: () => void;
  onBack: () => void;
}

function OutcomeCard({ caseQ, score, total, onRestart, onBack }: OutcomeProps) {
  const pct = Math.round((score / total) * 100);
  const tone = pct >= 80 ? 'good' : pct >= 50 ? 'med' : 'low';
  const headline =
    tone === 'good'
      ? 'conduta firme. plantão bem fechado.'
      : tone === 'med'
        ? 'segurou no básico. revisita os pontos que escapou.'
        : 'volta com calma nesse caso. a próxima é diferente.';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionDuration.slow, ease: easeOutExpo }}
      className="overflow-hidden rounded-3xl border border-line bg-paper-soft shadow-card"
    >
      <div className="bg-wine-deep px-6 py-6 text-paper sm:px-9">
        <div className="text-[10px] uppercase tracking-[0.32em] text-rose-soft/80">desfecho</div>
        <h2 className="mt-2 font-serif text-3xl italic sm:text-4xl">{headline}</h2>
        <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-1.5 text-sm font-serif italic">
          <span>{score} de {total} decisões certas</span>
          <span className="text-rose-soft">·</span>
          <span>{pct}%</span>
        </div>
      </div>
      <div className="px-6 py-7 sm:px-9 sm:py-9">
        {caseQ.outcome && (
          <p className="whitespace-pre-line font-serif text-[15px] leading-relaxed text-ink sm:text-base">
            {caseQ.outcome}
          </p>
        )}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center rounded-full border border-wine bg-paper px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-wine-deep transition hover:bg-rose-soft active:scale-[0.98]"
          >
            refazer
          </button>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center rounded-full bg-wine px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98]"
          >
            outro caso
          </button>
        </div>
      </div>
    </motion.section>
  );
}
