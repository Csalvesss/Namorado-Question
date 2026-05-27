import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { DifficultySelector, FieldRow } from './FlashcardForm';
import type { CaseStep, Difficulty, ImportCaseQuestion } from '../../types';

const LETTERS = ['A', 'B', 'C', 'D'];

interface Props {
  onAdd: (q: ImportCaseQuestion) => void;
  defaultTopic?: string;
}

function emptyStep(): CaseStep {
  return {
    id: Math.random().toString(36).slice(2, 8),
    prompt: '',
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    expl: '',
  };
}

export default function CaseForm({ onAdd, defaultTopic = '' }: Props) {
  const [topic, setTopic] = useState(defaultTopic);
  const [vignette, setVignette] = useState('');
  const [steps, setSteps] = useState<CaseStep[]>([emptyStep()]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const validSteps = steps.filter(
    (s) => s.question.trim() && s.options.every((o) => o.trim()) && s.expl.trim(),
  );
  const ready = topic.trim() && vignette.trim() && validSteps.length >= 1;

  function setStep<K extends keyof CaseStep>(i: number, key: K, value: CaseStep[K]) {
    setSteps((cur) => cur.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));
  }

  function setStepOption(i: number, optIdx: number, value: string) {
    setSteps((cur) =>
      cur.map((s, idx) =>
        idx === i
          ? { ...s, options: s.options.map((o, oi) => (oi === optIdx ? value : o)) }
          : s,
      ),
    );
  }

  function removeStep(i: number) {
    setSteps((cur) => (cur.length > 1 ? cur.filter((_, idx) => idx !== i) : cur));
  }

  function addStep() {
    if (steps.length >= 6) return;
    setSteps((cur) => [...cur, emptyStep()]);
  }

  function handleAdd() {
    if (!ready) return;
    onAdd({
      type: 'case',
      topic: topic.trim(),
      vignette: vignette.trim(),
      steps: validSteps.map((s) => ({
        id: s.id,
        prompt: s.prompt?.trim() || undefined,
        question: s.question.trim(),
        options: s.options.map((o) => o.trim()),
        correct: s.correct,
        expl: s.expl.trim(),
      })),
      difficulty,
    });
    setVignette('');
    setSteps([emptyStep()]);
  }

  return (
    <div className="space-y-4">
      <FieldRow label="Tópico">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input-elegant"
          placeholder="ex: Sepse urinária"
        />
      </FieldRow>

      <FieldRow label="Vinheta clínica" hint="3 a 6 linhas com dados do paciente">
        <textarea
          value={vignette}
          onChange={(e) => setVignette(e.target.value)}
          rows={5}
          className="input-elegant"
          placeholder="Mulher, 68 anos, trazida ao PS por familiares. Febre há 3 dias..."
        />
      </FieldRow>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Decisões encadeadas
          </span>
          <span className="text-[11px] italic text-muted">
            {validSteps.length} de {steps.length} preenchidas
          </span>
        </div>

        {steps.map((step, i) => (
          <div key={step.id} className="rounded-xl border border-line bg-bg-soft p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-soft font-serif text-sm font-semibold text-wine-deep">
                {i + 1}
              </span>
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="text-muted transition hover:text-red"
                  aria-label="Remover passo"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <FieldRow label="Nova informação (opcional)" hint="dado revelado antes da pergunta">
                <input
                  value={step.prompt ?? ''}
                  onChange={(e) => setStep(i, 'prompt', e.target.value)}
                  className="input-elegant"
                  placeholder="Após pedir hemograma, você recebe Hb 7,2..."
                />
              </FieldRow>

              <FieldRow label="Pergunta">
                <textarea
                  value={step.question}
                  onChange={(e) => setStep(i, 'question', e.target.value)}
                  rows={2}
                  className="input-elegant"
                  placeholder="Qual a conduta inicial mais correta?"
                />
              </FieldRow>

              <FieldRow label="Alternativas" hint="marca a correta">
                <div className="space-y-2">
                  {step.options.map((opt, oi) => (
                    <div key={oi} className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => setStep(i, 'correct', oi)}
                        className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-serif text-sm font-semibold transition ${
                          step.correct === oi
                            ? 'border-green bg-green-soft text-green'
                            : 'border-line bg-paper text-wine hover:border-wine'
                        }`}
                      >
                        {LETTERS[oi]}
                      </button>
                      <input
                        value={opt}
                        onChange={(e) => setStepOption(i, oi, e.target.value)}
                        className="input-elegant flex-1"
                        placeholder={`Alternativa ${LETTERS[oi]}`}
                      />
                    </div>
                  ))}
                </div>
              </FieldRow>

              <FieldRow label="Explicação">
                <textarea
                  value={step.expl}
                  onChange={(e) => setStep(i, 'expl', e.target.value)}
                  rows={2}
                  className="input-elegant"
                  placeholder="Justifica e cita guideline quando fizer sentido."
                />
              </FieldRow>
            </div>
          </div>
        ))}

        {steps.length < 6 && (
          <button
            type="button"
            onClick={addStep}
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-wine transition hover:text-wine-deep"
          >
            <Plus className="h-3 w-3" strokeWidth={2} />
            Adicionar decisão
          </button>
        )}
      </div>

      <FieldRow label="Dificuldade">
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </FieldRow>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!ready}
          className="btn-primary disabled:cursor-not-allowed"
        >
          <Plus className="mr-2 h-4 w-4" strokeWidth={2} />
          Adicionar caso
        </button>
      </div>
    </div>
  );
}
