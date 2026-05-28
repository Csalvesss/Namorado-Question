import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import BarChart from '../components/BarChart';
import EmptyState from '../components/EmptyState';
import Eyebrow from '../components/ui/Eyebrow';
import { useSessions } from '../lib/useSessions';

const MONTHS_PT_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function shortTitle(t: string): string {
  // Pega a primeira palavra ou sigla útil pra label do gráfico
  const cleaned = t.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]/g, '').trim();
  const first = cleaned.split(/[ /]+/)[0] ?? t;
  return first.toUpperCase().slice(0, 8);
}

export default function History() {
  const { sessions: allSessions } = useSessions();
  const sessions = useMemo(
    () => allSessions.filter((s) => s.completedAt),
    [allSessions],
  );

  const recentChart = useMemo(() => {
    return sessions
      .slice(0, 8)
      .reverse()
      .map((s) => ({
        label: shortTitle(s.courseTitle),
        value: s.total > 0 ? Math.round((s.score / s.total) * 100) : 0,
      }));
  }, [sessions]);

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-10 sm:py-20 lg:px-20">
        <Eyebrow>seu caminho</Eyebrow>
        <h1 className="mt-4 font-display font-light leading-[1.05] text-ink text-[clamp(2.5rem,7vw,4.5rem)]">
          Histórico
        </h1>
        <p className="mt-4 max-w-xl font-body text-lg italic leading-relaxed text-mute">
          como você vem indo, prova após prova.
        </p>

        {sessions.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              illustration="compass"
              title="Sem provas finalizadas ainda"
              description="O histórico aparece aqui depois da sua primeira prova. Cada uma marca o caminho."
              action={
                <Link to="/cursos" className="btn-primary">
                  estudar agora
                </Link>
              }
            />
          </div>
        ) : (
          <>
            {/* Gráfico de barras */}
            <div className="card mt-10 p-7 sm:p-10">
              <h2 className="font-display text-2xl italic text-ink">
                Acerto por prova <span className="text-mute">(%)</span>
              </h2>
              <div className="mt-8">
                <BarChart data={recentChart} highlightThreshold={28} />
              </div>
            </div>

            {/* Provas recentes */}
            <div className="card mt-6 p-7 sm:p-10">
              <Eyebrow>provas recentes</Eyebrow>
              <ul className="mt-5">
                {sessions.slice(0, 12).map((s) => {
                  const pct = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0;
                  const date = new Date(s.completedAt ?? s.startedAt);
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = MONTHS_PT_SHORT[date.getMonth()].toUpperCase();
                  return (
                    <li
                      key={s.id}
                      className="flex items-center gap-6 border-b border-line/70 py-5 last:border-b-0"
                    >
                      <span className="w-16 shrink-0 font-display text-[11px] uppercase tracking-[0.2em] text-mute">
                        {day} {month}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-display text-lg italic text-ink">
                        {s.courseTitle}
                      </span>
                      <span className="shrink-0 font-display text-lg italic text-wine">
                        {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
