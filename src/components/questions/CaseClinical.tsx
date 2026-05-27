import { AnimatePresence, motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { duration, easeOutExpo } from '../../lib/motion';
import type { PreparedCaseQuestion } from '../../lib/quiz';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export interface CaseState {
  stepAnswers: Record<string, number>;
}

interface CaseClinicalProps {
  question: PreparedCaseQuestion;
  state: CaseState;
  index: number;
  submitted: boolean;
  onUpdate: (next: CaseState) => void;
}

export default function CaseClinical({
  question,
  state,
  index,
  submitted,
  onUpdate,
}: CaseClinicalProps) {
  const totalSteps = question.steps.length;
  const answeredSteps = Object.keys(state.stepAnswers).length;
  const allAnswered = answeredSteps === totalSteps;

  function answerStep(stepId: string, optIdx: number) {
    if (submitted) return;
    onUpdate({ ...state, stepAnswers: { ...state.stepAnswers, [stepId]: optIdx } });
  }

  return (
    <article className="card relative overflow-hidden p-5 sm:p-7">
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${allAnswered ? 'bg-wine' : 'bg-rose-soft'}`} />

      <div className="mb-1 font-serif text-xs uppercase tracking-[0.3em] text-gold">
        Questão {String(index + 1).padStart(2, '0')} · Caso clínico
      </div>
      <span className="label-tag">{question.topic}</span>

      <div className="mt-4 rounded-2xl bg-paper-soft p-5 shadow-inset sm:p-6">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
          <FileText className="h-3.5 w-3.5 text-wine" strokeWidth={1.75} />
          Vinheta clínica
        </div>
        <p className="whitespace-pre-line font-serif text-[15px] italic leading-relaxed text-ink sm:text-base">
          {question.vignette}
        </p>
      </div>

      <div className="mt-5 mb-3 flex items-center justify-between">
        <h4 className="font-serif text-lg italic text-wine-deep">Sequência de decisões</h4>
        <span className="text-xs uppercase tracking-wider text-muted">
          {answeredSteps} / {totalSteps}
        </span>
      </div>

      <ol className="flex flex-col gap-3">
        {question.steps.map((step, stepIdx) => {
          const selected = state.stepAnswers[step.id];
          const isAnswered = selected !== undefined;
          const isCorrect = isAnswered && selected === step.correct;

          return (
            <li key={step.id} className="rounded-xl border border-line bg-bg-soft p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-soft font-serif text-sm font-semibold text-wine-deep">
                  {stepIdx + 1}
                </span>
                {step.prompt && (
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
                    nova informação
                  </span>
                )}
              </div>

              {step.prompt && (
                <p className="mb-3 rounded-lg border-l-[3px] border-gold bg-paper px-3 py-2 font-serif text-sm italic leading-relaxed text-ink-soft">
                  {step.prompt}
                </p>
              )}

              <p className="mb-3 text-[15px] leading-relaxed text-ink">{step.question}</p>

              <div className="flex flex-col gap-2">
                {step.options.map((opt, i) => {
                  const isThis = selected === i;
                  const isCorrectOpt = i === step.correct;
                  let classes =
                    'border-line bg-paper text-ink-soft hover:border-rose hover:text-ink active:bg-rose-soft/30';
                  if (!submitted && isThis) classes = 'border-wine bg-rose-soft text-wine-deep font-medium';
                  if (submitted && isCorrectOpt) classes = 'border-green bg-green-soft text-green';
                  if (submitted && isThis && !isCorrectOpt) classes = 'border-red bg-red-soft text-red';
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => answerStep(step.id, i)}
                      disabled={submitted}
                      className={`flex min-h-[48px] items-start gap-3 rounded-lg border px-3.5 py-2.5 text-left text-[14px] leading-snug transition ${classes} disabled:cursor-default`}
                    >
                      <span className="font-serif text-base font-semibold leading-5 text-wine">
                        {LETTERS[i]}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence initial={false}>
                {submitted && isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: duration.base, ease: easeOutExpo }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`mt-3 rounded-lg p-3 text-sm leading-relaxed ${
                        isCorrect
                          ? 'border-l-[3px] border-green bg-green-soft text-ink-soft'
                          : 'border-l-[3px] border-red bg-red-soft text-ink-soft'
                      }`}
                    >
                      <strong className="text-ink">Correto: {LETTERS[step.correct]}.</strong> {step.expl}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
