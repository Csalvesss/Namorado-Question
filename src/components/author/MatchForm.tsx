import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { DifficultySelector, FieldRow } from './FlashcardForm';
import type { Difficulty, ImportMatchQuestion, MatchPair } from '../../types';

interface Props {
  onAdd: (q: ImportMatchQuestion) => void;
  defaultTopic?: string;
}

function emptyPair(): MatchPair {
  return { id: Math.random().toString(36).slice(2, 8), left: '', right: '' };
}

export default function MatchForm({ onAdd, defaultTopic = '' }: Props) {
  const [topic, setTopic] = useState(defaultTopic);
  const [prompt, setPrompt] = useState('');
  const [leftLabel, setLeftLabel] = useState('');
  const [rightLabel, setRightLabel] = useState('');
  const [pairs, setPairs] = useState<MatchPair[]>([emptyPair(), emptyPair(), emptyPair(), emptyPair()]);
  const [expl, setExpl] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const validPairs = pairs.filter((p) => p.left.trim() && p.right.trim());
  const ready = topic.trim() && prompt.trim() && validPairs.length >= 2;

  function setPair(i: number, side: 'left' | 'right', value: string) {
    setPairs((cur) => cur.map((p, idx) => (idx === i ? { ...p, [side]: value } : p)));
  }

  function removePair(i: number) {
    setPairs((cur) => (cur.length > 2 ? cur.filter((_, idx) => idx !== i) : cur));
  }

  function addPair() {
    if (pairs.length >= 6) return;
    setPairs((cur) => [...cur, emptyPair()]);
  }

  function handleAdd() {
    if (!ready) return;
    onAdd({
      type: 'match',
      topic: topic.trim(),
      prompt: prompt.trim(),
      leftLabel: leftLabel.trim() || undefined,
      rightLabel: rightLabel.trim() || undefined,
      pairs: validPairs.map((p) => ({
        id: p.id,
        left: p.left.trim(),
        right: p.right.trim(),
      })),
      expl: expl.trim() || undefined,
      difficulty,
    });
    setPrompt('');
    setPairs([emptyPair(), emptyPair(), emptyPair(), emptyPair()]);
    setExpl('');
  }

  return (
    <div className="space-y-4">
      <FieldRow label="Tópico">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input-elegant"
          placeholder="ex: Mecanismos de ação"
        />
      </FieldRow>

      <FieldRow label="Enunciado">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="input-elegant"
          placeholder="Associe cada antibiótico ao seu mecanismo."
        />
      </FieldRow>

      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Label da esquerda (opcional)">
          <input
            value={leftLabel}
            onChange={(e) => setLeftLabel(e.target.value)}
            className="input-elegant"
            placeholder="ex: Antibiótico"
          />
        </FieldRow>
        <FieldRow label="Label da direita (opcional)">
          <input
            value={rightLabel}
            onChange={(e) => setRightLabel(e.target.value)}
            className="input-elegant"
            placeholder="ex: Mecanismo"
          />
        </FieldRow>
      </div>

      <FieldRow label="Pares" hint="2 a 6 pares">
        <div className="space-y-2">
          {pairs.map((p, i) => (
            <div key={p.id} className="flex items-start gap-2">
              <input
                value={p.left}
                onChange={(e) => setPair(i, 'left', e.target.value)}
                className="input-elegant flex-1"
                placeholder={`Esquerda ${i + 1}`}
              />
              <span className="self-center text-muted">↔</span>
              <input
                value={p.right}
                onChange={(e) => setPair(i, 'right', e.target.value)}
                className="input-elegant flex-1"
                placeholder={`Direita ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => removePair(i)}
                disabled={pairs.length <= 2}
                className="mt-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:text-red disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Remover par"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ))}
          {pairs.length < 6 && (
            <button
              type="button"
              onClick={addPair}
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-wine transition hover:text-wine-deep"
            >
              <Plus className="h-3 w-3" strokeWidth={2} />
              Adicionar par
            </button>
          )}
        </div>
      </FieldRow>

      <FieldRow label="Explicação (opcional)">
        <textarea
          value={expl}
          onChange={(e) => setExpl(e.target.value)}
          rows={2}
          className="input-elegant"
          placeholder="Nota didática curta."
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
          Adicionar pareamento
        </button>
      </div>
    </div>
  );
}
