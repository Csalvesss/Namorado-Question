import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/ui/PageContainer';
import { db } from '../lib/db';

export default function Author() {
  const [success, setSuccess] = useState<string | null>(null);
  const courses = useMemo(() => db.courses.list(), [success]);

  function deleteCourse(id: string, title: string) {
    if (!confirm(`Apagar o curso "${title}" e todas as questões dele?`)) return;
    db.courses.remove(id);
    setSuccess(`Curso "${title}" apagado.`);
    setTimeout(() => setSuccess(null), 2500);
  }

  return (
    <PageContainer>
    <div className="space-y-10">
      <header>
        <div className="eyebrow-gold mb-3">conteúdo</div>
        <h1 className="display-title-sm">Cursos</h1>
        <p className="mt-3 max-w-xl font-serif text-lg italic leading-relaxed text-ink-soft">
          os cursos que estão disponíveis no seu banco. precisa de mais? me peça novos
          materiais e eu monto para você.
        </p>
      </header>

      {success && (
        <div className="rounded-xl border-l-2 border-green bg-green-soft px-4 py-3 text-sm text-ink">
          {success}
        </div>
      )}

      <section className="card space-y-4 p-5 sm:p-7">
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
    </PageContainer>
  );
}
