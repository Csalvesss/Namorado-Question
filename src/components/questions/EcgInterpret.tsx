import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Stethoscope, X } from 'lucide-react';
import EcgTracing from '../EcgTracing';
import { duration, easeOutExpo } from '../../lib/motion';
import type { PreparedECGQuestion } from '../../lib/quiz';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export interface EcgState {
  pointAnswers: Record<string, number>;
  diagnosisSelected?: number;
  completed?: boolean;
}

interface EcgInterpretProps {
  question: PreparedECGQuestion;
  state: EcgState;
  index: number;
  submitted: boolean;
  onUpdate: (next: EcgState) => void;
}

export default function EcgInterpret({
  question,
  state,
  index,
  submitted,
  onUpdate,
}: EcgInterpretProps) {
  const [openId, setOpenId] = useState<string | null>(question.points[0]?.id ?? null);
  const answeredPoints = Object.keys(state.pointAnswers).length;
  const allPointsAnswered = answeredPoints === question.points.length;
  const highlightRegion = useMemo(() => {
    if (submitted) return null;
    const open = question.points.find((p) => p.id === openId);
    return open?.region ?? null;
  }, [openId, question.points, submitted]);

  function answerPoint(pointId: string, optIdx: number) {
    if (submitted) return;
    const nextAnswers = { ...state.pointAnswers, [pointId]: optIdx };
    onUpdate({ ...state, pointAnswers: nextAnswers });
    const idx = question.points.findIndex((p) => p.id === pointId);
    const next = question.points[idx + 1];
    if (next && nextAnswers[next.id] === undefined) {
      setTimeout(() => setOpenId(next.id), 220);
    } else if (Object.keys(nextAnswers).length === question.points.length) {
      setTimeout(() => setOpenId('diagnosis'), 240);
    }
  }

  function answerDiagnosis(optIdx: number) {
    if (submitted) return;
    onUpdate({ ...state, diagnosisSelected: optIdx, completed: true });
  }

  return (
    <article className="card relative overflow-hidden p-5 sm:p-7">
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${state.completed ? 'bg-wine' : 'bg-rose-soft'}`} />

      <div className="mb-1 font-serif text-xs uppercase tracking-[0.3em] text-gold">
        Questão {String(index + 1).padStart(2, '0')} · Eletro
      </div>
      <span className="label-tag">{question.topic}</span>

      {question.context && (
        <p className="mt-3 rounded-xl bg-bg-soft px-4 py-3 font-serif text-[15px] italic leading-relaxed text-ink-soft sm:text-base">
          {question.context}
        </p>
      )}

      <div className="mt-4">
        <EcgTracing tracingId={question.tracingId} highlight={highlightRegion} />
      </div>

      <div className="mt-5 mb-3 flex items-center justify-between">
        <h4 className="font-serif text-lg italic text-wine-deep">Analise ponto a ponto</h4>
        <span className="text-xs uppercase tracking-wider text-muted">
          {answeredPoints} / {question.points.length}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {question.points.map((point) => {
          const isOpen = openId === point.id;
          const answered = state.pointAnswers[point.id];
          const isAnswered = answered !== undefined;
          const isCorrectAnswer = isAnswered && answered === point.correct;
          let statusColor = 'text-muted';
          let StatusIcon = ChevronDown;
          if (submitted && isAnswered) {
            if (isCorrectAnswer) {
              statusColor = 'text-green';
              StatusIcon = Check;
            } else {
              statusColor = 'text-red';
              StatusIcon = X;
            }
          } else if (isAnswered) {
            statusColor = 'text-wine';
            StatusIcon = Check;
          }

          return (
            <li
              key={point.id}
              className={`overflow-hidden rounded-xl border transition ${
                isOpen ? 'border-wine bg-paper' : 'border-line bg-bg-soft'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : point.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-rose-soft/30"
              >
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    isAnswered ? 'bg-rose-soft' : 'bg-paper'
                  } ${statusColor}`}
                >
                  <StatusIcon className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-base italic text-wine-deep">{point.label}</div>
                  {point.hint && !isOpen && !isAnswered && (
                    <div className="mt-0.5 truncate text-xs text-muted">{point.hint}</div>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  strokeWidth={1.75}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: duration.base, ease: easeOutExpo }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-line px-4 py-4">
                      <p className="mb-3 text-[15px] leading-relaxed text-ink">{point.question}</p>
                      <div className="flex flex-col gap-2">
                        {point.options.map((opt, i) => {
                          const selected = answered === i;
                          const correct = i === point.correct;
                          let classes =
                            'border-line bg-paper text-ink-soft hover:border-rose hover:text-ink active:bg-rose-soft/30';
                          if (!submitted && selected) classes = 'border-wine bg-rose-soft text-wine-deep font-medium';
                          if (submitted && correct) classes = 'border-green bg-green-soft text-green';
                          if (submitted && selected && !correct) classes = 'border-red bg-red-soft text-red';
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => answerPoint(point.id, i)}
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
                      {submitted && (
                        <div
                          className={`mt-3 rounded-lg p-3 text-sm leading-relaxed ${
                            isCorrectAnswer
                              ? 'border-l-[3px] border-green bg-green-soft text-ink-soft'
                              : 'border-l-[3px] border-red bg-red-soft text-ink-soft'
                          }`}
                        >
                          <strong className="text-ink">
                            Correto: {LETTERS[point.correct]}.
                          </strong>{' '}
                          {point.expl}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}

        <AnimatePresence>
          {allPointsAnswered && (
            <motion.li
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.base, ease: easeOutExpo }}
              className={`overflow-hidden rounded-xl border transition ${
                openId === 'diagnosis' ? 'border-wine bg-paper' : 'border-rose bg-rose-soft/40'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(openId === 'diagnosis' ? null : 'diagnosis')}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-paper text-wine-deep">
                  <Stethoscope className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="flex-1 font-serif text-base italic text-wine-deep">
                  Diagnóstico final
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted transition-transform ${openId === 'diagnosis' ? 'rotate-180' : ''}`}
                  strokeWidth={1.75}
                />
              </button>

              <AnimatePresence initial={false}>
                {openId === 'diagnosis' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: duration.base, ease: easeOutExpo }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-line px-4 py-4">
                      <p className="mb-3 text-[15px] leading-relaxed text-ink">
                        {question.diagnosis.question}
                      </p>
                      <div className="flex flex-col gap-2">
                        {question.diagnosis.options.map((opt, i) => {
                          const selected = state.diagnosisSelected === i;
                          const correct = i === question.diagnosis.correct;
                          let classes =
                            'border-line bg-paper text-ink-soft hover:border-rose hover:text-ink active:bg-rose-soft/30';
                          if (!submitted && selected) classes = 'border-wine bg-rose-soft text-wine-deep font-medium';
                          if (submitted && correct) classes = 'border-green bg-green-soft text-green';
                          if (submitted && selected && !correct) classes = 'border-red bg-red-soft text-red';
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => answerDiagnosis(i)}
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
                      {submitted && (
                        <div
                          className={`mt-3 rounded-lg p-3 text-sm leading-relaxed ${
                            state.diagnosisSelected === question.diagnosis.correct
                              ? 'border-l-[3px] border-green bg-green-soft text-ink-soft'
                              : 'border-l-[3px] border-red bg-red-soft text-ink-soft'
                          }`}
                        >
                          <strong className="text-ink">
                            Correto: {LETTERS[question.diagnosis.correct]}.
                          </strong>{' '}
                          {question.diagnosis.expl}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          )}
        </AnimatePresence>
      </ul>
    </article>
  );
}
