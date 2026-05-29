import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import BarChart from '../components/BarChart';
import EmptyState from '../components/EmptyState';
import Eyebrow from '../components/ui/Eyebrow';
import { modeConfig } from '../lib/quiz';
import { useSessions } from '../lib/useSessions';

const MONTHS_PT_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function shortTitle(t: string): string {
  // Pega a primeira palavra ou sigla útil para label do gráfico
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
          Histórico de provas
        </h1>
        <p className="mt-4 max-w-xl font-body text-lg italic leading-relaxed text-mute">
          toda prova que você fecha fica guardada aqui. toca em qualquer uma para rever o gabarito,
          a explicação de cada questão e a dica do professor.
        </p>

        {sessions.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              illustration="compass"
              title="Sem provas finalizadas ainda"
              description="O histórico aparece aqui depois da sua primeira prova. Cada uma fica salva com gabarito completo para você revisar quando quiser."
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

            {/* Provas recentes — cada uma abre o gabarito comentado */}
            <div className="card mt-6 p-5 sm:p-8">
              <div className="px-2 sm:px-2">
                <Eyebrow>todas as provas</Eyebrow>
              </div>
              <ul className="mt-4">
                {sessions.map((s) => {
                  const pct = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0;
                  const date = new Date(s.completedAt ?? s.startedAt);
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = MONTHS_PT_SHORT[date.getMonth()].toUpperCase();
                  const pctTone =
                    pct >= 80 ? 'text-wine-deep' : pct >= 50 ? 'text-wine' : 'text-ink-soft';
                  return (
                    <li key={s.id}>
                      <Link
                        to={`/historico/prova/${s.id}`}
                        className="group flex items-center gap-4 rounded-2xl border border-transparent px-3 py-4 transition hover:border-line hover:bg-blush/40 sm:gap-6"
                      >
                        <span className="w-12 shrink-0 text-center font-display text-[11px] uppercase leading-tight tracking-[0.16em] text-mute">
                          {day}
                          <br />
                          {month}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-lg italic text-ink">
                            {s.courseTitle}
                          </span>
                          <span className="mt-0.5 block font-body text-[12px] italic text-mute">
                            {modeConfig(s.mode).label} · {s.score}/{s.total} acertos
                          </span>
                        </span>
                        <span className={`shrink-0 font-display text-xl italic ${pctTone}`}>
                          {pct}%
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-mute transition group-hover:translate-x-0.5 group-hover:text-wine"
                          strokeWidth={2}
                        />
                      </Link>
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
