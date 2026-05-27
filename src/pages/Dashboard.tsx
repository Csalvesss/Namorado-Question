import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';
import { useUser } from '../lib/useUser';

export default function Dashboard() {
  const { user } = useUser();
  const courses = useMemo(() => db.courses.list(), []);
  const sessions = useMemo(() => (user ? db.sessions.list(user.uid) : []), [user]);

  const completed = sessions.filter((s) => s.completedAt);
  const totalQuestions = completed.reduce((acc, s) => acc + s.answers.length, 0);
  const totalRight = completed.reduce((acc, s) => acc + s.answers.filter((a) => a.isRight).length, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalRight / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-10">
      <section className="text-center">
        <div className="mb-2 font-serif text-2xl tracking-[0.5em] text-rose opacity-70">· · ·</div>
        <h1 className="font-serif text-4xl italic text-wine-deep sm:text-5xl">
          olá, {user?.name?.split(' ')[0] ?? 'doutora'}
        </h1>
        <p className="mt-3 font-serif text-lg italic text-ink-soft">o que você quer estudar hoje</p>
      </section>

      {completed.length > 0 && (
        <section className="card grid grid-cols-3 gap-2 px-4 py-5 sm:gap-4 sm:px-6">
          <Stat label="provas" value={String(completed.length)} />
          <Stat label="questões" value={String(totalQuestions)} />
          <Stat label="acerto" value={`${accuracy}%`} />
        </section>
      )}

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl italic text-wine-deep">Cursos</h2>
          <Link to="/autor" className="btn-ghost text-xs uppercase tracking-wider">
            + Novo curso
          </Link>
        </div>
        {courses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/curso/${c.id}`}
                className="card group relative block overflow-hidden p-5 transition active:scale-[0.99] hover:shadow-wine sm:p-6"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-soft transition group-hover:bg-wine" />
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-3xl">{c.icon}</span>
                  <h3 className="font-serif text-xl italic text-wine-deep">{c.title}</h3>
                </div>
                <p className="mb-3 text-sm leading-relaxed text-ink-soft">{c.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="label-tag">{c.questionCount} questões</span>
                  <span className="label-tag">{c.topics.length} tópicos</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-2xl font-semibold text-wine-deep sm:text-3xl">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted sm:text-[11px]">{label}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-10 text-center">
      <p className="font-serif text-xl italic text-ink-soft">Você ainda não tem cursos.</p>
      <p className="mt-2 text-sm text-muted">Vá em Autor e crie ou importe um banco de questões.</p>
      <Link to="/autor" className="btn-primary mt-4 inline-block">Criar primeiro curso</Link>
    </div>
  );
}
