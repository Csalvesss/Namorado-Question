import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpenCheck, FileText } from 'lucide-react';
import { db } from '../lib/db';
import { importCourse } from '../lib/seed';
import { useUser } from '../lib/useUser';
import type { ImportPayload } from '../types';

type AuthorKind = 'mc' | 'ecg' | 'case';

const EXAMPLE_MC = `{
  "title": "Nome da matéria",
  "description": "Resumo do conteúdo",
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

const PROMPT_MC = `Você é um professor sênior de medicina e especialista em criar questões de múltipla escolha em alto nível.

Leia o PDF que vou enviar e gere 30 questões de múltipla escolha em português brasileiro, no formato JSON exato abaixo.

Requisitos de qualidade:
- 4 alternativas por questão (A, B, C, D)
- 1 alternativa correta + 3 distratores PLAUSÍVEIS (não absurdos)
- A explicação deve ensinar o conceito, citando dados do material
- Varie a dificuldade (use "easy", "medium", "hard")
- Inclua raciocínio clínico quando o conteúdo permitir, não só decoreba
- Cubra os principais conceitos do PDF
- Use o campo "topic" para agrupar por subtópico

Saída: APENAS o JSON válido, sem texto antes ou depois.

Formato:
${EXAMPLE_MC}`;

const EXAMPLE_ECG = `{
  "title": "Eletrocardiograma: Avançado",
  "description": "Casos clínicos com interpretação ponto a ponto",
  "color": "wine",
  "questions": [
    {
      "type": "ecg",
      "topic": "Arritmias supraventriculares",
      "tracingId": "af",
      "context": "Mulher, 70a, palpitação irregular há 1 dia. PA 130x80.",
      "points": [
        {
          "id": "ritmo",
          "label": "Ritmo",
          "hint": "olhe R-R e onda P",
          "question": "Como descreve o ritmo?",
          "options": ["Sinusal", "FA", "Flutter", "TV"],
          "correct": 1,
          "expl": "R-R irregular sem onda P organizada."
        }
      ],
      "diagnosis": {
        "question": "Diagnóstico mais provável?",
        "options": ["RS normal", "FA com resposta ventricular elevada", "Flutter atrial", "TPSV"],
        "correct": 1,
        "expl": "FA recém-diagnosticada, anticoagular conforme CHA2DS2-VASc."
      },
      "difficulty": "medium"
    }
  ]
}`;

const EXAMPLE_CASE = `{
  "title": "Casos Clínicos: Cardiologia",
  "description": "Vinhetas com decisões encadeadas",
  "color": "wine",
  "questions": [
    {
      "type": "case",
      "topic": "Síndrome coronariana aguda",
      "vignette": "Homem, 58a, dor torácica retroesternal há 2h, sudorese, irradia para braço esquerdo. PA 150x95, FC 92, ECG com supra ST em DII/DIII/aVF.",
      "steps": [
        {
          "id": "diag",
          "question": "Diagnóstico mais provável?",
          "options": ["IAM inferior com supra ST", "Angina estável", "Pericardite aguda", "Dissecção de aorta"],
          "correct": 0,
          "expl": "Quadro clássico de SCAcSST inferior, supra de ST em parede inferior."
        },
        {
          "id": "conduta",
          "prompt": "Diagnóstico definido. Tempo de início: 2h.",
          "question": "Conduta imediata?",
          "options": [
            "Angioplastia primária se disponível em até 120min, AAS + clopidogrel/ticagrelor + anticoagulação",
            "Trombolítico apenas",
            "Cinemcardio eletiva",
            "Cateterismo apenas após estabilização ambulatorial"
          ],
          "correct": 0,
          "expl": "Janela ouro para angioplastia primária. ATC se disponível < 120min, senão trombólise."
        }
      ],
      "difficulty": "medium"
    }
  ]
}`;

const PROMPT_CASE = `Você é um preceptor de residência médica gerando casos clínicos encadeados para simular plantão.

Gere 4 casos em português brasileiro, no formato JSON exato abaixo. Cada caso tem:
- vignette: vinheta clínica longa (3-6 linhas), com idade, sexo, queixa, antecedentes, exame físico, exames laboratoriais relevantes. Pode usar \\n para quebrar parágrafos.
- steps: 3 a 5 sub-questões em sequência lógica de raciocínio (diagnóstico → exames → conduta → seguimento). Cada step:
  - id: slug curto (diag, conduta, atb, alta, etc.)
  - prompt? (opcional): nova informação revelada antes dessa pergunta ("Após pedir hemograma, você recebe Hb 7,2...")
  - question: a pergunta da etapa
  - options: 4 alternativas, com distratores realistas
  - correct: 0-3
  - expl: ensina raciocínio, cita guideline quando fizer sentido (Sepsis-3, ACC/AHA, BTS, etc.)

Saída: APENAS o JSON válido, sem texto antes ou depois.

Formato:
${EXAMPLE_CASE}`;

const PROMPT_ECG = `Você é um cardiologista experiente e vai gerar questões interativas de interpretação de ECG.

A nossa plataforma renderiza os traçados dinamicamente a partir de um id. Os ids disponíveis são:
- normal-sinus, sinus-brady, sinus-tachy
- af (fibrilação atrial), flutter
- stemi-inferior, stemi-anterior
- lbbb (BRE), rbbb (BRD)

Gere 5 questões em português brasileiro, escolhendo o tracingId mais adequado ao caso clínico. Cada questão tem 4-7 pontos de análise (ondas P, intervalo PR, QRS, segmento ST, onda T, ritmo, FC, eixo, escolha o que faz sentido pro caso) e termina com um diagnóstico final.

Cada PONTO tem:
- id (slug curto: ritmo, fc, ondaP, intervaloPr, qrs, st, t, eixo)
- label (rótulo bonito: "Ritmo", "Frequência cardíaca", etc.)
- hint? (uma dica curta, opcional)
- region? (opcional: { x, y, w, h } com valores 0-1 normalizados para destacar a parte do traçado)
- question (a pergunta dessa etapa)
- options (4 alternativas)
- correct (0-3)
- expl (ensina o que olhar)

DIAGNÓSTICO final:
- question, options (4), correct (0-3), expl (justifica e dá conduta clínica resumida quando fizer sentido)

Saída: APENAS o JSON válido, sem texto antes ou depois.

Formato:
${EXAMPLE_ECG}`;

export default function Author() {
  const { user } = useUser();
  const [raw, setRaw] = useState('');
  const [kind, setKind] = useState<AuthorKind>('mc');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const courses = useMemo(() => db.courses.list(), [success]);

  const promptTemplate =
    kind === 'ecg' ? PROMPT_ECG : kind === 'case' ? PROMPT_CASE : PROMPT_MC;
  const exampleJson =
    kind === 'ecg' ? EXAMPLE_ECG : kind === 'case' ? EXAMPLE_CASE : EXAMPLE_MC;

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
      if (type === 'case') {
        if (typeof q.vignette !== 'string' || !q.vignette.trim()) {
          setError(`Questão ${i + 1} (caso): "vignette" obrigatória.`);
          return null;
        }
        if (!Array.isArray(q.steps) || q.steps.length < 1) {
          setError(`Questão ${i + 1} (caso): "steps" precisa ser um array não vazio.`);
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
    navigator.clipboard.writeText(promptTemplate);
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
        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          Escolha o tipo de questão, copie o prompt e cole numa conversa nova com o Claude,
          junto com o material. Ele devolve um JSON pronto para importar.
        </p>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KindCard
            active={kind === 'mc'}
            onClick={() => setKind('mc')}
            Icon={BookOpenCheck}
            title="Múltipla escolha"
            description="4 alternativas + explicação. Para qualquer matéria a partir de um PDF/resumo."
          />
          <KindCard
            active={kind === 'ecg'}
            onClick={() => setKind('ecg')}
            Icon={Activity}
            title="Eletrocardiograma"
            description="Análise ponto a ponto + diagnóstico. Escolhe um dos 9 traçados disponíveis."
          />
          <KindCard
            active={kind === 'case'}
            onClick={() => setKind('case')}
            Icon={FileText}
            title="Caso clínico"
            description="Vinheta longa + 3-5 decisões encadeadas. Ideal para simular plantão."
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowPrompt((s) => !s)} className="btn-secondary">
            {showPrompt ? 'Esconder prompt' : 'Ver prompt completo'}
          </button>
          <button onClick={copyPrompt} className="btn-primary">Copiar prompt</button>
        </div>
        {showPrompt && (
          <pre className="mt-4 max-h-96 overflow-auto rounded-xl border border-line bg-bg-soft p-4 text-xs text-ink">
            {promptTemplate}
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
              setRaw(exampleJson);
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
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-paper font-serif text-base italic text-wine-deep"
                  >
                    {c.title.charAt(0).toUpperCase()}
                  </span>
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

interface KindCardProps {
  active: boolean;
  onClick: () => void;
  Icon: typeof Activity;
  title: string;
  description: string;
}

function KindCard({ active, onClick, Icon, title, description }: KindCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group min-h-touch rounded-xl border p-4 text-left transition active:scale-[0.99] ${
        active
          ? 'border-wine bg-rose-soft/40 shadow-soft'
          : 'border-line bg-bg-soft hover:border-wine hover:bg-paper'
      }`}
    >
      <div className="mb-1.5 flex items-center gap-2.5">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
            active ? 'bg-wine text-white' : 'bg-paper text-wine'
          }`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
        <h3 className="font-serif text-lg italic text-wine-deep">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-ink-soft">{description}</p>
    </button>
  );
}
