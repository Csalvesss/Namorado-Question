import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Difficulty, ImportFlashcardQuestion } from '../../types';

interface Props {
  onAdd: (q: ImportFlashcardQuestion) => void;
  defaultTopic?: string;
}

export default function FlashcardForm({ onAdd, defaultTopic = '' }: Props) {
  const [topic, setTopic] = useState(defaultTopic);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hint, setHint] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const ready = topic.trim() && front.trim() && back.trim();

  function handleAdd() {
    if (!ready) return;
    onAdd({
      type: 'flashcard',
      topic: topic.trim(),
      front: front.trim(),
      back: back.trim(),
      hint: hint.trim() || undefined,
      difficulty,
    });
    setFront('');
    setBack('');
    setHint('');
  }

  return (
    <div className="space-y-4">
      <FieldRow
        label="Tópico"
        hint="grupo do card (ex: Betalactâmicos, Onda P)"
      >
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input-elegant"
          placeholder="ex: Betalactâmicos"
        />
      </FieldRow>

      <FieldRow label="Pergunta (frente)">
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          rows={2}
          className="input-elegant"
          placeholder="Qual o mecanismo de ação dos betalactâmicos?"
        />
      </FieldRow>

      <FieldRow label="Resposta (verso)">
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          rows={3}
          className="input-elegant"
          placeholder="Inibem a transpeptidase (PBP), bloqueando a síntese da parede celular."
        />
      </FieldRow>

      <FieldRow label="Dica (opcional)" hint="aparece sem revelar a resposta">
        <input
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          className="input-elegant"
          placeholder="pense na parede celular"
        />
      </FieldRow>

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
          Adicionar flashcard
        </button>
      </div>
    </div>
  );
}

export function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label className="text-[11px] uppercase tracking-[0.22em] text-muted">{label}</label>
        {hint && <span className="text-[11px] italic text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const DIFFICULTIES: Array<{ value: Difficulty; label: string }> = [
  { value: 'easy', label: 'fácil' },
  { value: 'medium', label: 'médio' },
  { value: 'hard', label: 'difícil' },
];

export function DifficultySelector({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}) {
  return (
    <div className="flex gap-2">
      {DIFFICULTIES.map((d) => (
        <button
          key={d.value}
          type="button"
          onClick={() => onChange(d.value)}
          className={`inline-flex min-h-touch items-center rounded-full border px-4 py-1.5 text-sm transition active:scale-[0.98] ${
            value === d.value
              ? 'border-wine bg-wine text-white'
              : 'border-line bg-paper text-ink-soft hover:border-rose'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
