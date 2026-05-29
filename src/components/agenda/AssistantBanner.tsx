import { useMemo } from 'react';
import type {
  AssistantSummary,
  AssistantInsight,
  NotificationPermission,
} from '../../lib/agenda-types';
import { useUser } from '../../lib/useUser';
// TODO(integrador): conectar à camada de copy quando o módulo existir.
// O agente de copy expõe `renderInsight(insight, displayMode) => { title, body }`.
// import { renderInsight } from './assistant-copy';

type DisplayMode = 'namorado' | 'doutora' | 'irmao';

interface AssistantBannerProps {
  summary: AssistantSummary;
  onEnableReminders: () => void;
  permission: NotificationPermission;
}

// ---------------------------------------------------------------------------
// Greetings — uma frase consistente por displayMode
// ---------------------------------------------------------------------------

function firstNameOf(full: string | undefined): string {
  if (!full) return '';
  const part = full.trim().split(/\s+/)[0] ?? '';
  if (!part) return '';
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

function greetingFor(mode: DisplayMode, name: string | undefined): string {
  switch (mode) {
    case 'namorado':
      return 'olá, amor';
    case 'doutora': {
      const first = firstNameOf(name);
      return first ? `olá, dra. ${first.toLowerCase()}` : 'olá, doutora';
    }
    case 'irmao':
      return 'olá, irmã';
    default:
      return 'olá';
  }
}

// ---------------------------------------------------------------------------
// "Começa em" — tom editorial e curto
// ---------------------------------------------------------------------------

function startsInLabel(startMs: number | undefined, nowMs: number): string | null {
  if (startMs === undefined) return null;
  const diffMs = startMs - nowMs;
  if (diffMs <= 0) {
    if (diffMs > -60 * 60 * 1000) return 'acontecendo agora';
    return null;
  }
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 60) return `começa em ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `começa em ${hours} h`;
  const days = Math.round(hours / 24);
  return `começa em ${days} ${days === 1 ? 'dia' : 'dias'}`;
}

// ---------------------------------------------------------------------------
// Fallback insight copy — usado enquanto assistant-copy não chega
// ---------------------------------------------------------------------------

function fallbackInsightCopy(insight: AssistantInsight): { title: string; body: string } {
  const code = insight.code;
  const p = insight.params;
  switch (code) {
    case 'starting-soon':
      return { title: 'próximo evento se aproxima', body: String(p.title ?? '') };
    case 'exam-imminent':
      return { title: 'prova nas próximas 48h', body: String(p.title ?? '') };
    case 'exam-week-heavy':
      return { title: 'semana de provas', body: `${p.count ?? ''} provas nos próximos dias` };
    case 'exam-upcoming':
      return { title: 'prova chegando', body: String(p.title ?? '') };
    case 'conflict':
      return { title: 'conflito de horário', body: 'dois eventos sobrepostos' };
    case 'heavy-day':
      return { title: 'dia cheio', body: 'várias horas de compromissos hoje' };
    case 'free-day':
      return { title: 'dia livre', body: 'aproveite' };
    case 'free-block':
      return { title: 'janela livre', body: String(p.label ?? '') };
    case 'tip-no-exams':
      return { title: 'sem provas no horizonte', body: 'momento bom pra revisar' };
    case 'tip-empty-plan':
      return { title: 'plano vazio', body: 'comece adicionando disciplinas' };
    case 'tip-long-block':
      return { title: 'bloco longo sem pausa', body: 'considere uma respiração' };
    case 'tip-enable-reminders':
      return { title: 'lembretes desativados', body: 'ative pra não esquecer nada' };
    default:
      return { title: 'aviso', body: '' };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AssistantBanner({
  summary,
  onEnableReminders,
  permission,
}: AssistantBannerProps) {
  const { user } = useUser();
  const mode: DisplayMode = (user?.displayMode ?? 'namorado') as DisplayMode;
  const greeting = greetingFor(mode, user?.name);

  const nowMs = Date.now();
  const next = summary.next;
  const startsIn = useMemo(() => startsInLabel(next?.startMs, nowMs), [next?.startMs, nowMs]);

  // 1 insight de severidade mais alta — urgent primeiro, info depois, etc.
  const featuredInsight = useMemo<AssistantInsight | undefined>(() => {
    const order: Record<AssistantInsight['severity'], number> = {
      urgent: 0,
      info: 1,
      positive: 2,
      tip: 3,
    };
    const sorted = [...summary.insights].sort((a, b) => order[a.severity] - order[b.severity]);
    return sorted.find((i) => i.severity === 'urgent') ?? sorted[0];
  }, [summary.insights]);

  const insightCopy = featuredInsight ? fallbackInsightCopy(featuredInsight) : null;

  return (
    <section
      className="rounded-3xl border border-[var(--blush-stroke)] bg-blush/70 px-6 py-5 shadow-sm sm:px-8 sm:py-6"
      aria-label="assistente da agenda"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 className="font-display text-[28px] italic leading-tight text-wine sm:text-[32px]">
          {greeting}
        </h2>
        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-mute">
          assistente da agenda
        </p>
      </header>

      {next && (
        <article className="mt-4 rounded-2xl border border-[var(--blush-stroke)]/60 bg-paper/80 px-5 py-4">
          {startsIn && (
            <p className="font-display text-[10px] uppercase tracking-[0.22em] text-gold">
              {startsIn}
            </p>
          )}
          <h3 className="mt-1 font-display text-[22px] italic leading-tight text-ink">
            {next.title}
          </h3>
          <p className="mt-1 font-body text-sm text-mute">
            {[next.startTime, next.location, next.examLabel].filter(Boolean).join(' · ')}
          </p>
        </article>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {permission === 'default' && (
          <button
            type="button"
            onClick={onEnableReminders}
            className="inline-flex items-center gap-2 rounded-full border border-wine/30 bg-wine px-4 py-2 font-display text-[11px] uppercase tracking-[0.22em] text-paper transition hover:bg-wine/90"
          >
            ativar lembretes
          </button>
        )}
        {permission === 'granted' && (
          <span className="font-display text-[10px] uppercase tracking-[0.22em] text-sage">
            lembretes ativados
          </span>
        )}
        {permission === 'denied' && (
          <span className="font-body text-xs italic text-mute">
            lembretes bloqueados — reative nas configurações do navegador
          </span>
        )}
        {permission === 'unsupported' && (
          <span className="font-body text-xs italic text-mute">
            este navegador não suporta lembretes
          </span>
        )}
      </div>

      {insightCopy && (
        <div className="mt-5 border-t border-[var(--blush-stroke)]/50 pt-4">
          <p className="font-display text-[10px] uppercase tracking-[0.22em] text-wine">
            {insightCopy.title}
          </p>
          {insightCopy.body && (
            <p className="mt-1 font-body text-sm text-ink">{insightCopy.body}</p>
          )}
        </div>
      )}
    </section>
  );
}
