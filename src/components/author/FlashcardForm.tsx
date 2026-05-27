import AIFlashcardPanel from './AIFlashcardPanel';
import type { Difficulty, ImportFlashcardQuestion } from '../../types';

interface Props {
  onAdd: (q: ImportFlashcardQuestion) => void;
  onAddMany?: (qs: ImportFlashcardQuestion[]) => void;
  defaultTopic?: string;
}

export default function FlashcardForm({ onAdd, onAddMany, defaultTopic = '' }: Props) {
  function handleGenerated(cards: ImportFlashcardQuestion[]) {
    if (onAddMany) {
      onAddMany(cards);
    } else {
      cards.forEach((c) => onAdd(c));
    }
  }

  return <AIFlashcardPanel onGenerated={handleGenerated} defaultTopic={defaultTopic} />;
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
