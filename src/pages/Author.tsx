import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpenCheck, Layers, Link2, Save } from 'lucide-react';
import ECGForm from '../components/author/ECGForm';
import FlashcardForm, { FieldRow } from '../components/author/FlashcardForm';
import ItemsList from '../components/author/ItemsList';
import MCForm from '../components/author/MCForm';
import MatchForm from '../components/author/MatchForm';
import { db } from '../lib/db';
import { importCourse } from '../lib/seed';
import { useUser } from '../lib/useUser';
import type { ImportPayload, ImportQuestion } from '../types';

type AuthorKind = 'mc' | 'flashcard' | 'match' | 'ecg';

export default function Author() {
  const { user } = useUser();
  const [kind, setKind] = useState<AuthorKind>('flashcard');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [items, setItems] = useState<ImportQuestion[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const courses = useMemo(() => db.courses.list(), [success]);
  const ready = courseTitle.trim() && items.length > 0;

  function handleAdd(q: ImportQuestion) {
    setItems((prev) => [...prev, q]);
    setSuccess(null);
    setError(null);
  }

  function handleAddMany(qs: ImportQuestion[]) {
    setItems((prev) => [...prev, ...qs]);
    setSuccess(null);
    setError(null);
  }

  function handleRemove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSaveCourse() {
    if (!ready) return;
    const payload: ImportPayload = {
      title: courseTitle.trim(),
      description: courseDescription.trim(),
      color: 'wine',
      questions: items,
    };
    try {
      const course = importCourse(payload, { createdBy: user?.uid ?? 'system' });
      setSuccess(`Curso "${course.title}" salvo com ${items.length} questões.`);
      setError(null);
      setCourseTitle('');
      setCourseDescription('');
      setItems([]);
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Falha ao salvar curso.';
      setError(message);
    }
  }

  function deleteCourse(id: string, title: string) {
    if (!confirm(`Apagar o curso "${title}" e todas as questões dele?`)) return;
    db.courses.remove(id);
    setSuccess(`Curso "${title}" apagado.`);
    setTimeout(() => setSuccess(null), 2500);
  }

  return (
    <div className="space-y-10">
      <header>
        <div className="eyebrow-gold mb-3">criar conteúdo</div>
        <h1 className="display-title-sm">Modo Autor</h1>
        <p className="mt-3 max-w-xl font-serif text-lg italic leading-relaxed text-ink-soft">
          monte seus bancos de questão, flashcards e casos clínicos diretamente aqui. Cada curso
          pode misturar tipos diferentes.
        </p>
      </header>

      <section className="card space-y-5 p-5 sm:p-7">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl italic leading-none text-gold opacity-60">I</span>
          <h2 className="font-serif text-xl italic text-wine-deep">Dados do curso</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
          <FieldRow label="Título" hint="ex: HIV/AIDS">
            <input
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              className="input-elegant"
              placeholder="Nome do curso"
            />
          </FieldRow>
          <FieldRow label="Descrição" hint="aparece no card do curso">
            <input
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              className="input-elegant"
              placeholder="Resumo curto do conteúdo"
            />
          </FieldRow>
        </div>
      </section>

      <section className="card space-y-5 p-5 sm:p-7">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl italic leading-none text-gold opacity-60">II</span>
          <h2 className="font-serif text-xl italic text-wine-deep">Tipo de questão</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <KindCard
            active={kind === 'flashcard'}
            onClick={() => setKind('flashcard')}
            Icon={Layers}
            title="Flashcard"
            description="Frente / verso para revisão espaçada."
          />
          <KindCard
            active={kind === 'mc'}
            onClick={() => setKind('mc')}
            Icon={BookOpenCheck}
            title="Múltipla escolha"
            description="4 alternativas + explicação."
          />
          <KindCard
            active={kind === 'match'}
            onClick={() => setKind('match')}
            Icon={Link2}
            title="Pareamento"
            description="Duas colunas, associa por toque."
          />
          <KindCard
            active={kind === 'ecg'}
            onClick={() => setKind('ecg')}
            Icon={Activity}
            title="ECG"
            description="Análise ponto a ponto + diagnóstico."
          />
        </div>

        <div className="rounded-2xl border border-line bg-bg-soft p-4 sm:p-6">
          {kind === 'flashcard' && (
            <FlashcardForm onAdd={handleAdd} onAddMany={handleAddMany} />
          )}
          {kind === 'mc' && <MCForm onAdd={handleAdd} />}
          {kind === 'match' && <MatchForm onAdd={handleAdd} />}
          {kind === 'ecg' && <ECGForm onAdd={handleAdd} />}
        </div>
      </section>

      <section className="card space-y-5 p-5 sm:p-7">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-2xl italic leading-none text-gold opacity-60">
              III
            </span>
            <h2 className="font-serif text-xl italic text-wine-deep">
              Questões adicionadas
            </h2>
          </div>
          <span className="text-[11px] uppercase tracking-[0.22em] text-muted">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        <ItemsList items={items} onRemove={handleRemove} />

        {error && (
          <div className="rounded-xl border-l-2 border-red bg-red-soft px-4 py-3 text-sm text-ink">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border-l-2 border-green bg-green-soft px-4 py-3 text-sm text-ink">
            {success}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm italic text-ink-soft">
            {ready
              ? 'Pronto para salvar como curso.'
              : 'Preencha título e adicione pelo menos uma questão.'}
          </p>
          <button
            type="button"
            onClick={handleSaveCourse}
            disabled={!ready}
            className="btn-primary disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-4 w-4" strokeWidth={2} />
            Salvar curso
          </button>
        </div>
      </section>

      <section className="card space-y-4 p-5 sm:p-7">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-2xl italic leading-none text-gold opacity-60">IV</span>
          <h2 className="font-serif text-xl italic text-wine-deep">Cursos no banco</h2>
        </div>
        {courses.length === 0 ? (
          <p className="font-serif italic text-ink-soft">Nenhum curso ainda.</p>
        ) : (
          <ul className="space-y-2">
            {courses.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-bg-soft px-4 py-3"
              >
                <Link to={`/curso/${c.id}`} className="flex items-center gap-3 text-left">
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-paper font-serif text-base italic text-wine-deep"
                  >
                    {c.title.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <div className="font-serif text-lg italic text-wine-deep">{c.title}</div>
                    <div className="text-xs text-muted">
                      {c.questionCount} questões · {c.topics.length} tópicos
                    </div>
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
        <h3 className="font-serif text-base italic text-wine-deep">{title}</h3>
      </div>
      <p className="text-xs leading-relaxed text-ink-soft">{description}</p>
    </button>
  );
}
