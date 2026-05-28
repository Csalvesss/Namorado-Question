import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import BilheteCard from '../components/BilheteCard';
import BilheteFocus from '../components/BilheteFocus';
import EmptyState from '../components/EmptyState';
import FeedbackCard from '../components/FeedbackCard';
import CaseClinical, { type CaseState } from '../components/questions/CaseClinical';
import EcgInterpret, { type EcgState } from '../components/questions/EcgInterpret';
import Matching, { type MatchState } from '../components/questions/Matching';
import { ResultPanel } from '../components/ResultPanel';
import { PROVA_BILHETES, type Bilhete } from '../data/bilhetes';
import { getPhrases } from '../data/phrases';
import { db } from '../lib/db';
import { duration, easeOutExpo, palette } from '../lib/motion';
import {
  getMistakeQuestionIds,
  modeConfig,
  prepareQuestion,
  sampleQuestions,
  sampleQuestionsInterleaved,
  type PreparedMCQuestion,
  type PreparedQuestion,
} from '../lib/quiz';
import { useUser } from '../lib/useUser';
import type { QuizMode, QuizSession } from '../types';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

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

  const isInterleaved = courseId === '' || courseId === '__interleaved__';
  const defaultMode: QuizMode = isInterleaved ? 'interleaved' : 'standard';
  const mode = (params.get('mode') ?? defaultMode) as QuizMode;
  const topicsParam = params.get('topics');
  const topics = useMemo(() => (topicsParam ? topicsParam.split(',') : undefined), [topicsParam]);
  const config = modeConfig(mode);

  const course = useMemo(
    () => (isInterleaved ? null : db.courses.get(courseId)),
    [courseId, isInterleaved],
  );

  const [seed, setSeed] = useState(0);
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());
  const [focusBilhete, setFocusBilhete] = useState<Bilhete | null>(null);
  const [provaBilhete, setProvaBilhete] = useState<Bilhete | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!isInterleaved && !course) return;
    const mistakeIds =
      mode === 'mistakes' && !isInterleaved ? getMistakeQuestionIds(user.uid, courseId) : undefined;
    const raw = isInterleaved
      ? sampleQuestionsInterleaved({
          count: config.count,
          typeFilter: mode === 'clinical' ? 'case' : undefined,
        })
      : sampleQuestions({
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
    if (mode === 'bilhete' && user.displayMode !== 'doutora') {
      setProvaBilhete(PROVA_BILHETES[Math.floor(Math.random() * PROVA_BILHETES.length)]);
    } else {
      setProvaBilhete(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [course, user, courseId, mode, topics, config.count, seed, isInterleaved]);

  useEffect(() => {
    if (!config.timed || submitted) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [config.timed, submitted]);

  if (!course && !isInterleaved) {
    return (
      <div className="card p-10 text-center">
        <p className="font-serif text-xl italic text-ink-soft">Curso não encontrado.</p>
        <Link to="/app" className="btn-secondary mt-4 inline-block">Voltar</Link>
      </div>
    );
  }

  const titleLabel = course?.title ?? 'Modo intercalado';
  const backTo = course ? `/curso/${courseId}` : '/app';
  const persistedCourseId = course?.id ?? '__interleaved__';
  const persistedTitle = course?.title ?? 'Modo intercalado';

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
          <Link to={backTo} className="btn-secondary">
            {course ? 'Voltar ao curso' : 'Voltar ao painel'}
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
    if (submitted || !user) return;
    if (!course && !isInterleaved) return;
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
      courseId: persistedCourseId,
      courseTitle: persistedTitle,
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
    <section className="bg-paper pb-28 md:pb-0">
      <div className="mx-auto w-full max-w-4xl space-y-7 px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
        {/* Tag + número */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={backTo}
            className="inline-flex items-center rounded-full bg-blush px-4 py-1.5 font-display text-[11px] uppercase tracking-[0.22em] text-wine transition hover:bg-blush/80"
          >
            {titleLabel}
          </Link>
          <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
            questão {String(Math.max(answeredCount, 1)).padStart(2, '0')} de{' '}
            {String(questions.length).padStart(2, '0')}
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-blush">
          <div
            className="h-full rounded-full bg-wine transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {config.timed && !submitted && (
          <div className="card flex items-center justify-between px-6 py-4">
            <div className="font-display text-[11px] uppercase tracking-[0.2em] text-mute">
              tempo decorrido
            </div>
            <div className="font-display text-2xl italic text-ink">{formatTime(elapsedSec)}</div>
          </div>
        )}

      {session && submitted && (
        <ResultPanel
          ref={resultRef}
          session={session}
          questions={questions}
          displayMode={displayMode}
          mode={mode}
          bilheteCount={
            mode === 'bilhete' && displayMode === 'namorado' && provaBilhete ? 1 : 0
          }
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
          const bilheteSlot = Math.floor(questions.length / 2);
          const showBilheteAfter =
            mode === 'bilhete' &&
            displayMode === 'namorado' &&
            provaBilhete !== null &&
            idx === bilheteSlot - 1 &&
            idx + 1 < questions.length;

          let rendered: React.ReactNode = null;
          if (q.type === 'mc') {
            rendered = (
              <QuestionCard
                question={q}
                index={idx}
                submitted={submitted}
                phrase={phrase}
                onSelect={(optIdx) => selectOption(idx, optIdx)}
              />
            );
          } else if (q.type === 'ecg') {
            rendered = (
              <EcgInterpret
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
          } else if (q.type === 'case') {
            rendered = (
              <CaseClinical
                question={q}
                index={idx}
                submitted={submitted}
                state={{ stepAnswers: q.stepAnswers ?? {} }}
                onUpdate={(next) => updateCaseState(idx, next)}
              />
            );
          } else {
            rendered = (
              <Matching
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
          }

          if (!showBilheteAfter || !provaBilhete) {
            return <div key={q.id + '-' + idx}>{rendered}</div>;
          }

          const bilhete = provaBilhete;
          const partner = user?.partnerName?.trim() || '';
          return (
            <div key={q.id + '-' + idx} className="space-y-4">
              {rendered}
              <div className="my-2 flex items-center justify-center gap-3 text-rose opacity-60">
                <span className="h-px w-12 bg-rose-soft" />
                <span className="text-[10px] uppercase tracking-[0.32em] text-gold">
                  uma pausa pra você
                </span>
                <span className="h-px w-12 bg-rose-soft" />
              </div>
              <BilheteCard
                bilhete={bilhete}
                signature={partner || undefined}
                uid={user?.uid}
                onClick={() => setFocusBilhete(bilhete)}
              />
              <div className="text-center text-[11px] italic text-muted">
                toca o bilhete para uma pausa de verdade
              </div>
            </div>
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
              <Link to={backTo} className="btn-primary flex-1 sm:flex-none">
                {course ? 'Outro modo' : 'Voltar'}
              </Link>
            </>
          )}
        </div>
      </div>

        <BilheteFocus
          open={focusBilhete !== null}
          bilhete={focusBilhete}
          signature={user?.partnerName?.trim() || undefined}
          uid={user?.uid}
          onClose={() => setFocusBilhete(null)}
        />
      </div>
    </section>
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
  const isRight = submitted && question.selected === question.correct;
  const isNamorado = /amor|doutora|querida|carinho|mandou|boa,/i.test(phrase);

  return (
    <article className="card overflow-hidden p-8 sm:p-10">
      <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
        {String(index + 1).padStart(2, '0')} · {question.topic}
      </div>

      {question.imageUrl && (
        <figure className="mt-5 overflow-hidden rounded-2xl border border-line bg-card">
          <img
            src={question.imageUrl}
            alt={question.imageCaption ?? 'imagem da questão'}
            className="w-full object-contain"
            loading="lazy"
          />
          {question.imageCaption && (
            <figcaption className="border-t border-line px-4 py-2 font-body text-xs italic text-mute">
              {question.imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      <p className="mt-5 font-display text-[20px] leading-snug text-ink sm:text-[22px]">
        {question.q}
      </p>

      <div className="mt-7 flex flex-col gap-3">
        {question.options.map((opt, i) => {
          const isSelected = question.selected === i;
          const isCorrectOpt = i === question.correct;

          let rowClass = 'border-line bg-card text-txt hover:border-wine/30 hover:bg-blush/40';
          if (!submitted && isSelected) rowClass = 'border-wine bg-blush text-ink';
          if (submitted && isCorrectOpt) rowClass = 'border-wine bg-blush text-ink';
          if (submitted && isSelected && !isCorrectOpt)
            rowClass = 'border-red/40 bg-red-soft text-ink';

          let letterClass = 'bg-blush text-wine';
          if (!submitted && isSelected) letterClass = 'bg-wine text-[#FBEFEC]';
          if (submitted && isCorrectOpt) letterClass = 'bg-wine text-[#FBEFEC]';
          if (submitted && isSelected && !isCorrectOpt) letterClass = 'bg-red text-white';

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              disabled={submitted}
              className={`flex min-h-[60px] items-center gap-4 rounded-full border px-4 py-3 text-left font-body text-[15px] leading-snug transition ${rowClass} disabled:cursor-default`}
            >
              <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm italic ${letterClass}`}
              >
                {LETTERS[i]}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {submitted && (
          <motion.div
            key="expl"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: duration.base, ease: easeOutExpo, delay: index * 0.04 }}
          >
            <FeedbackCard
              isRight={isRight}
              phrase={phrase}
              correctLetter={LETTERS[question.correct]}
              explanation={question.expl}
              mode={isNamorado ? 'namorado' : 'doutora'}
            />
          </motion.div>
        )}
      </AnimatePresence>
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
