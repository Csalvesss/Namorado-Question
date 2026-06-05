import { useCallback, useEffect, useState } from 'react';
import Eyebrow from '../ui/Eyebrow';
import { useUser } from '../../lib/useUser';
import {
  CURRENT_EXAM,
  countValidated,
  effectiveQuestionStatus,
  loadValidations,
  saveValidation,
} from '../../lib/prova-integrada';
import type { ExamQuestion, ExamValidation } from '../../types';

/**
 * Painel do prof médico sênior. Lista cada questão da prova v1 e permite
 * marcar como Validada / Rejeitada com nota opcional. Persiste em
 * Firestore /exam_validations (rules → só admin escreve).
 */
export default function ProvaValidationInner() {
  const { user } = useUser();
  const [validations, setValidations] = useState<Map<string, ExamValidation>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'validated' | 'rejected'>('draft');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const v = await loadValidations(CURRENT_EXAM.id);
      setValidations(v);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSet(q: ExamQuestion, status: 'validated' | 'rejected', notes?: string) {
    if (!user) return;
    try {
      await saveValidation({
        examId: CURRENT_EXAM.id,
        questionId: q.id,
        status,
        reviewedBy: user.uid,
        reviewedByName: user.name,
        notes,
      });
      void refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'falha ao salvar validação');
    }
  }

  const counts = countValidated(CURRENT_EXAM, validations);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Eyebrow>progresso de validação</Eyebrow>
          <p className="mt-1 font-display text-sm italic text-mute">
            {counts.validated}/{counts.total} validadas · {counts.rejected} rejeitadas ·{' '}
            {counts.pending} pendentes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['draft', 'all', 'validated', 'rejected'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                'rounded-full border px-3 py-1.5 font-display text-xs italic ' +
                (filter === f
                  ? 'border-wine bg-wine text-paper'
                  : 'border-[var(--blush-stroke)] text-ink')
              }
            >
              {f === 'draft' ? 'pendentes' : f === 'all' ? 'todas' : f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="mt-6 font-display italic text-mute">carregando…</p>}

      <div className="mt-8 space-y-8">
        {CURRENT_EXAM.cases.map((c) => {
          const visibleQuestions = c.questions.filter((q) => {
            const status = effectiveQuestionStatus(q, validations);
            if (filter === 'all') return true;
            if (filter === 'draft') return status === 'draft';
            return status === filter;
          });
          if (visibleQuestions.length === 0 && c.questions.length === 0) {
            return (
              <div key={c.id} className="card p-5 opacity-60">
                <p className="font-display text-sm italic text-mute">
                  <strong>{c.title}</strong> — sem questões ainda (stub aguardando finalização).
                </p>
              </div>
            );
          }
          if (visibleQuestions.length === 0) return null;
          return (
            <div key={c.id}>
              <Eyebrow>{c.title}</Eyebrow>
              <p className="mt-1 font-display text-xs italic text-mute">
                {c.disciplines.join(' · ')}
              </p>
              <ul className="mt-3 space-y-3">
                {visibleQuestions.map((q) => (
                  <ValidationCard
                    key={q.id}
                    question={q}
                    validation={validations.get(q.id)}
                    onValidate={(notes) => handleSet(q, 'validated', notes)}
                    onReject={(notes) => handleSet(q, 'rejected', notes)}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ValidationCard({
  question,
  validation,
  onValidate,
  onReject,
}: {
  question: ExamQuestion;
  validation: ExamValidation | undefined;
  onValidate: (notes?: string) => void;
  onReject: (notes?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(validation?.notes ?? '');
  const status = validation?.status ?? question.status;

  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs italic text-mute">
            {question.id} · {question.kind === 'mc' ? 'objetiva · 20pts' : 'discursiva · 25pts'} ·{' '}
            {question.disciplines.join(', ')}
          </p>
          <p className="mt-1 font-body text-sm text-txt">{question.prompt}</p>
        </div>
        <span
          className={
            'shrink-0 rounded-full px-2 py-0.5 font-display text-[10px] italic ' +
            (status === 'validated'
              ? 'bg-emerald-100 text-emerald-900'
              : status === 'rejected'
              ? 'bg-red-soft text-red'
              : 'bg-amber-100 text-amber-900')
          }
        >
          {status}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-3 font-display text-xs italic text-mute underline-offset-4 hover:underline"
      >
        {open ? '— ocultar gabarito' : '+ ver gabarito e referências'}
      </button>

      {open && (
        <div className="mt-3 space-y-3 rounded-xl bg-paper-soft p-4 font-body text-sm">
          {question.kind === 'mc' ? (
            <div>
              <Eyebrow>alternativas</Eyebrow>
              <ul className="mt-1 space-y-1">
                {question.options.map((o, i) => (
                  <li
                    key={i}
                    className={
                      i === question.correctIndex ? 'text-emerald-900' : 'text-mute'
                    }
                  >
                    <strong>{String.fromCharCode(65 + i)})</strong> {o}
                    {i === question.correctIndex && (
                      <span className="ml-2 font-display text-xs italic">✓ correta</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <Eyebrow>resposta esperada</Eyebrow>
              <p className="mt-1 whitespace-pre-wrap text-txt">{question.expectedAnswer}</p>
              <Eyebrow>rubrica</Eyebrow>
              <ul className="mt-1 ml-5 list-disc">
                {question.rubric.map((r, i) => (
                  <li key={i} className="text-mute">
                    {r.criterion} <span className="font-display text-xs italic">(+{r.points})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <Eyebrow>feedback</Eyebrow>
            <p className="mt-1 text-txt">{question.feedback}</p>
          </div>
          <div>
            <Eyebrow>justificativa</Eyebrow>
            <p className="mt-1 text-txt">{question.justification}</p>
          </div>
          <div>
            <Eyebrow>referências</Eyebrow>
            <ul className="mt-1 space-y-1 text-xs text-mute">
              {question.references.map((r, i) => (
                <li key={i}>
                  {[r.authors, r.work, r.edition, r.publisher, r.year, r.chapter, r.professor, r.sourcePdf]
                    .filter(Boolean)
                    .join(' · ')}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="comentário do revisor (opcional — ex: 'trocar opção D por...')"
          className="w-full rounded-lg border border-[var(--blush-stroke)] bg-paper px-3 py-2 font-body text-sm text-txt outline-none focus:border-rose"
        />
        {validation?.reviewedAt && (
          <p className="mt-1 font-display text-[10px] italic text-mute">
            revisada por {validation.reviewedByName ?? validation.reviewedBy} em{' '}
            {new Date(validation.reviewedAt).toLocaleString('pt-BR')}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onValidate(notes.trim() || undefined)}
          className="rounded-full bg-emerald-700 px-4 py-1.5 font-display text-xs italic text-paper"
        >
          ✓ validar
        </button>
        <button
          type="button"
          onClick={() => onReject(notes.trim() || undefined)}
          className="rounded-full border border-red px-4 py-1.5 font-display text-xs italic text-red"
        >
          ✗ rejeitar
        </button>
      </div>
    </li>
  );
}
