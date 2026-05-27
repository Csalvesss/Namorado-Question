import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';
import { importCourse } from '../lib/seed';
import { useUser } from '../lib/useUser';
import type { ImportPayload } from '../types';

const EXAMPLE = `{
  "title": "Nome da matéria",
  "description": "Resumo do conteúdo",
  "icon": "📘",
  "color": "wine",
  "questions": [
    {
      "topic": "Subtópico",
      "q": "Enunciado da questão...",
      "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
      "correct": 1,
      "expl": "Explicação detalhada da resposta correta.",
      "difficulty": "medium"
    }
  ]
}`;

const PROMPT_TEMPLATE = `Você é um professor sênior de medicina e especialista em criar questões de múltipla escolha em alto nível.

Leia o PDF que vou enviar e gere 30 questões de múltipla escolha em português brasileiro, no formato JSON exato abaixo.

Requisitos de qualidade:
- 4 alternativas por questão (A, B, C, D)
- 1 alternativa correta + 3 distratores PLAUSÍVEIS (não absurdos)
- A explicação deve ensinar o conceito, citando dados do material
- Varie a dificuldade (use "easy", "medium", "hard")
- Inclua raciocínio clínico quando o conteúdo permitir, não só decoreba
- Cubra os principais conceitos do PDF
- Use o campo "topic" pra agrupar por subtópico

Saída: APENAS o JSON válido, sem texto antes ou depois.

Formato:
${EXAMPLE}`;

export default function Author() {
  const { user } = useUser();
  const [raw, setRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const courses = useMemo(() => db.courses.list(), [success]);

  function parseAndValidate(text: string): ImportPayload | null {
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (e) {
      setError('JSON inválido. Confere a vírgula ou aspas faltando.');
      return null;
    }
    if (!data || typeof data !== 'object') {
      setError('JSON precisa ser um objeto.');
      return null;
    }
    const obj = data as Partial<ImportPayload>;
    if (typeof obj.title !== 'string' || !obj.title.trim()) {
      setError('Campo "title" obrigatório (string).');
      return null;
    }
    if (!Array.isArray(obj.questions) || obj.questions.length === 0) {
      setError('Campo "questions" precisa ser um array não vazio.');
      return null;
    }
    for (let i = 0; i < obj.questions.length; i++) {
      const q = obj.questions[i] as unknown as Record<string, unknown> | undefined;
      if (!q) {
        setError(`Questão ${i + 1}: dado vazio.`);
        return null;
      }
      if (typeof q.topic !== 'string' || !q.topic.trim()) {
        setError(`Questão ${i + 1}: "topic" obrigatório.`);
        return null;
      }
      const type = (q.type as string | undefined) ?? 'mc';
      if (type === 'ecg') {
        if (typeof q.tracingId !== 'string') {
          setError(`Questão ${i + 1} (ECG): "tracingId" obrigatório.`);
          return null;
        }
        if (!Array.isArray(q.points) || q.points.length < 1) {
          setError(`Questão ${i + 1} (ECG): "points" precisa ser um array não vazio.`);
          return null;
        }
        if (!q.diagnosis || typeof q.diagnosis !== 'object') {
          setError(`Questão ${i + 1} (ECG): "diagnosis" obrigatório.`);
          return null;
        }
        continue;
      }
      if (typeof q.q !== 'string' || !q.q.trim()) {
        setError(`Questão ${i + 1}: campo "q" obrigatório.`);
        return null;
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        setError(`Questão ${i + 1}: precisa de exatamente 4 alternativas.`);
        return null;
      }
      if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) {
        setError(`Questão ${i + 1}: "correct" precisa ser 0, 1, 2 ou 3.`);
        return null;
      }
      if (typeof q.expl !== 'string') {
        setError(`Questão ${i + 1}: "expl" obrigatório.`);
        return null;
      }
    }
    return obj as ImportPayload;
  }

  function handleImport() {
    setError(null);
    setSuccess(null);
    const payload = parseAndValidate(raw);
    if (!payload) return;
    const course = importCourse(payload, { createdBy: user?.uid ?? 'system' });
    setSuccess(`Curso "${course.title}" importado com ${payload.questions.length} questões.`);
    setRaw('');
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRaw(String(reader.result ?? ''));
      setError(null);
      setSuccess(null);
    };
    reader.readAsText(file);
  }

  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT_TEMPLATE);
    setSuccess('Prompt copiado. Cole no Claude junto com o PDF.');
    setTimeout(() => setSuccess(null), 2500);
  }

  function deleteCourse(id: string, title: string) {
    if (!confirm(`Apagar o curso "${title}" e todas as questões dele?`)) return;
    db.courses.remove(id);
    setSuccess(`Curso "${title}" apagado.`);
  }

  return (
    <div className="space-y-10">
      <header className="text-center">
        <div className="divider-dots mb-2">· · ·</div>
        <h1 className="display-title-sm">Modo Autor</h1>
        <p className="mt-3 font-serif text-lg italic text-ink-soft">monte e gerencie os bancos de questão</p>
      </header>

      <section className="card p-6">
        <h2 className="mb-3 font-serif text-2xl italic text-wine-deep">1. Gere o JSON com o Claude</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Cole o prompt abaixo numa conversa nova com o Claude, junto com o PDF dela. Ele devolve
          um JSON pronto pra importar.
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowPrompt((s) => !s)} className="btn-secondary">
            {showPrompt ? 'Esconder prompt' : 'Ver prompt completo'}
          </button>
          <button onClick={copyPrompt} className="btn-primary">Copiar prompt</button>
        </div>
        {showPrompt && (
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-line bg-bg-soft p-4 text-xs text-ink">
            {PROMPT_TEMPLATE}
          </pre>
        )}
      </section>

      <section className="card p-6">
        <h2 className="mb-3 font-serif text-2xl italic text-wine-deep">2. Importe o JSON aqui</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Cole o JSON gerado abaixo ou suba um arquivo .json.
        </p>
        <div className="mb-3 flex gap-3">
          <button onClick={() => fileRef.current?.click()} className="btn-secondary">
            Subir arquivo .json
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFile} />
          <button
            onClick={() => {
              setRaw(EXAMPLE);
              setError(null);
            }}
            className="btn-ghost text-xs uppercase tracking-wider"
          >
            Carregar exemplo
          </button>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={14}
          className="input-elegant font-mono text-xs"
          placeholder='Cole o JSON aqui…'
        />
        {error && (
          <div className="mt-3 rounded-xl border-l-2 border-red bg-red-soft px-4 py-3 text-sm text-ink">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 rounded-xl border-l-2 border-green bg-green-soft px-4 py-3 text-sm text-ink">
            {success}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={handleImport} disabled={!raw.trim()} className="btn-primary">
            Importar curso
          </button>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 font-serif text-2xl italic text-wine-deep">Cursos no banco</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-muted">Nenhum curso ainda.</p>
        ) : (
          <ul className="space-y-2">
            {courses.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-bg-soft px-4 py-3">
                <Link to={`/curso/${c.id}`} className="flex items-center gap-3 text-left">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <div className="font-serif text-lg italic text-wine-deep">{c.title}</div>
                    <div className="text-xs text-muted">{c.questionCount} questões · {c.topics.length} tópicos</div>
                  </div>
                </Link>
                <button
                  onClick={() => deleteCourse(c.id, c.title)}
                  className="text-xs uppercase tracking-wider text-red hover:underline"
                >
                  Apagar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
