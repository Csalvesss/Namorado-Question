import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { DifficultySelector, FieldRow } from './FlashcardForm';
import EcgTracing from '../EcgTracing';
import type {
  Difficulty,
  ECGDiagnosis,
  ECGPoint,
  ECGTracingId,
  ImportECGQuestion,
} from '../../types';

const LETTERS = ['A', 'B', 'C', 'D'];

const TRACINGS: Array<{ id: ECGTracingId; label: string }> = [
  { id: 'normal-sinus', label: 'Ritmo sinusal normal' },
  { id: 'sinus-brady', label: 'Bradicardia sinusal' },
  { id: 'sinus-tachy', label: 'Taquicardia sinusal' },
  { id: 'af', label: 'Fibrilação atrial' },
  { id: 'flutter', label: 'Flutter atrial' },
  { id: 'stemi-inferior', label: 'IAM com supra inferior' },
  { id: 'stemi-anterior', label: 'IAM com supra anterior' },
  { id: 'lbbb', label: 'Bloqueio de ramo esquerdo' },
  { id: 'rbbb', label: 'Bloqueio de ramo direito' },
];

interface Props {
  onAdd: (q: ImportECGQuestion) => void;
  defaultTopic?: string;
}

function emptyPoint(): ECGPoint {
  return {
    id: Math.random().toString(36).slice(2, 8),
    label: '',
    hint: '',
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    expl: '',
  };
}

function emptyDiagnosis(): ECGDiagnosis {
  return {
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    expl: '',
  };
}

export default function ECGForm({ onAdd, defaultTopic = '' }: Props) {
  const [topic, setTopic] = useState(defaultTopic);
  const [tracingId, setTracingId] = useState<ECGTracingId>('normal-sinus');
  const [context, setContext] = useState('');
  const [points, setPoints] = useState<ECGPoint[]>([emptyPoint()]);
  const [diagnosis, setDiagnosis] = useState<ECGDiagnosis>(emptyDiagnosis());
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const validPoints = points.filter(
    (p) =>
      p.label.trim() && p.question.trim() && p.options.every((o) => o.trim()) && p.expl.trim(),
  );
  const diagnosisReady =
    diagnosis.question.trim() && diagnosis.options.every((o) => o.trim()) && diagnosis.expl.trim();
  const ready = topic.trim() && validPoints.length >= 1 && diagnosisReady;

  function setPoint<K extends keyof ECGPoint>(i: number, key: K, value: ECGPoint[K]) {
    setPoints((cur) => cur.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));
  }

  function setPointOption(i: number, optIdx: number, value: string) {
    setPoints((cur) =>
      cur.map((p, idx) =>
        idx === i
          ? { ...p, options: p.options.map((o, oi) => (oi === optIdx ? value : o)) }
          : p,
      ),
    );
  }

  function removePoint(i: number) {
    setPoints((cur) => (cur.length > 1 ? cur.filter((_, idx) => idx !== i) : cur));
  }

  function addPoint() {
    if (points.length >= 8) return;
    setPoints((cur) => [...cur, emptyPoint()]);
  }

  function setDiagOption(optIdx: number, value: string) {
    setDiagnosis((cur) => ({
      ...cur,
      options: cur.options.map((o, oi) => (oi === optIdx ? value : o)),
    }));
  }

  function handleAdd() {
    if (!ready) return;
    onAdd({
      type: 'ecg',
      topic: topic.trim(),
      tracingId,
      context: context.trim() || undefined,
      points: validPoints.map((p) => ({
        id: p.id,
        label: p.label.trim(),
        hint: p.hint?.trim() || undefined,
        question: p.question.trim(),
        options: p.options.map((o) => o.trim()),
        correct: p.correct,
        expl: p.expl.trim(),
      })),
      diagnosis: {
        question: diagnosis.question.trim(),
        options: diagnosis.options.map((o) => o.trim()),
        correct: diagnosis.correct,
        expl: diagnosis.expl.trim(),
      },
      difficulty,
    });
    setContext('');
    setPoints([emptyPoint()]);
    setDiagnosis(emptyDiagnosis());
  }

  return (
    <div className="space-y-4">
      <FieldRow label="Tópico">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input-elegant"
          placeholder="ex: Arritmias supraventriculares"
        />
      </FieldRow>

      <FieldRow label="Traçado" hint="escolha o ritmo a ser mostrado">
        <div className="space-y-3">
          <select
            value={tracingId}
            onChange={(e) => setTracingId(e.target.value as ECGTracingId)}
            className="input-elegant"
          >
            {TRACINGS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <EcgTracing tracingId={tracingId} />
        </div>
      </FieldRow>

      <FieldRow label="Contexto clínico (opcional)" hint="vinheta curta sobre o paciente">
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={2}
          className="input-elegant"
          placeholder="Mulher, 70a, palpitação irregular há 1 dia."
        />
      </FieldRow>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
            Pontos de análise
          </span>
          <span className="text-[11px] italic text-muted">
            {validPoints.length} de {points.length} preenchidos
          </span>
        </div>

        {points.map((point, i) => (
          <div key={point.id} className="rounded-xl border border-line bg-bg-soft p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-soft font-serif text-sm font-semibold text-wine-deep">
                {i + 1}
              </span>
              {points.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePoint(i)}
                  className="text-muted transition hover:text-red"
                  aria-label="Remover ponto"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <FieldRow label="Rótulo do ponto">
                <input
                  value={point.label}
                  onChange={(e) => setPoint(i, 'label', e.target.value)}
                  className="input-elegant"
                  placeholder="ex: Ritmo, Onda P, Segmento ST"
                />
              </FieldRow>

              <FieldRow label="Dica (opcional)">
                <input
                  value={point.hint ?? ''}
                  onChange={(e) => setPoint(i, 'hint', e.target.value)}
                  className="input-elegant"
                  placeholder="o que olhar primeiro"
                />
              </FieldRow>

              <FieldRow label="Pergunta">
                <textarea
                  value={point.question}
                  onChange={(e) => setPoint(i, 'question', e.target.value)}
                  rows={2}
                  className="input-elegant"
                  placeholder="Como você descreve a onda P?"
                />
              </FieldRow>

              <FieldRow label="Alternativas" hint="marca a correta">
                <div className="space-y-2">
                  {point.options.map((opt, oi) => (
                    <div key={oi} className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => setPoint(i, 'correct', oi)}
                        className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-serif text-sm font-semibold transition ${
                          point.correct === oi
                            ? 'border-green bg-green-soft text-green'
                            : 'border-line bg-paper text-wine hover:border-wine'
                        }`}
                      >
                        {LETTERS[oi]}
                      </button>
                      <input
                        value={opt}
                        onChange={(e) => setPointOption(i, oi, e.target.value)}
                        className="input-elegant flex-1"
                        placeholder={`Alternativa ${LETTERS[oi]}`}
                      />
                    </div>
                  ))}
                </div>
              </FieldRow>

              <FieldRow label="Explicação">
                <textarea
                  value={point.expl}
                  onChange={(e) => setPoint(i, 'expl', e.target.value)}
                  rows={2}
                  className="input-elegant"
                  placeholder="Ensina o que olhar."
                />
              </FieldRow>
            </div>
          </div>
        ))}

        {points.length < 8 && (
          <button
            type="button"
            onClick={addPoint}
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-wine transition hover:text-wine-deep"
          >
            <Plus className="h-3 w-3" strokeWidth={2} />
            Adicionar ponto
          </button>
        )}
      </div>

      <div className="rounded-xl border border-rose bg-rose-soft/30 p-4">
        <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-wine-deep">
          Diagnóstico final
        </div>
        <div className="space-y-3">
          <FieldRow label="Pergunta">
            <textarea
              value={diagnosis.question}
              onChange={(e) => setDiagnosis((cur) => ({ ...cur, question: e.target.value }))}
              rows={2}
              className="input-elegant"
              placeholder="Considerando tudo, qual o laudo?"
            />
          </FieldRow>

          <FieldRow label="Alternativas">
            <div className="space-y-2">
              {diagnosis.options.map((opt, oi) => (
                <div key={oi} className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => setDiagnosis((cur) => ({ ...cur, correct: oi }))}
                    className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-serif text-sm font-semibold transition ${
                      diagnosis.correct === oi
                        ? 'border-green bg-green-soft text-green'
                        : 'border-line bg-paper text-wine hover:border-wine'
                    }`}
                  >
                    {LETTERS[oi]}
                  </button>
                  <input
                    value={opt}
                    onChange={(e) => setDiagOption(oi, e.target.value)}
                    className="input-elegant flex-1"
                    placeholder={`Alternativa ${LETTERS[oi]}`}
                  />
                </div>
              ))}
            </div>
          </FieldRow>

          <FieldRow label="Explicação">
            <textarea
              value={diagnosis.expl}
              onChange={(e) => setDiagnosis((cur) => ({ ...cur, expl: e.target.value }))}
              rows={2}
              className="input-elegant"
              placeholder="Fecha o raciocínio e dá conduta."
            />
          </FieldRow>
        </div>
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
          Adicionar ECG
        </button>
      </div>
    </div>
  );
}
