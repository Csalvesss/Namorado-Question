import { Trash2 } from 'lucide-react';
import type { ImportQuestion } from '../../types';

interface Props {
  items: ImportQuestion[];
  onRemove: (idx: number) => void;
}

function previewTitle(q: ImportQuestion): string {
  if (q.type === 'flashcard') return q.front;
  if (q.type === 'ecg') return `ECG ${q.tracingId}`;
  if (q.type === 'case') return q.vignette;
  if (q.type === 'match') return q.prompt;
  return q.q;
}

function previewSecondary(q: ImportQuestion): string {
  if (q.type === 'flashcard') return q.back;
  if (q.type === 'ecg') return `${q.points.length} pontos · ${q.diagnosis.question}`;
  if (q.type === 'case') return `${q.steps.length} decisões`;
  if (q.type === 'match') return `${q.pairs.length} pares`;
  return q.options.join(' · ');
}

function typeLabel(q: ImportQuestion): string {
  switch (q.type) {
    case 'flashcard':
      return 'flashcard';
    case 'ecg':
      return 'ecg';
    case 'case':
      return 'caso clínico';
    case 'match':
      return 'pareamento';
    default:
      return 'múltipla escolha';
  }
}

export default function ItemsList({ items, onRemove }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-bg-soft p-6 text-center">
        <p className="font-serif italic text-ink-soft">
          Nenhuma questão adicionada ainda. Preencha o formulário acima.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((q, i) => (
        <li
          key={i}
          className="flex items-start gap-3 rounded-xl border border-line bg-bg-soft p-3 sm:p-4"
        >
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-soft font-serif text-xs font-semibold text-wine-deep">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-gold">
                {typeLabel(q)}
              </span>
              {q.topic && (
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
                  · {q.topic}
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink">
              {previewTitle(q)}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[12px] italic text-muted">
              {previewSecondary(q)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="shrink-0 text-muted transition hover:text-red"
            aria-label="Remover"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </li>
      ))}
    </ul>
  );
}
