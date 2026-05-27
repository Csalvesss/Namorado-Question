import { useState } from 'react';
import { Plus } from 'lucide-react';
import { DifficultySelector, FieldRow } from './FlashcardForm';
import type { Difficulty, ImportMCQuestion } from '../../types';

const LETTERS = ['A', 'B', 'C', 'D'];

interface Props {
  onAdd: (q: ImportMCQuestion) => void;
  defaultTopic?: string;
}

export default function MCForm({ onAdd, defaultTopic = '' }: Props) {
  const [topic, setTopic] = useState(defaultTopic);
  const [q, setQ] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const [expl, setExpl] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const ready =
    topic.trim() &&
    q.trim() &&
    options.every((o) => o.trim()) &&
    expl.trim();

  function setOption(i: number, value: string) {
    setOptions((cur) => cur.map((o, idx) => (idx === i ? value : o)));
  }

  function handleAdd() {
    if (!ready) return;
    onAdd({
      type: 'mc',
      topic: topic.trim(),
      q: q.trim(),
      options: options.map((o) => o.trim()),
      correct,
      expl: expl.trim(),
      difficulty,
    });
    setQ('');
    setOptions(['', '', '', '']);
    setCorrect(0);
    setExpl('');
  }

  return (
    <div className="space-y-4">
      <FieldRow label="Tópico">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input-elegant"
          placeholder="ex: Diagnóstico, Tratamento"
        />
      </FieldRow>

      <FieldRow label="Enunciado">
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          rows={3}
          className="input-elegant"
          placeholder="Mulher de 32 anos, em uso de PrEP, retorna com anti-HIV reagente..."
        />
      </FieldRow>

      <FieldRow label="Alternativas" hint="marca a correta">
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => setCorrect(i)}
                className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-serif text-sm font-semibold transition ${
                  correct === i
                    ? 'border-green bg-green-soft text-green'
                    : 'border-line bg-paper text-wine hover:border-wine'
                }`}
                aria-label={`Marcar ${LETTERS[i]} como correta`}
              >
                {LETTERS[i]}
              </button>
              <input
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                className="input-elegant flex-1"
                placeholder={`Alternativa ${LETTERS[i]}`}
              />
            </div>
          ))}
        </div>
      </FieldRow>

      <FieldRow label="Explicação" hint="aparece no gabarito">
        <textarea
          value={expl}
          onChange={(e) => setExpl(e.target.value)}
          rows={3}
          className="input-elegant"
          placeholder="Justifica a alternativa correta e ensina o conceito."
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
          Adicionar questão
        </button>
      </div>
    </div>
  );
}
