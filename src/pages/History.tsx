import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db';
import { modeConfig } from '../lib/quiz';
import { useUser } from '../lib/useUser';

export default function History() {
  const { user } = useUser();
  const sessions = useMemo(
    () => (user ? db.sessions.list(user.uid).filter((s) => s.completedAt) : []),
    [user],
  );

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="divider-dots mb-2">· · ·</div>
        <h1 className="display-title-sm">Histórico</h1>
        <p className="mt-3 font-serif text-lg italic text-ink-soft">cada prova é um passo</p>
      </header>

      {sessions.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-serif text-xl italic text-ink-soft">Sem provas finalizadas ainda.</p>
          <Link to="/app" className="btn-primary mt-4 inline-block">Estudar agora</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => {
            const pct = Math.round((s.score / s.total) * 100);
            const cfg = modeConfig(s.mode);
            const date = new Date(s.completedAt ?? s.startedAt);
            const duration = s.durationMs ? Math.round(s.durationMs / 60000) : null;
            return (
              <li key={s.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="font-serif text-lg italic text-wine-deep">{s.courseTitle}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs uppercase tracking-wider text-muted">
                    <span>{cfg.icon} {cfg.label}</span>
                    <span>·</span>
                    <span>{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span>·</span>
                    <span>{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {duration !== null && (<><span>·</span><span>{duration} min</span></>)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-3xl font-semibold text-wine-deep">
                    {s.score}<span className="text-base text-muted"> / {s.total}</span>
                  </div>
                  <div className="text-xs uppercase tracking-wider text-muted">{pct}% acerto</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
