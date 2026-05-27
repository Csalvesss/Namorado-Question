import type { ImportFlashcardQuestion } from '../types';

const STORAGE_KEY = 'guava.anthropicKey';
const MODEL = 'claude-sonnet-4-6';

export function getAnthropicKey(): string | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim();
  }
  const envKey = (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined) ?? '';
  return envKey.trim() || null;
}

export function setAnthropicKey(key: string) {
  const clean = key.trim();
  if (clean) localStorage.setItem(STORAGE_KEY, clean);
  else localStorage.removeItem(STORAGE_KEY);
}

export function hasAnthropicKey(): boolean {
  return getAnthropicKey() !== null;
}

const FLASHCARD_SYSTEM = `Você é uma professora sênior de medicina ajudando uma aluna a memorizar com repetição espaçada.

Princípios de bons flashcards:
- UM conceito por card (mínimo de informação por unidade)
- pergunta direta no front, resposta completa mas concisa no back
- foco em fatos memorizáveis (doses, mecanismos, valores de referência, classificações, listas-chave)
- evite cards muito abertos — divida em vários cards menores
- use "hint" como dica curta de recuperação sem entregar a resposta
- agrupe por "topic" (subtópico curto)

Você devolve APENAS um array JSON de objetos com este formato exato:
[
  {
    "topic": "string",
    "front": "string",
    "back": "string",
    "hint": "string opcional",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Sem markdown, sem texto antes ou depois, apenas o JSON.`;

interface AnthropicResponse {
  content: Array<{ type: string; text?: string }>;
  error?: { message?: string };
}

function stripCodeFence(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function extractJsonArray(text: string): string {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return text;
  return text.slice(start, end + 1);
}

export async function generateFlashcards(opts: {
  material: string;
  count: number;
  topic?: string;
  signal?: AbortSignal;
}): Promise<ImportFlashcardQuestion[]> {
  const apiKey = getAnthropicKey();
  if (!apiKey) {
    throw new Error(
      'Chave da Anthropic não configurada. Vá em Perfil e cole sua chave para usar a IA.',
    );
  }

  const userMessage = [
    opts.topic ? `Tópico desejado: ${opts.topic}` : null,
    'Material de estudo:',
    '',
    opts.material.slice(0, 80_000),
    '',
    `Gere exatamente ${opts.count} flashcards em português brasileiro a partir deste material.`,
    'Retorne APENAS o array JSON.',
  ]
    .filter(Boolean)
    .join('\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: FLASHCARD_SYSTEM,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    }),
    signal: opts.signal,
  });

  if (!response.ok) {
    const errData = (await response.json().catch(() => ({}))) as AnthropicResponse;
    throw new Error(
      errData.error?.message ?? `Erro ${response.status} ao chamar a IA.`,
    );
  }

  const data = (await response.json()) as AnthropicResponse;
  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
  if (!text.trim()) throw new Error('A IA retornou uma resposta vazia.');

  const cleaned = extractJsonArray(stripCodeFence(text));

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Não consegui interpretar a resposta da IA como JSON. Tente novamente.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('A IA retornou um formato inesperado (esperado um array).');
  }

  return parsed
    .filter(
      (raw): raw is Record<string, unknown> =>
        typeof raw === 'object' && raw !== null,
    )
    .map((raw): ImportFlashcardQuestion | null => {
      const topic = typeof raw.topic === 'string' ? raw.topic.trim() : '';
      const front = typeof raw.front === 'string' ? raw.front.trim() : '';
      const back = typeof raw.back === 'string' ? raw.back.trim() : '';
      if (!topic || !front || !back) return null;
      const hint = typeof raw.hint === 'string' && raw.hint.trim() ? raw.hint.trim() : undefined;
      const difficultyRaw = typeof raw.difficulty === 'string' ? raw.difficulty.trim() : '';
      const difficulty =
        difficultyRaw === 'easy' || difficultyRaw === 'medium' || difficultyRaw === 'hard'
          ? difficultyRaw
          : undefined;
      return {
        type: 'flashcard',
        topic,
        front,
        back,
        hint,
        difficulty,
      };
    })
    .filter((c): c is ImportFlashcardQuestion => c !== null);
}
