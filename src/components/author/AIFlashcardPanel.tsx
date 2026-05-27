import { useState } from 'react';
import { AlertCircle, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateFlashcards, hasAnthropicKey } from '../../lib/ai-client';
import type { ImportFlashcardQuestion } from '../../types';

const COUNT_PRESETS = [5, 10, 15, 20];

interface Props {
  onGenerated: (cards: ImportFlashcardQuestion[]) => void;
  defaultTopic?: string;
}

export default function AIFlashcardPanel({ onGenerated, defaultTopic = '' }: Props) {
  const [material, setMaterial] = useState('');
  const [topic, setTopic] = useState(defaultTopic);
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedCount, setLastGeneratedCount] = useState<number | null>(null);

  const apiConfigured = hasAnthropicKey();
  const wordCount = material.trim() ? material.trim().split(/\s+/).length : 0;
  const ready = apiConfigured && wordCount >= 20 && !loading;

  async function handleGenerate() {
    if (!ready) return;
    setLoading(true);
    setError(null);
    setLastGeneratedCount(null);
    try {
      const cards = await generateFlashcards({
        material: material.trim(),
        count,
        topic: topic.trim() || undefined,
      });
      if (cards.length === 0) {
        setError('A IA não conseguiu extrair flashcards. Tente reformular ou adicionar mais conteúdo.');
        return;
      }
      onGenerated(cards);
      setLastGeneratedCount(cards.length);
      setMaterial('');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao gerar flashcards.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-wine bg-rose-soft/30 p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-wine text-white">
          <Sparkles className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="font-serif text-lg italic text-wine-deep">Gerar com IA</h3>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">
            cola o material, a IA cria os cards
          </p>
        </div>
      </div>

      {!apiConfigured ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-gold bg-paper px-4 py-3 text-sm leading-relaxed text-ink-soft">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} />
            <div>
              Para usar a geração automática você precisa configurar uma chave da Anthropic uma vez.
              Vá no Perfil, cole sua chave e volte aqui.
            </div>
          </div>
          <Link to="/perfil" className="btn-primary inline-flex">
            Configurar chave
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <label className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Material
              </label>
              <span className="text-[11px] italic text-muted">
                {wordCount > 0 ? `${wordCount} palavras` : 'cole texto do PDF, anotações, etc.'}
              </span>
            </div>
            <textarea
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              rows={8}
              className="input-elegant font-sans text-sm"
              placeholder="Cole aqui o conteúdo do PDF, suas anotações, um resumo, ou descreva o tópico que quer estudar. Quanto mais detalhado, melhores os cards."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-muted">
                Tópico (opcional)
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input-elegant"
                placeholder="ex: Betalactâmicos"
                disabled={loading}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-[0.22em] text-muted">
                Quantos cards
              </label>
              <div className="flex gap-1.5">
                {COUNT_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    disabled={loading}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full border font-serif text-sm font-semibold transition active:scale-[0.98] ${
                      count === n
                        ? 'border-wine bg-wine text-white'
                        : 'border-line bg-paper text-ink-soft hover:border-rose'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border-l-2 border-red bg-red-soft px-4 py-3 text-sm leading-relaxed text-ink">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          {lastGeneratedCount !== null && !error && (
            <div className="rounded-xl border-l-2 border-green bg-green-soft px-4 py-3 text-sm leading-relaxed text-ink">
              {lastGeneratedCount} card{lastGeneratedCount > 1 ? 's' : ''} adicionado
              {lastGeneratedCount > 1 ? 's' : ''} à fila abaixo. Revisa, edita ou já salva o curso.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs italic text-ink-soft">
              {wordCount < 20
                ? 'cole pelo menos um parágrafo para a IA ter contexto'
                : `pronto para gerar ${count} flashcards`}
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!ready}
              className="btn-primary disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={2} />
                  Gerando {count} cards...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" strokeWidth={2} />
                  Gerar {count} flashcards
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
