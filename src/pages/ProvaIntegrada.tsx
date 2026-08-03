import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Eyebrow from '../components/ui/Eyebrow';
import { useUser } from '../lib/useUser';
import {
  AVAILABLE_EXAMS,
  clearAttempt,
  countQuestions,
  countReadyCases,
  loadAttempt,
  loadValidations,
  newAttempt,
  saveAttempt,
  scoreAttempt,
  effectiveQuestionStatus,
} from '../lib/prova-integrada';
import type {
  ExamAttempt,
  ExamAttemptAnswer,
  ExamCase,
  ExamDiscursiveQuestion,
  ExamMCQuestion,
  ExamQuestion,
  ExamReference,
  IntegratedExam,
  ExamValidation,
} from '../types';

type Phase = 'select' | 'intro' | 'exam' | 'identify' | 'confirm' | 'result';

export default function ProvaIntegrada() {
  const navigate = useNavigate();
  const { user } = useUser();
  // Tem mais de uma prova? Começa na seleção. Só uma? Pula direto pra intro.
  const [phase, setPhase] = useState<Phase>(
    AVAILABLE_EXAMS.length > 1 ? 'select' : 'intro',
  );
  const [selectedExam, setSelectedExam] = useState<IntegratedExam>(AVAILABLE_EXAMS[0]);
  const [attempt, setAttempt] = useState<ExamAttempt>(() => {
    return loadAttempt() ?? newAttempt(AVAILABLE_EXAMS[0].id, AVAILABLE_EXAMS[0].version);
  });
  const [caseIdx, setCaseIdx] = useState(0);
  const [validations, setValidations] = useState<Map<string, ExamValidation>>(new Map());

  // Carrega validações da prova selecionada. Falha silenciosa.
  useEffect(() => {
    loadValidations(selectedExam.id)
      .then(setValidations)
      .catch(() => {});
  }, [selectedExam.id]);

  // Persiste a cada mudança da tentativa enquanto não enviou.
  useEffect(() => {
    if (phase === 'exam' || phase === 'identify' || phase === 'confirm') {
      saveAttempt(attempt);
    }
  }, [attempt, phase]);

  const visibleCases = useMemo(
    () => selectedExam.cases.filter((c) => c.questions.length > 0),
    [selectedExam],
  );

  function updateAnswer(qid: string, patch: Partial<ExamAttemptAnswer>) {
    setAttempt((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [qid]: { ...prev.answers[qid], ...patch },
      },
    }));
  }

  function handleStart() {
    const fresh = newAttempt(selectedExam.id, selectedExam.version);
    setAttempt(fresh);
    setCaseIdx(0);
    setPhase('exam');
  }

  function handleSubmit() {
    const completed: ExamAttempt = {
      ...attempt,
      completedAt: Date.now(),
      durationMs: Date.now() - attempt.startedAt,
    };
    const { totalEarned } = scoreAttempt(completed, selectedExam);
    completed.score = totalEarned;
    setAttempt(completed);
    saveAttempt(completed);
    setPhase('result');
  }

  function handleReset() {
    clearAttempt();
    setAttempt(newAttempt(selectedExam.id, selectedExam.version));
    setPhase(AVAILABLE_EXAMS.length > 1 ? 'select' : 'intro');
  }

  function handlePickExam(exam: IntegratedExam) {
    setSelectedExam(exam);
    // Se a tentativa local não é da prova escolhida, começa do zero.
    if (attempt.examId !== exam.id) {
      setAttempt(newAttempt(exam.id, exam.version));
    }
    setCaseIdx(0);
    setPhase('intro');
  }

  if (phase === 'select') {
    return <SelectPhase onPick={handlePickExam} />;
  }
  if (phase === 'intro') {
    return (
      <IntroPhase
        exam={selectedExam}
        validations={validations}
        onStart={() => setPhase('exam')}
        onClearExisting={handleStart}
        onBack={AVAILABLE_EXAMS.length > 1 ? () => setPhase('select') : undefined}
        hasDraft={!attempt.completedAt && Object.keys(attempt.answers).length > 0}
      />
    );
  }
  if (phase === 'exam') {
    return (
      <ExamPhase
        exam={selectedExam}
        attempt={attempt}
        cases={visibleCases}
        caseIdx={caseIdx}
        onSetCaseIdx={setCaseIdx}
        onAnswer={updateAnswer}
        onGoIdentify={() => setPhase('identify')}
        validations={validations}
      />
    );
  }
  if (phase === 'identify') {
    return (
      <IdentifyPhase
        attempt={attempt}
        user={user ? { name: user.name, email: user.email } : null}
        onBack={() => setPhase('exam')}
        onConfirm={(name, ra) => {
          setAttempt((p) => ({ ...p, studentName: name, studentRA: ra }));
          setPhase('confirm');
        }}
      />
    );
  }
  if (phase === 'confirm') {
    return (
      <ConfirmPhase
        attempt={attempt}
        cases={visibleCases}
        onBack={() => setPhase('identify')}
        onSubmit={handleSubmit}
      />
    );
  }
  return (
    <ResultPhase
      exam={selectedExam}
      attempt={attempt}
      cases={visibleCases}
      onAnswerUpdate={updateAnswer}
      onReset={handleReset}
      onExit={() => navigate('/app')}
    />
  );
}

// ===========================================================================
// FASE 1 — Abertura
// ===========================================================================

function IntroPhase({
  exam,
  validations,
  onStart,
  onClearExisting,
  onBack,
  hasDraft,
}: {
  exam: IntegratedExam;
  validations: Map<string, ExamValidation>;
  onStart: () => void;
  onClearExisting: () => void;
  onBack?: () => void;
  hasDraft: boolean;
}) {
  const [accepted, setAccepted] = useState(false);
  const stats = countQuestions(exam);
  const readyCases = countReadyCases(exam);
  let pendingValidation = 0;
  for (const c of exam.cases) {
    for (const q of c.questions) {
      if (effectiveQuestionStatus(q, validations) !== 'validated') pendingValidation += 1;
    }
  }
  const allValidated = stats.total > 0 && pendingValidation === 0;

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-20 lg:px-16">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 font-display text-xs italic text-mute underline-offset-4 hover:underline"
          >
            ← escolher outra prova
          </button>
        )}
        <Eyebrow>avaliação integrada</Eyebrow>
        <h1 className="mt-4 font-display font-light leading-[1.05] text-ink text-[clamp(2.5rem,7vw,4.5rem)]">
          {exam.title}
        </h1>
        {exam.subtitle && (
          <p className="mt-3 font-display text-xl italic text-mute">{exam.subtitle}</p>
        )}

        {!allValidated && (
          <div className="mt-8 rounded-2xl border-l-2 border-amber-500 bg-amber-50 px-5 py-4">
            <p className="font-display text-sm italic text-amber-900">
              Esta prova ainda está em validação pelo prof médico sênior ({pendingValidation} questão
              {pendingValidation === 1 ? '' : 'es'} pendente
              {pendingValidation === 1 ? '' : 's'}). Você pode visualizar e testar, mas as questões podem
              mudar antes da versão final.
            </p>
          </div>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-4">
          <Stat label="casos clínicos" value={String(readyCases)} />
          <Stat label="questões" value={String(stats.total)} sub={`${stats.mc} obj · ${stats.discursive} disc`} />
          <Stat label="pontos totais" value={String(exam.totalPoints)} />
          <Stat label="tempo sugerido" value={`${Math.round(exam.estimatedMinutes / 60)}h${exam.estimatedMinutes % 60 || ''}`} />
        </div>

        <div className="card mt-10 space-y-5 p-8 sm:p-10">
          <Eyebrow>como funciona</Eyebrow>
          <div className="space-y-3 font-body text-base leading-relaxed text-txt">
            <p>
              A Prova Integrada <strong>não separa as questões por matéria</strong>. Cada caso clínico
              traz um paciente com história, evolução, exame físico e exames complementares (com valores
              de referência) — e dele derivam questões que cobram disciplinas diferentes ao mesmo tempo.
              Esse é o sentido de <em>integrada</em>.
            </p>
            <p>
              A prova vale <strong>1000 pontos</strong>. Há dois tipos de questão:
            </p>
            <ul className="ml-5 list-disc space-y-1 text-mute">
              <li>
                <strong className="text-ink">Objetivas</strong>: múltipla escolha com 5 alternativas,
                uma correta, valendo <strong>20 pontos</strong> cada.
              </li>
              <li>
                <strong className="text-ink">Discursivas</strong>: redação curta, valendo{' '}
                <strong>25 pontos</strong> cada, com <strong>pontuação parcial por etapa</strong> da
                resposta. Após enviar, você verá o gabarito modelo e fará auto-avaliação por rubrica.
              </li>
            </ul>
            <p>
              <strong>A interpretação do texto faz parte da avaliação.</strong> Cada questão, ao fim,
              mostra Feedback, Justificativa e Referência bibliográfica usada.
            </p>
          </div>
        </div>

        <div className="card mt-6 space-y-3 p-8 sm:p-10">
          <Eyebrow>orientações</Eyebrow>
          <ul className="ml-5 list-disc space-y-2 font-body text-base text-txt">
            {exam.instructions.map((line: string, i: number) => (
              <li key={i} className="text-mute">
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="card mt-6 p-8 sm:p-10">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-5 w-5"
            />
            <span className="font-body text-base text-txt">
              Concordo com as orientações acima, declaro que vou realizar a prova de forma honesta,
              sem consulta não autorizada, e entendo que a identificação (Nome e RA) será exigida ao
              final.
            </span>
          </label>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!accepted}
              onClick={onStart}
              className="rounded-full bg-wine px-8 py-3 font-display italic text-paper disabled:opacity-50"
            >
              Iniciar prova
            </button>
            {hasDraft && (
              <button
                type="button"
                onClick={onClearExisting}
                className="font-display text-sm italic text-mute underline-offset-4 hover:underline"
              >
                descartar rascunho e começar do zero
              </button>
            )}
          </div>
          {hasDraft && (
            <p className="mt-3 font-body text-sm italic text-mute">
              tem um rascunho salvo — você pode continuar de onde parou clicando em "Iniciar prova".
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5">
      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-mute">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      {sub && <p className="mt-1 font-body text-xs text-mute">{sub}</p>}
    </div>
  );
}

// ===========================================================================
// FASE 2 — Aplicação da prova
// ===========================================================================

function ExamPhase({
  exam,
  attempt,
  cases,
  caseIdx,
  onSetCaseIdx,
  onAnswer,
  onGoIdentify,
  validations,
}: {
  exam: IntegratedExam;
  attempt: ExamAttempt;
  cases: ExamCase[];
  caseIdx: number;
  onSetCaseIdx: (i: number) => void;
  onAnswer: (qid: string, patch: Partial<ExamAttemptAnswer>) => void;
  onGoIdentify: () => void;
  validations: Map<string, ExamValidation>;
}) {
  if (cases.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="font-display italic text-mute">
          Nenhum caso pronto ainda. Aguarde a validação do prof sênior.
        </p>
      </div>
    );
  }
  const currentCase = cases[Math.min(caseIdx, cases.length - 1)];
  const totalAnswered = Object.keys(attempt.answers).filter((qid) => {
    const a = attempt.answers[qid];
    return typeof a.mcSelected === 'number' || (a.discursiveText && a.discursiveText.trim().length > 0);
  }).length;
  const totalQuestions = cases.reduce((sum, c) => sum + c.questions.length, 0);

  return (
    <section className="bg-paper">
      <Cronometer startedAt={attempt.startedAt} estimatedMinutes={exam.estimatedMinutes} />
      <div className="mx-auto w-full max-w-4xl px-6 pb-32 pt-8 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Eyebrow>
            caso {caseIdx + 1} de {cases.length}
          </Eyebrow>
          <p className="font-display text-xs italic text-mute">
            {totalAnswered}/{totalQuestions} respondidas
          </p>
        </div>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{currentCase.title}</h2>
        <p className="mt-2 font-body text-sm italic text-mute">
          {currentCase.disciplines.join(' · ')}
        </p>

        <CaseHeader caseData={currentCase} />

        <ol className="mt-10 space-y-8">
          {currentCase.questions.map((q, idx) => (
            <QuestionEditor
              key={q.id}
              question={q}
              index={idx}
              answer={attempt.answers[q.id]}
              onAnswer={(patch) => onAnswer(q.id, patch)}
              validationStatus={effectiveQuestionStatus(q, validations)}
            />
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            disabled={caseIdx === 0}
            onClick={() => onSetCaseIdx(caseIdx - 1)}
            className="rounded-full border border-[var(--blush-stroke)] px-5 py-2 font-display text-sm italic text-ink disabled:opacity-40"
          >
            ← caso anterior
          </button>
          {caseIdx < cases.length - 1 ? (
            <button
              type="button"
              onClick={() => onSetCaseIdx(caseIdx + 1)}
              className="rounded-full bg-wine px-6 py-2 font-display text-sm italic text-paper"
            >
              próximo caso →
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoIdentify}
              className="rounded-full bg-wine px-6 py-2 font-display text-sm italic text-paper"
            >
              finalizar →
            </button>
          )}
        </div>

        <CaseNav cases={cases} caseIdx={caseIdx} onJump={onSetCaseIdx} attempt={attempt} />
      </div>
    </section>
  );
}

function Cronometer({
  startedAt,
  estimatedMinutes,
}: {
  startedAt: number;
  estimatedMinutes: number;
}) {
  const [now, setNow] = useState(Date.now());
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    timerRef.current = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);
  const elapsedSec = Math.floor((now - startedAt) / 1000);
  const totalSec = estimatedMinutes * 60;
  const remaining = totalSec - elapsedSec;
  const overtime = remaining < 0;
  const abs = Math.abs(remaining);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-6 py-2 sm:px-10">
        <span className="font-display text-[10px] uppercase tracking-[0.22em] text-mute">
          {overtime ? 'tempo esgotado' : 'tempo restante'}
        </span>
        <span
          className={
            'font-mono text-lg ' + (overtime ? 'text-red' : remaining < 600 ? 'text-amber-700' : 'text-ink')
          }
        >
          {overtime ? '+' : ''}
          {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

function CaseHeader({ caseData }: { caseData: ExamCase }) {
  return (
    <div className="card mt-6 space-y-4 p-6 sm:p-8">
      <div>
        <Eyebrow>paciente</Eyebrow>
        <p className="mt-1 font-body text-base text-txt">
          <strong>{caseData.patient.sex === 'F' ? 'Mulher' : 'Homem'}, {caseData.patient.age} anos.</strong>{' '}
          {caseData.patient.context}
        </p>
        <p className="mt-2 font-body text-base text-txt">
          <strong>QD:</strong> {caseData.patient.complaint}
        </p>
      </div>
      <div>
        <Eyebrow>história e evolução</Eyebrow>
        <p className="mt-1 font-body text-base leading-relaxed text-txt">{caseData.history}</p>
        {caseData.evolution && (
          <p className="mt-2 font-body text-base leading-relaxed text-txt">{caseData.evolution}</p>
        )}
      </div>
      <div>
        <Eyebrow>exame físico</Eyebrow>
        <p className="mt-1 font-body text-base text-txt">
          <strong>Sinais vitais:</strong> {caseData.physicalExam.vitals}
        </p>
        <p className="mt-2 font-body text-base text-txt">{caseData.physicalExam.findings}</p>
      </div>
      {caseData.labs && caseData.labs.length > 0 && (
        <div>
          <Eyebrow>exames complementares</Eyebrow>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full font-body text-sm">
              <tbody>
                {caseData.labs.map((l, i) => (
                  <tr key={i} className="border-b border-[var(--blush-stroke)]">
                    <td className="py-1.5 pr-3 text-mute">{l.name}</td>
                    <td className={'py-1.5 pr-3 ' + (l.abnormal ? 'font-semibold text-red' : 'text-ink')}>
                      {l.value}
                    </td>
                    {l.refRange && <td className="py-1.5 pr-3 text-xs text-mute">VR: {l.refRange}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {caseData.imaging && (
        <div>
          <Eyebrow>imagem</Eyebrow>
          <p className="mt-1 font-body text-base text-txt">{caseData.imaging}</p>
        </div>
      )}
    </div>
  );
}

function CaseNav({
  cases,
  caseIdx,
  onJump,
  attempt,
}: {
  cases: ExamCase[];
  caseIdx: number;
  onJump: (i: number) => void;
  attempt: ExamAttempt;
}) {
  return (
    <div className="mt-12 border-t border-line pt-6">
      <Eyebrow>navegar entre casos</Eyebrow>
      <div className="mt-3 flex flex-wrap gap-2">
        {cases.map((c, i) => {
          const answered = c.questions.filter((q) => {
            const a = attempt.answers[q.id];
            return typeof a?.mcSelected === 'number' || (a?.discursiveText && a.discursiveText.trim().length > 0);
          }).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onJump(i)}
              className={
                'rounded-full border px-3 py-1.5 font-display text-xs italic ' +
                (i === caseIdx
                  ? 'border-wine bg-wine text-paper'
                  : 'border-[var(--blush-stroke)] text-ink hover:bg-blush')
              }
            >
              {i + 1}. {c.title.split('—')[0]?.trim() ?? c.title} ({answered}/{c.questions.length})
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuestionEditor({
  question,
  index,
  answer,
  onAnswer,
  validationStatus,
}: {
  question: ExamQuestion;
  index: number;
  answer: ExamAttemptAnswer | undefined;
  onAnswer: (patch: Partial<ExamAttemptAnswer>) => void;
  validationStatus: 'draft' | 'validated' | 'rejected';
}) {
  return (
    <li className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl text-wine">{index + 1}.</span>
          <span className="font-display text-xs italic text-mute">
            {question.kind === 'mc' ? 'objetiva · 20 pts' : 'discursiva · 25 pts'}
          </span>
        </div>
        {validationStatus !== 'validated' && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-display text-[10px] italic text-amber-900">
            {validationStatus === 'rejected' ? 'rejeitada' : 'em validação'}
          </span>
        )}
      </div>
      <p className="mt-3 font-body text-base leading-relaxed text-txt">{question.prompt}</p>

      {question.kind === 'mc' ? (
        <ul className="mt-4 space-y-2">
          {question.options.map((opt, i) => {
            const selected = answer?.mcSelected === i;
            return (
              <li key={i}>
                <label
                  className={
                    'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 ' +
                    (selected
                      ? 'border-wine bg-blush'
                      : 'border-[var(--blush-stroke)] hover:bg-blush/40')
                  }
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={selected}
                    onChange={() => onAnswer({ mcSelected: i })}
                    className="mt-1"
                  />
                  <span className="font-body text-sm text-txt">
                    <strong>{String.fromCharCode(65 + i)})</strong> {opt}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : (
        <textarea
          rows={6}
          value={answer?.discursiveText ?? ''}
          onChange={(e) => onAnswer({ discursiveText: e.target.value })}
          placeholder="Escreva sua resposta. Procure estruturar em tópicos correspondentes à rubrica esperada (você verá a rubrica após enviar)."
          className="mt-4 w-full rounded-xl border border-[var(--blush-stroke)] bg-paper px-4 py-3 font-body text-sm text-txt outline-none focus:border-rose"
        />
      )}
    </li>
  );
}

// ===========================================================================
// FASE 3 — Identificação
// ===========================================================================

function IdentifyPhase({
  attempt,
  user,
  onBack,
  onConfirm,
}: {
  attempt: ExamAttempt;
  user: { name: string; email: string } | null;
  onBack: () => void;
  onConfirm: (name: string, ra: string) => void;
}) {
  const [name, setName] = useState(attempt.studentName ?? user?.name ?? '');
  const [ra, setRA] = useState(attempt.studentRA ?? '');
  const valid = name.trim().length >= 3 && ra.trim().length >= 3;
  return (
    <section className="mx-auto max-w-2xl px-6 py-16 sm:px-10 sm:py-24">
      <Eyebrow>identificação</Eyebrow>
      <h2 className="mt-4 font-display text-4xl text-ink">quase lá</h2>
      <p className="mt-4 font-body text-base italic leading-relaxed text-mute">
        Preencha seu nome completo e RA para finalizar.
      </p>
      <div className="card mt-8 space-y-4 p-8">
        <div>
          <label className="font-display text-[11px] uppercase tracking-[0.2em] text-mute">
            nome completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--blush-stroke)] bg-paper px-4 py-3 font-body text-base outline-none focus:border-rose"
          />
        </div>
        <div>
          <label className="font-display text-[11px] uppercase tracking-[0.2em] text-mute">RA</label>
          <input
            type="text"
            value={ra}
            onChange={(e) => setRA(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--blush-stroke)] bg-paper px-4 py-3 font-body text-base outline-none focus:border-rose"
          />
        </div>
        <div className="flex justify-between pt-2">
          <button type="button" onClick={onBack} className="font-display text-sm italic text-mute">
            ← voltar à prova
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={() => onConfirm(name.trim(), ra.trim())}
            className="rounded-full bg-wine px-6 py-2 font-display italic text-paper disabled:opacity-50"
          >
            revisar antes de enviar →
          </button>
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// FASE 4 — Confirmação
// ===========================================================================

function ConfirmPhase({
  attempt,
  cases,
  onBack,
  onSubmit,
}: {
  attempt: ExamAttempt;
  cases: ExamCase[];
  onBack: () => void;
  onSubmit: () => void;
}) {
  const total = cases.reduce((s, c) => s + c.questions.length, 0);
  const answered = Object.keys(attempt.answers).filter((qid) => {
    const a = attempt.answers[qid];
    return typeof a.mcSelected === 'number' || (a.discursiveText && a.discursiveText.trim().length > 0);
  }).length;
  const skipped = total - answered;
  return (
    <section className="mx-auto max-w-2xl px-6 py-16 sm:px-10 sm:py-24">
      <Eyebrow>confirmar envio</Eyebrow>
      <h2 className="mt-4 font-display text-4xl text-ink">tem certeza?</h2>
      <div className="card mt-8 space-y-3 p-8">
        <p className="font-body text-base text-txt">
          <strong>Aluna:</strong> {attempt.studentName} · RA {attempt.studentRA}
        </p>
        <p className="font-body text-base text-txt">
          <strong>{answered}</strong> de <strong>{total}</strong> respondidas{' '}
          {skipped > 0 && <span className="text-amber-700">— {skipped} em branco</span>}
        </p>
        <p className="font-body text-sm italic text-mute">
          Após enviar, você verá a nota total sobre 1000 e o gabarito de cada questão com Feedback,
          Justificativa e Referência.
        </p>
        <div className="flex justify-between pt-3">
          <button type="button" onClick={onBack} className="font-display text-sm italic text-mute">
            ← editar identificação
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-full bg-wine px-6 py-2 font-display italic text-paper"
          >
            enviar prova
          </button>
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// FASE 5 — Resultado e correção
// ===========================================================================

function ResultPhase({
  exam,
  attempt,
  cases,
  onAnswerUpdate,
  onReset,
  onExit,
}: {
  exam: IntegratedExam;
  attempt: ExamAttempt;
  cases: ExamCase[];
  onAnswerUpdate: (qid: string, patch: Partial<ExamAttemptAnswer>) => void;
  onReset: () => void;
  onExit: () => void;
}) {
  const { totalEarned, totalMax, perQuestion } = scoreAttempt(attempt, exam);
  const pct = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-20 lg:px-16">
        <Eyebrow>resultado</Eyebrow>
        <h2 className="mt-4 font-display text-4xl text-ink">
          {totalEarned} / {totalMax}
          <span className="ml-3 text-2xl text-mute">({pct}%)</span>
        </h2>
        <p className="mt-2 font-body text-base italic text-mute">
          {attempt.studentName} · RA {attempt.studentRA}
        </p>
        <p className="mt-1 font-body text-sm italic text-mute">
          Pra discursivas, marque os itens da rubrica que você acertou — sua nota atualiza em tempo
          real.
        </p>

        {cases.map((c) => (
          <div key={c.id} className="mt-10">
            <Eyebrow>{c.title.split('—')[0]?.trim() ?? c.title}</Eyebrow>
            <p className="mt-1 font-display text-base italic text-mute">
              {c.disciplines.join(' · ')}
            </p>
            <ol className="mt-4 space-y-6">
              {c.questions.map((q, idx) => (
                <QuestionResult
                  key={q.id}
                  question={q}
                  index={idx}
                  attempt={attempt}
                  onAnswerUpdate={onAnswerUpdate}
                  scored={perQuestion.find((sq) => sq.question.id === q.id)}
                />
              ))}
            </ol>
          </div>
        ))}

        <div className="mt-12 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-[var(--blush-stroke)] px-5 py-2 font-display italic text-ink"
          >
            tentar de novo
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full bg-wine px-5 py-2 font-display italic text-paper"
          >
            voltar ao app
          </button>
        </div>
      </div>
    </section>
  );
}

function QuestionResult({
  question,
  index,
  attempt,
  onAnswerUpdate,
  scored,
}: {
  question: ExamQuestion;
  index: number;
  attempt: ExamAttempt;
  onAnswerUpdate: (qid: string, patch: Partial<ExamAttemptAnswer>) => void;
  scored: { earned: number; max: number; correct: boolean } | undefined;
}) {
  const answer = attempt.answers[question.id];
  const earned = scored?.earned ?? 0;
  const max = scored?.max ?? question.points;
  const ok = scored?.correct ?? false;
  return (
    <li className="card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="font-display text-xl text-wine">{index + 1}.</span>{' '}
          <span className="font-display text-xs italic text-mute">
            {question.kind === 'mc' ? 'objetiva' : 'discursiva'}
          </span>
        </div>
        <div className="font-display text-sm">
          <span className={ok ? 'text-emerald-700' : earned > 0 ? 'text-amber-700' : 'text-red'}>
            {earned}
          </span>{' '}
          <span className="text-mute">/ {max} pts</span>
        </div>
      </div>
      <p className="mt-3 font-body text-base leading-relaxed text-txt">{question.prompt}</p>

      {question.kind === 'mc' ? (
        <MCResult question={question} answer={answer} />
      ) : (
        <DiscursiveResult
          question={question}
          answer={answer}
          onCheckRubric={(rubricIndex, checked) => {
            const cur = answer?.selfAssessedRubric ?? [];
            const next = checked ? Array.from(new Set([...cur, rubricIndex])) : cur.filter((i) => i !== rubricIndex);
            onAnswerUpdate(question.id, { selfAssessedRubric: next });
          }}
        />
      )}

      <div className="mt-5 space-y-3 border-t border-[var(--blush-stroke)] pt-4">
        <ResultBlock label="feedback">{question.feedback}</ResultBlock>
        <ResultBlock label="justificativa">{question.justification}</ResultBlock>
        <ResultBlock label="referências">
          <ul className="space-y-1">
            {question.references.map((r, i) => (
              <li key={i} className="font-body text-xs text-mute">
                <ReferenceLine r={r} />
              </li>
            ))}
          </ul>
        </ResultBlock>
      </div>
    </li>
  );
}

function MCResult({ question, answer }: { question: ExamMCQuestion; answer: ExamAttemptAnswer | undefined }) {
  return (
    <ul className="mt-3 space-y-1">
      {question.options.map((opt, i) => {
        const isCorrect = i === question.correctIndex;
        const isPicked = answer?.mcSelected === i;
        return (
          <li
            key={i}
            className={
              'rounded-lg px-3 py-2 font-body text-sm ' +
              (isCorrect ? 'bg-emerald-50 text-emerald-900' : isPicked ? 'bg-red-soft text-red' : 'text-mute')
            }
          >
            <strong>{String.fromCharCode(65 + i)})</strong> {opt}
            {isCorrect && <span className="ml-2 font-display text-xs italic">✓ correta</span>}
            {isPicked && !isCorrect && (
              <span className="ml-2 font-display text-xs italic">— sua escolha</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function DiscursiveResult({
  question,
  answer,
  onCheckRubric,
}: {
  question: ExamDiscursiveQuestion;
  answer: ExamAttemptAnswer | undefined;
  onCheckRubric: (rubricIndex: number, checked: boolean) => void;
}) {
  const checked = new Set(answer?.selfAssessedRubric ?? []);
  return (
    <div className="mt-4 space-y-4">
      <div>
        <Eyebrow>sua resposta</Eyebrow>
        <p className="mt-1 whitespace-pre-wrap rounded-xl bg-paper-soft p-3 font-body text-sm text-txt">
          {answer?.discursiveText?.trim() || <span className="italic text-mute">(em branco)</span>}
        </p>
      </div>
      <div>
        <Eyebrow>gabarito modelo</Eyebrow>
        <p className="mt-1 whitespace-pre-wrap font-body text-sm leading-relaxed text-txt">
          {question.expectedAnswer}
        </p>
      </div>
      <div>
        <Eyebrow>auto-avaliação (marque o que você acertou)</Eyebrow>
        <ul className="mt-2 space-y-2">
          {question.rubric.map((item, i) => (
            <li key={i}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--blush-stroke)] px-3 py-2">
                <input
                  type="checkbox"
                  checked={checked.has(i)}
                  onChange={(e) => onCheckRubric(i, e.target.checked)}
                  className="mt-1"
                />
                <span className="font-body text-sm text-txt">
                  {item.criterion}{' '}
                  <span className="ml-1 font-display text-xs italic text-mute">+{item.points} pts</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ResultBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-1 font-body text-sm leading-relaxed text-txt">{children}</div>
    </div>
  );
}

function ReferenceLine({ r }: { r: ExamReference }) {
  const bits: string[] = [];
  if (r.authors) bits.push(r.authors);
  bits.push(r.work);
  if (r.edition) bits.push(r.edition);
  if (r.publisher) bits.push(r.publisher);
  if (r.year) bits.push(String(r.year));
  if (r.chapter) bits.push(`Cap.: ${r.chapter}`);
  if (r.professor) bits.push(`Prof.: ${r.professor}`);
  if (r.sourcePdf) bits.push(`PDF: ${r.sourcePdf}`);
  return <span>{bits.join(' · ')}</span>;
}

// ===========================================================================
// FASE 0 — Seleção de prova (só aparece se houver mais de uma)
// ===========================================================================

function SelectPhase({ onPick }: { onPick: (exam: IntegratedExam) => void }) {
  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-20 lg:px-16">
        <Eyebrow>avaliações disponíveis</Eyebrow>
        <h1 className="mt-4 font-display font-light leading-[1.05] text-ink text-[clamp(2.5rem,7vw,4.5rem)]">
          Prova Integrada
        </h1>
        <p className="mt-4 max-w-xl font-body text-base italic leading-relaxed text-mute">
          Escolha qual prova você quer fazer. Cada uma tem casos clínicos
          diferentes, mesmo formato (objetivas + discursivas com rubrica).
        </p>

        <div className="mt-10 grid gap-5">
          {AVAILABLE_EXAMS.map((exam) => {
            const stats = countQuestions(exam);
            const readyCases = countReadyCases(exam);
            return (
              <button
                key={exam.id}
                type="button"
                onClick={() => onPick(exam)}
                className="card w-full p-7 text-left transition hover:border-wine sm:p-9"
              >
                <Eyebrow>{exam.id}</Eyebrow>
                <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                  {exam.title}
                </h2>
                {exam.subtitle && (
                  <p className="mt-1 font-display text-base italic text-mute">
                    {exam.subtitle}
                  </p>
                )}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniStat label="casos" value={String(readyCases)} />
                  <MiniStat
                    label="questões"
                    value={String(stats.total)}
                    sub={`${stats.mc} obj · ${stats.discursive} disc`}
                  />
                  <MiniStat label="pontos" value={String(exam.totalPoints)} />
                  <MiniStat
                    label="tempo sugerido"
                    value={`~${Math.round(exam.estimatedMinutes / 60)}h${
                      exam.estimatedMinutes % 60
                        ? ` ${exam.estimatedMinutes % 60}min`
                        : ''
                    }`}
                  />
                </div>
                <span className="mt-5 inline-flex items-center font-display text-sm italic text-wine">
                  começar →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="font-display text-[10px] uppercase tracking-[0.18em] text-mute">{label}</p>
      <p className="mt-1 font-display text-xl text-ink">{value}</p>
      {sub && <p className="mt-0.5 font-body text-[10px] text-mute">{sub}</p>}
    </div>
  );
}
