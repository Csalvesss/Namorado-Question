import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getPhrases } from '../data/phrases';
import { db } from '../lib/db';
import { getMistakeQuestionIds, modeConfig, sampleQuestions, shuffleOptions, type PreparedQuestion } from '../lib/quiz';
import { useUser } from '../lib/useUser';
import type { QuizMode, QuizSession } from '../types';

const LETTERS = ['A', 'B', 'C', 'D'];

interface QuestionState extends PreparedQuestion {
  selected?: number;
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
    });
    setQuestions(raw.map(shuffleOptions));
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
      <div className="card p-10 text-center">
        <p className="font-serif text-xl italic text-ink-soft">
          {mode === 'mistakes'
            ? 'Você ainda não tem questões erradas registradas. Faça uma prova primeiro.'
            : 'Nenhuma questão disponível com esses filtros.'}
        </p>
        <Link to={`/curso/${courseId}`} className="btn-secondary mt-4 inline-block">Voltar ao curso</Link>
      </div>
    );
  }

  const answeredCount = questions.filter((q) => q.selected !== undefined).length;
  const progress = (answeredCount / questions.length) * 100;
  const elapsedSec = Math.floor((now - startedAt) / 1000);
  const displayMode = user?.displayMode ?? 'namorado';
  const phrases = getPhrases(displayMode);

  function selectOption(qIdx: number, optIdx: number) {
    if (submitted) return;
    setQuestions((cur) => cur.map((q, i) => (i === qIdx ? { ...q, selected: optIdx } : q)));
  }

  function submitQuiz() {
    if (submitted || !user || !course) return;
    setSubmitted(true);
    const completedAt = Date.now();
    const answers = questions.map((q) => ({
      questionId: q.id,
      selected: q.selected ?? -1,
      correct: q.correct,
      isRight: q.selected === q.correct,
    }));
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
  }

  function redoQuiz() {
    setSeed((s) => s + 1);
  }

  let rightIdx = 0;
  let wrongIdx = 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={`/curso/${courseId}`} className="btn-ghost -ml-2 text-xs uppercase tracking-wider">
          ← {course.title}
        </Link>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
          <span>{config.icon}</span>
          <span>{config.label}</span>
          {config.timed && !submitted && <span>· {formatTime(elapsedSec)}</span>}
        </div>
      </div>

      <div className="card flex items-center gap-4 px-5 py-4">
        <div className="font-serif text-base text-ink-soft">
          Respondidas <strong className="font-serif text-xl text-wine-deep">{answeredCount}</strong> de{' '}
          <strong className="font-serif text-xl text-wine-deep">{questions.length}</strong>
        </div>
        <div className="flex-1 overflow-hidden rounded-full bg-rose-soft">
          <div className="h-1.5 bg-gradient-to-r from-rose to-wine transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {session && submitted && <ResultPanel ref={resultRef} session={session} displayMode={displayMode} />}

      <div className="space-y-4">
        {questions.map((q, idx) => {
          let phrase = '';
          if (submitted) {
            const isRight = q.selected === q.correct;
            if (isRight) {
              phrase = phrases.right[rightIdx % phrases.right.length];
              rightIdx++;
            } else {
              phrase = phrases.wrong[wrongIdx % phrases.wrong.length];
              wrongIdx++;
            }
          }
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
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        {!submitted ? (
          <button
            onClick={submitQuiz}
            disabled={answeredCount < questions.length && !config.timed}
            className="btn-primary"
          >
            Ver gabarito
          </button>
        ) : (
          <>
            <button onClick={redoQuiz} className="btn-secondary">Refazer a prova</button>
            <Link to={`/curso/${courseId}`} className="btn-primary">Outro modo de estudo</Link>
          </>
        )}
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: QuestionState;
  index: number;
  submitted: boolean;
  phrase: string;
  onSelect: (optIdx: number) => void;
}

function QuestionCard({ question, index, submitted, phrase, onSelect }: QuestionCardProps) {
  const isAnswered = question.selected !== undefined;
  const isRight = submitted && question.selected === question.correct;

  return (
    <article className="card relative overflow-hidden p-7">
      <span
        className={`absolute left-0 top-0 bottom-0 w-[3px] ${isAnswered ? 'bg-wine' : 'bg-rose-soft'}`}
      />
      <div className="mb-1 font-serif text-xs uppercase tracking-[0.3em] text-gold">
        Questão {String(index + 1).padStart(2, '0')}
      </div>
      <span className="label-tag">{question.topic}</span>
      <p className="mb-4 mt-3 text-base leading-relaxed text-ink">{question.q}</p>

      <div className="flex flex-col gap-2">
        {question.options.map((opt, i) => {
          const isSelected = question.selected === i;
          const isCorrectOpt = i === question.correct;
          let classes = 'border-line bg-bg-soft text-ink-soft hover:border-rose hover:bg-paper hover:text-ink';
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
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition ${classes} disabled:cursor-default`}
            >
              <span className={`font-serif text-lg font-semibold ${letterClass}`}>{LETTERS[i]}</span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {submitted && (
        <div
          className={`mt-4 rounded-xl p-4 text-sm ${
            isRight ? 'border-l-[3px] border-green bg-green-soft' : 'border-l-[3px] border-red bg-red-soft'
          }`}
        >
          <div className={`mb-1 font-serif text-base font-semibold italic ${isRight ? 'text-green' : 'text-red'}`}>
            {phrase}
          </div>
          <div className="text-sm text-ink-soft">
            <strong className="text-ink">Resposta correta: {LETTERS[question.correct]}.</strong> {question.expl}
          </div>
        </div>
      )}
    </article>
  );
}

interface ResultPanelProps {
  session: QuizSession;
  displayMode: 'namorado' | 'doutora';
}

const ResultPanel = forwardRef<HTMLDivElement, ResultPanelProps>(function ResultPanel(
  { session, displayMode },
  ref,
) {
  const pct = Math.round((session.score / session.total) * 100);
  const phrases = getPhrases(displayMode);
  const list = pct >= 80 ? phrases.finalHigh : pct >= 50 ? phrases.finalMed : phrases.finalLow;
  const praise = useMemo(() => list[Math.floor(Math.random() * list.length)], [list]);

  return (
    <div
      ref={ref}
      className="animate-slide-in overflow-hidden rounded-2xl border border-line bg-paper-soft px-6 py-8 text-center shadow-soft"
    >
      <div className="mb-1 font-serif text-xs uppercase tracking-[0.4em] text-gold">Resultado da prova</div>
      <div className="font-serif text-7xl font-semibold leading-none text-wine-deep">
        {session.score}
        <span className="text-3xl font-normal text-muted"> / {session.total}</span>
      </div>
      <div className="mt-1 font-serif text-xl italic text-ink-soft">{pct} por cento de acerto</div>
      <p className="mx-auto mt-5 max-w-md font-serif text-2xl italic leading-snug text-wine-deep">{praise}</p>
      <p className="mx-auto mt-3 max-w-md text-sm italic text-ink-soft">
        Olha a explicação de cada questão logo abaixo. Quando quiser, refaz a prova que eu sorteio outras questões.
      </p>
    </div>
  );
});

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
