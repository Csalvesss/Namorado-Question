import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link2, RotateCcw } from 'lucide-react';
import { duration, easeOutExpo } from '../../lib/motion';
import { shuffle } from '../../lib/quiz';
import type { PreparedMatchQuestion } from '../../lib/quiz';

const PAIR_COLORS = [
  '#7a1f3d',
  '#b8895a',
  '#4f6b4a',
  '#c97b8a',
  '#5a1530',
  '#9a3a3a',
];

export interface MatchState {
  selections: Record<string, string>;
  rightOrder?: string[];
}

interface MatchingProps {
  question: PreparedMatchQuestion;
  state: MatchState;
  index: number;
  submitted: boolean;
  onUpdate: (next: MatchState) => void;
}

export default function Matching({
  question,
  state,
  index,
  submitted,
  onUpdate,
}: MatchingProps) {
  const rightOrder = useMemo(() => {
    if (state.rightOrder && state.rightOrder.length === question.pairs.length) {
      return state.rightOrder;
    }
    return shuffle(question.pairs.map((p) => p.id));
  }, [question.pairs, state.rightOrder]);

  useEffect(() => {
    if (!state.rightOrder || state.rightOrder.length !== question.pairs.length) {
      onUpdate({ ...state, rightOrder });
    }
  }, [rightOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeLeft, setActiveLeft] = useState<string | null>(null);

  const leftById = useMemo(() => new Map(question.pairs.map((p) => [p.id, p.left])), [question.pairs]);
  const rightById = useMemo(() => new Map(question.pairs.map((p) => [p.id, p.right])), [question.pairs]);

  const rightToLeft = useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(state.selections).forEach(([leftId, rightId]) => {
      map.set(rightId, leftId);
    });
    return map;
  }, [state.selections]);

  const colorForLeft = useMemo(() => {
    const map = new Map<string, string>();
    question.pairs.forEach((p, i) => {
      map.set(p.id, PAIR_COLORS[i % PAIR_COLORS.length]);
    });
    return map;
  }, [question.pairs]);

  function selectLeft(id: string) {
    if (submitted) return;
    setActiveLeft((cur) => (cur === id ? null : id));
  }

  function selectRight(rightId: string) {
    if (submitted) return;
    if (!activeLeft) {
      const existingLeft = rightToLeft.get(rightId);
      if (existingLeft) {
        const next = { ...state.selections };
        delete next[existingLeft];
        onUpdate({ ...state, selections: next });
      }
      return;
    }
    const nextSelections = { ...state.selections };
    const previousRight = nextSelections[activeLeft];
    if (previousRight) delete nextSelections[activeLeft];
    const owner = rightToLeft.get(rightId);
    if (owner && owner !== activeLeft) delete nextSelections[owner];
    nextSelections[activeLeft] = rightId;
    onUpdate({ ...state, selections: nextSelections });
    setActiveLeft(null);
    void previousRight;
  }

  function reset() {
    if (submitted) return;
    onUpdate({ ...state, selections: {} });
    setActiveLeft(null);
  }

  const allMatched = Object.keys(state.selections).length === question.pairs.length;
  const correctCount = useMemo(() => {
    return Object.entries(state.selections).filter(([leftId, rightId]) => leftId === rightId).length;
  }, [state.selections]);

  return (
    <article className="card relative overflow-hidden p-5 sm:p-7">
      <span
        className={`absolute left-0 top-0 bottom-0 w-[3px] ${allMatched ? 'bg-wine' : 'bg-rose-soft'}`}
      />

      <div className="mb-1 font-serif text-xs uppercase tracking-[0.3em] text-gold">
        Questão {String(index + 1).padStart(2, '0')} · Pareamento
      </div>
      <span className="label-tag">{question.topic}</span>

      <p className="mt-3 text-[15px] leading-relaxed text-ink sm:text-base">{question.prompt}</p>

      <div className="mt-5 mb-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted">
          {submitted
            ? `${correctCount} de ${question.pairs.length} pares corretos`
            : activeLeft
              ? 'agora toque o item correspondente à direita'
              : `${Object.keys(state.selections).length} de ${question.pairs.length} pareados`}
        </p>
        {!submitted && Object.keys(state.selections).length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted transition hover:text-wine"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div className="flex flex-col gap-2">
          {question.leftLabel && (
            <div className="px-2 text-[10px] uppercase tracking-[0.22em] text-muted">
              {question.leftLabel}
            </div>
          )}
          {question.pairs.map((p) => {
            const matched = state.selections[p.id];
            const color = colorForLeft.get(p.id) ?? PAIR_COLORS[0];
            const isActive = activeLeft === p.id;
            const isCorrect = submitted && matched === p.id;
            const isWrong = submitted && matched !== undefined && matched !== p.id;
            return (
              <button
                key={`left-${p.id}`}
                type="button"
                onClick={() => selectLeft(p.id)}
                disabled={submitted}
                className={`flex min-h-[52px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-[14px] leading-snug transition active:scale-[0.99] disabled:cursor-default ${
                  isActive
                    ? 'border-wine bg-rose-soft text-wine-deep shadow-soft'
                    : matched
                      ? submitted
                        ? isCorrect
                          ? 'border-green bg-green-soft text-green'
                          : 'border-red bg-red-soft text-red'
                        : 'border-line bg-paper text-ink-soft'
                      : 'border-line bg-bg-soft text-ink-soft hover:border-rose hover:bg-paper'
                }`}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: matched ? color : 'transparent',
                    border: matched ? 'none' : '1.5px solid #e6d9d2',
                  }}
                />
                <span className="flex-1">{p.left}</span>
                {isWrong && (
                  <span className="text-[10px] uppercase tracking-[0.18em] text-red">
                    {p.right}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {question.rightLabel && (
            <div className="px-2 text-[10px] uppercase tracking-[0.22em] text-muted">
              {question.rightLabel}
            </div>
          )}
          {rightOrder.map((rid) => {
            const leftId = rightToLeft.get(rid);
            const text = rightById.get(rid) ?? '';
            const color = leftId ? colorForLeft.get(leftId) : null;
            const isCorrect = submitted && leftId === rid;
            const isWrong = submitted && leftId !== undefined && leftId !== rid;
            const isHinted = !submitted && activeLeft !== null && !leftId;
            return (
              <button
                key={`right-${rid}`}
                type="button"
                onClick={() => selectRight(rid)}
                disabled={submitted}
                className={`flex min-h-[52px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-[14px] leading-snug transition active:scale-[0.99] disabled:cursor-default ${
                  submitted
                    ? isCorrect
                      ? 'border-green bg-green-soft text-green'
                      : isWrong
                        ? 'border-red bg-red-soft text-red'
                        : leftId
                          ? 'border-line bg-paper text-ink-soft'
                          : 'border-line bg-bg-soft text-muted'
                    : leftId
                      ? 'border-wine bg-paper text-ink hover:border-rose'
                      : isHinted
                        ? 'border-rose bg-paper text-ink hover:border-wine hover:bg-rose-soft/30'
                        : 'border-line bg-bg-soft text-ink-soft hover:border-rose hover:bg-paper'
                }`}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: color ?? 'transparent',
                    border: color ? 'none' : '1.5px solid #e6d9d2',
                  }}
                />
                <span className="flex-1">{text}</span>
                {leftId && !submitted && (
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-wine" strokeWidth={1.75} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {submitted && question.expl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: duration.base, ease: easeOutExpo, delay: index * 0.04 }}
            className="overflow-hidden"
          >
            <div
              className={`mt-5 rounded-xl p-4 text-sm leading-relaxed ${
                correctCount === question.pairs.length
                  ? 'border-l-[3px] border-green bg-green-soft text-ink-soft'
                  : 'border-l-[3px] border-wine bg-rose-soft/40 text-ink-soft'
              }`}
            >
              <strong className="text-ink">Resposta: </strong>
              {leftById.size > 0 && (
                <span className="block mt-1">
                  {question.pairs.map((p, i) => (
                    <span key={p.id}>
                      {p.left} → {p.right}
                      {i < question.pairs.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </span>
              )}
              {question.expl && <p className="mt-2 italic">{question.expl}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
