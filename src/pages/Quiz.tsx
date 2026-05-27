import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import EmptyState from '../components/EmptyState';
import CaseClinical, { type CaseState } from '../components/questions/CaseClinical';
import EcgInterpret, { type EcgState } from '../components/questions/EcgInterpret';
import Matching, { type MatchState } from '../components/questions/Matching';
import { ResultPanel } from '../components/ResultPanel';
import { getPhrases } from '../data/phrases';
import { db } from '../lib/db';
import { duration, easeOutExpo, palette } from '../lib/motion';
import {
  getMistakeQuestionIds,
  modeConfig,
  prepareQuestion,
  sampleQuestions,
  type PreparedMCQuestion,
  type PreparedQuestion,
} from '../lib/quiz';
import { useUser } from '../lib/useUser';
import type { QuizMode, QuizSession } from '../types';

const LETTERS = ['A', 'B', 'C', 'D'];

type QuestionState = PreparedQuestion & {
  selected?: number;
  pointAnswers?: Record<string, number>;
  diagnosisSelected?: number;
  completed?: boolean;
  stepAnswers?: Record<string, number>;
  matchSelections?: Record<string, string>;
  matchRightOrder?: string[];
};

type MCQuestionState = PreparedMCQuestion & { selected?: number };

function isAnswered(q: QuestionState): boolean {
  if (q.type === 'mc') return q.selected !== undefined;
  if (q.type === 'ecg') return Boolean(q.completed);
  if (q.type === 'case') {
    return Object.keys(q.stepAnswers ?? {}).length === q.steps.length;
  }
  return Object.keys(q.matchSelections ?? {}).length === q.pairs.length;
}

function questionIsRight(q: QuestionState): boolean {
  if (q.type === 'mc') return q.selected === q.correct;
  if (q.type === 'ecg') return q.diagnosisSelected === q.diagnosis.correct;
  if (q.type === 'case') {
    const last = q.steps[q.steps.length - 1];
    return last !== undefined && q.stepAnswers?.[last.id] === last.correct;
  }
  const sel = q.matchSelections ?? {};
  return q.pairs.every((p) => sel[p.id] === p.id);
}

function questionAnswer(q: QuestionState): { selected: number; correct: number } {
  if (q.type === 'mc') {
    return { selected: q.selected ?? -1, correct: q.correct };
  }
  if (q.type === 'ecg') {
    return { selected: q.diagnosisSelected ?? -1, correct: q.diagnosis.correct };
  }
  if (q.type === 'case') {
    const last = q.steps[q.steps.length - 1];
    if (!last) return { selected: -1, correct: -1 };
    return { selected: q.stepAnswers?.[last.id] ?? -1, correct: last.correct };
  }
  const sel = q.matchSelections ?? {};
  const correctCount = q.pairs.reduce((acc, p) => acc + (sel[p.id] === p.id ? 1 : 0), 0);
  return { selected: correctCount, correct: q.pairs.length };
}

export default function Quiz() {
  const { courseId = '' } = useParams();
  const [params] = useSearchParams();
  const { user } = useUser();

  const mode = (params.get('mode') ?? 'standard') as QuizMode;
  const topicsParam = params.get('topics');
  const topics = useMemo(() => (topicsParam ? topicsParam.split(',') : undefined), [topicsParam]);
  const config = modeConfig(mode);

  const course = useMemo(() => db.courses.get(courseId), [courseId]);

  const [seed, setSeed] = useState(0);
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!course || !user) return;
    const mistakeIds = mode === 'mistakes' ? getMistakeQuestionIds(user.uid, courseId) : undefined;
    const raw = sampleQuestions({
      courseId,
      count: config.count,
      topics,
      mistakeIds,
      typeFilter: mode === 'clinical' ? 'case' : undefined,
    });
    setQuestions(raw.map(prepareQuestion));
    setSubmitted(false);
    setSession(null);
    setStartedAt(Date.now());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [course, user, courseId, mode, topics, config.count, seed]);

  useEffect(() => {
    if (!config.timed || submitted) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [config.timed, submitted]);

  if (!course) {
    return (
      <div className="card p-10 text-center">
        <p className="font-serif text-xl italic text-ink-soft">Curso não encontrado.</p>
        <Link to="/app" className="btn-secondary mt-4 inline-block">Voltar</Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <EmptyState
        illustration={mode === 'mistakes' ? 'spark' : 'petal'}
        title={mode === 'mistakes' ? 'Nenhum erro para revisar' : 'Sem questões para esses filtros'}
        description={
          mode === 'mistakes'
            ? 'Você ainda não tem questões erradas registradas. Faça uma prova primeiro para alimentar o modo erro.'
            : 'Nenhuma questão disponível com esses tópicos. Tenta limpar a seleção ou escolher outro modo.'
        }
        action={
          <Link to={`/curso/${courseId}`} className="btn-secondary">
            Voltar ao curso
          </Link>
        }
      />
    );
  }

  const answeredCount = questions.filter(isAnswered).length;
  const progress = (answeredCount / questions.length) * 100;
  const elapsedSec = Math.floor((now - startedAt) / 1000);
  const displayMode = user?.displayMode ?? 'namorado';
  const phrases = getPhrases(displayMode);

  function selectOption(qIdx: number, optIdx: number) {
    if (submitted) return;
    setQuestions((cur) =>
      cur.map((q, i) => (i === qIdx && q.type === 'mc' ? { ...q, selected: optIdx } : q)),
    );
  }

  function updateEcgState(qIdx: number, next: EcgState) {
    if (submitted) return;
    setQuestions((cur) =>
      cur.map((q, i) =>
        i === qIdx && q.type === 'ecg'
          ? { ...q, pointAnswers: next.pointAnswers, diagnosisSelected: next.diagnosisSelected, completed: next.completed }
          : q,
      ),
    );
  }

  function updateCaseState(qIdx: number, next: CaseState) {
    if (submitted) return;
    setQuestions((cur) =>
      cur.map((q, i) =>
        i === qIdx && q.type === 'case' ? { ...q, stepAnswers: next.stepAnswers } : q,
      ),
    );
  }

  function updateMatchState(qIdx: number, next: MatchState) {
    if (submitted) return;
    setQuestions((cur) =>
      cur.map((q, i) =>
        i === qIdx && q.type === 'match'
          ? { ...q, matchSelections: next.selections, matchRightOrder: next.rightOrder }
          : q,
      ),
    );
  }

  function submitQuiz() {
    if (submitted || !user || !course) return;
    setSubmitted(true);
    const completedAt = Date.now();
    const answers = questions.map((q) => {
      const { selected, correct } = questionAnswer(q);
      return {
        questionId: q.id,
        selected,
        correct,
        isRight: questionIsRight(q),
      };
    });
    const score = answers.filter((a) => a.isRight).length;
    const sess: QuizSession = {
      id: db.ids.session(),
      userId: user.uid,
      courseId,
      courseTitle: course.title,
      mode,
      questionIds: questions.map((q) => q.id),
      answers,
      score,
      total: questions.length,
      startedAt,
      completedAt,
      durationMs: completedAt - startedAt,
    };
    db.sessions.save(sess);
    setSession(sess);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);

    const pct = (score / questions.length) * 100;
    if (pct >= 80) celebrate(pct);
  }

  function redoQuiz() {
    setSeed((s) => s + 1);
  }

  let rightIdx = 0;
  let wrongIdx = 0;

  return (
    <div className="space-y-6 pb-28 md:pb-0">
      <header className="space-y-3">
        <Link
          to={`/curso/${courseId}`}
          className="inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-wine"
        >
          ← Voltar ao curso
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="eyebrow-gold mb-2 flex items-center gap-2">
              <config.Icon className="h-3.5 w-3.5 text-wine" strokeWidth={1.75} />
              <span>Modo {config.label}</span>
            </div>
            <h1 className="display-title-sm leading-tight">{course.title}</h1>
            <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-muted">
              {questions.length} questões · balanceado por tópico
            </div>
          </div>
          {config.timed && !submitted && (
            <div className="card flex flex-col items-center px-5 py-3 text-center">
              <div className="font-serif text-3xl font-semibold leading-none text-wine-deep">
                {formatTime(elapsedSec)}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted">
                tempo decorrido
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="card flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="font-serif text-base text-ink-soft">
          Respondidas{' '}
          <strong className="font-serif text-xl text-wine-deep">{answeredCount}</strong> de{' '}
          <strong className="font-serif text-xl text-wine-deep">{questions.length}</strong>
        </div>
        <div className="flex-1 overflow-hidden rounded-full bg-rose-soft">
          <div
            className="h-1.5 bg-gradient-to-r from-rose to-wine transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {session && submitted && (
        <ResultPanel
          ref={resultRef}
          session={session}
          questions={questions}
          displayMode={displayMode}
        />
      )}

      <div className="space-y-4">
        {questions.map((q, idx) => {
          let phrase = '';
          if (submitted) {
            const isRight = questionIsRight(q);
            if (isRight) {
              phrase = phrases.right[rightIdx % phrases.right.length];
              rightIdx++;
            } else {
              phrase = phrases.wrong[wrongIdx % phrases.wrong.length];
              wrongIdx++;
            }
          }
          if (q.type === 'mc') {
            return (
              <QuestionCard
                key={q.id + '-' + idx}
                question={q}
                index={idx}
                submitted={submitted}
                phrase={phrase}
                onSelect={(optIdx) => selectOption(idx, optIdx)}
              />
            );
          }
          if (q.type === 'ecg') {
            return (
              <EcgInterpret
                key={q.id + '-' + idx}
                question={q}
                index={idx}
                submitted={submitted}
                state={{
                  pointAnswers: q.pointAnswers ?? {},
                  diagnosisSelected: q.diagnosisSelected,
                  completed: q.completed,
                }}
                onUpdate={(next) => updateEcgState(idx, next)}
              />
            );
          }
          if (q.type === 'case') {
            return (
              <CaseClinical
                key={q.id + '-' + idx}
                question={q}
                index={idx}
                submitted={submitted}
                state={{ stepAnswers: q.stepAnswers ?? {} }}
                onUpdate={(next) => updateCaseState(idx, next)}
              />
            );
          }
          return (
            <Matching
              key={q.id + '-' + idx}
              question={q}
              index={idx}
              submitted={submitted}
              state={{
                selections: q.matchSelections ?? {},
                rightOrder: q.matchRightOrder,
              }}
              onUpdate={(next) => updateMatchState(idx, next)}
            />
          );
        })}
      </div>

      <div className="sticky-cta">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 pt-0 md:pt-4">
          {!submitted ? (
            <button
              onClick={submitQuiz}
              disabled={answeredCount < questions.length && !config.timed}
              className="btn-primary w-full sm:w-auto"
            >
              Ver gabarito
              {answeredCount < questions.length && !config.timed && (
                <span className="ml-2 text-[10px] font-normal opacity-80">
                  · faltam {questions.length - answeredCount}
                </span>
              )}
            </button>
          ) : (
            <>
              <button onClick={redoQuiz} className="btn-secondary flex-1 sm:flex-none">
                Refazer
              </button>
              <Link to={`/curso/${courseId}`} className="btn-primary flex-1 sm:flex-none">
                Outro modo
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: MCQuestionState;
  index: number;
  submitted: boolean;
  phrase: string;
  onSelect: (optIdx: number) => void;
}

function QuestionCard({ question, index, submitted, phrase, onSelect }: QuestionCardProps) {
  const isAnswered = question.selected !== undefined;
  const isRight = submitted && question.selected === question.correct;
  const numberClass = submitted
    ? isRight
      ? 'text-green'
      : 'text-red'
    : isAnswered
      ? 'text-wine'
      : 'text-rose-soft';

  return (
    <article className="card relative overflow-hidden p-5 sm:p-8">
      <span
        className={`absolute left-0 top-0 bottom-0 w-[3px] ${isAnswered ? 'bg-wine' : 'bg-rose-soft'}`}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-7">
        <div className="flex shrink-0 items-baseline gap-3 sm:flex-col sm:items-start sm:gap-1">
          <span
            className={`font-serif text-[3.5rem] font-semibold italic leading-none transition-colors sm:text-[5rem] ${numberClass}`}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="eyebrow-gold">{question.topic}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-relaxed text-ink sm:text-[17px]">{question.q}</p>

          <div className="mt-5 flex flex-col gap-2.5">
            {question.options.map((opt, i) => {
              const isSelected = question.selected === i;
              const isCorrectOpt = i === question.correct;
              let classes =
                'border-line bg-bg-soft text-ink-soft hover:border-rose hover:bg-paper hover:text-ink active:bg-paper';
              if (!submitted && isSelected) classes = 'border-wine bg-rose-soft text-wine-deep font-medium';
              if (submitted && isCorrectOpt) classes = 'border-green bg-green-soft text-green';
              if (submitted && isSelected && !isCorrectOpt) classes = 'border-red bg-red-soft text-red';
              let letterClass = 'text-wine';
              if (submitted && isCorrectOpt) letterClass = 'text-green';
              if (submitted && isSelected && !isCorrectOpt) letterClass = 'text-red';
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelect(i)}
                  disabled={submitted}
                  className={`flex min-h-[56px] items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] leading-snug transition ${classes} disabled:cursor-default`}
                >
                  <span className={`font-serif text-lg font-semibold leading-6 ${letterClass}`}>
                    {LETTERS[i]}
                  </span>
                  <span className="flex-1 pt-[1px]">{opt}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence initial={false}>
            {submitted && (
              <motion.div
                key="expl"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: duration.base, ease: easeOutExpo, delay: index * 0.04 }}
                className="overflow-hidden"
              >
                <div
                  className={`mt-5 rounded-xl p-4 text-sm ${
                    isRight
                      ? 'border-l-[3px] border-green bg-green-soft'
                      : 'border-l-[3px] border-red bg-red-soft'
                  }`}
                >
                  <div
                    className={`mb-1 font-serif text-base font-semibold italic ${isRight ? 'text-green' : 'text-red'}`}
                  >
                    {phrase}
                  </div>
                  <div className="text-sm leading-relaxed text-ink-soft">
                    <strong className="text-ink">
                      Resposta correta: {LETTERS[question.correct]}.
                    </strong>{' '}
                    {question.expl}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </article>
  );
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function celebrate(pct: number) {
  if (typeof window === 'undefined') return;
  const colors = [palette.wine, palette.wineDeep, palette.rose, palette.gold];
  const intensity = pct >= 95 ? 1 : pct >= 90 ? 0.8 : 0.6;
  const fire = (origin: { x: number; y: number }, particleCount: number) => {
    confetti({
      particleCount: Math.round(particleCount * intensity),
      spread: 70,
      startVelocity: 38,
      origin,
      colors,
      ticks: 220,
      scalar: 0.85,
      gravity: 1.1,
      decay: 0.92,
    });
  };
  fire({ x: 0.18, y: 0.85 }, 35);
  fire({ x: 0.82, y: 0.85 }, 35);
  setTimeout(() => fire({ x: 0.5, y: 0.75 }, 40), 160);
}
