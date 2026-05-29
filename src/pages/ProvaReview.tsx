import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, GraduationCap, Lightbulb, Minus, X } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import Eyebrow from '../components/ui/Eyebrow';
import { db } from '../lib/db';
import { modeConfig } from '../lib/quiz';
import { resolveReviewItems } from '../lib/review';
import { tipForTopic, tipsForSession, type StudyTip } from '../data/study-tips';
import { useUser } from '../lib/useUser';
import type { ReviewBlock, SessionReviewItem } from '../types';

const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function formatDate(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} de ${MONTHS_PT[d.getMonth()]}, ${hh}:${mm}`;
}

export default function ProvaReview() {
  const { sessionId = '' } = useParams();
  const { user, loading } = useUser();
  const track = user?.track ?? 'medicina';

  const session = useMemo(
    () => (user ? db.sessions.get(user.uid, sessionId, track) : undefined),
    [user, sessionId, track],
  );

  const qById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof db.questions._raw>[number]>();
    db.questions._raw().forEach((q) => map.set(q.id, q));
    return map;
  }, []);

  const { items, legacy } = useMemo(() => {
    if (!session) return { items: [] as SessionReviewItem[], legacy: false };
    return resolveReviewItems(
      session.review,
      session.questionIds,
      session.answers,
      (id) => qById.get(id),
    );
  }, [session, qById]);

  // Estatística por tópico → tópicos para reforçar (acerto < 100%).
  const { missedTopics, topicStats } = useMemo(() => {
    const stats = new Map<string, { right: number; total: number }>();
    items.forEach((it) => {
      const s = stats.get(it.topic) ?? { right: 0, total: 0 };
      s.total += 1;
      if (it.isRight) s.right += 1;
      stats.set(it.topic, s);
    });
    const missed: string[] = [];
    stats.forEach((s, topic) => {
      if (s.right < s.total) missed.push(topic);
    });
    return { missedTopics: missed, topicStats: stats };
  }, [items]);

  const tips = useMemo(
    () =>
      session
        ? tipsForSession({ track, courseTitle: session.courseTitle, missedTopics })
        : { topicTips: [], courseTip: null },
    [session, track, missedTopics],
  );

  if (loading) return null;

  if (!session) {
    return (
      <section className="bg-paper">
        <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10 sm:py-24 lg:px-12">
          <EmptyState
            illustration="compass"
            title="Prova não encontrada"
            description="Essa prova não está mais no histórico deste aparelho. Abra o histórico para ver as provas disponíveis."
            action={
              <Link to="/historico" className="btn-primary">
                voltar ao histórico
              </Link>
            }
          />
        </div>
      </section>
    );
  }

  const pct = session.total > 0 ? Math.round((session.score / session.total) * 100) : 0;
  const mins = Math.max(1, Math.round((session.durationMs ?? 0) / 60000));
  const modeLabel = modeConfig(session.mode).label;
  const tier = pct >= 80 ? 'high' : pct >= 50 ? 'med' : 'low';
  const ringColor = tier === 'high' ? 'text-wine-deep' : tier === 'med' ? 'text-wine' : 'text-ink-soft';

  return (
    <section className="bg-paper pb-20">
      <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
        <Link
          to="/historico"
          className="inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.22em] text-mute transition hover:text-wine"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} /> voltar ao histórico
        </Link>

        {/* Cabeçalho da prova */}
        <div className="mt-6">
          <Eyebrow>gabarito da prova</Eyebrow>
          <h1 className="mt-3 font-display font-light leading-[1.05] text-ink text-[clamp(2rem,5.5vw,3.25rem)]">
            {session.courseTitle}
          </h1>
          <p className="mt-3 font-body text-[15px] italic text-mute">
            {formatDate(session.completedAt ?? session.startedAt)} · {modeLabel} ·{' '}
            {mins} {mins === 1 ? 'minuto' : 'minutos'}
          </p>
        </div>

        {/* Resumo do resultado */}
        <div className="card mt-8 flex flex-wrap items-center justify-between gap-6 p-7 sm:p-9">
          <div className="flex items-baseline gap-4">
            <span className={`font-serif text-[4rem] font-semibold leading-none sm:text-[5rem] ${ringColor}`}>
              {session.score}
              <span className="text-2xl font-normal text-muted sm:text-3xl"> / {session.total}</span>
            </span>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl italic text-wine">{pct}%</div>
            <div className="mt-1 font-display text-[11px] uppercase tracking-[0.2em] text-mute">
              de acerto
            </div>
          </div>
        </div>

        {/* Como melhorar — dicas do professor */}
        <ImprovePanel
          missedCount={missedTopics.length}
          totalTopics={topicStats.size}
          topicTips={tips.topicTips}
          courseTip={tips.courseTip}
          perfect={session.score === session.total && session.total > 0}
        />

        {legacy && (
          <p className="mt-8 rounded-2xl border-l-2 border-gold bg-blush/40 px-5 py-3 font-body text-[13px] italic text-txt/80">
            Esta é uma prova antiga: o gabarito e as explicações aparecem completos, mas a
            alternativa exata que você marcou na época não ficou registrada. Provas novas guardam
            tudo.
          </p>
        )}

        {/* Gabarito comentado */}
        <div className="mt-10">
          <Eyebrow>questão a questão</Eyebrow>
          {items.length === 0 ? (
            <div className="card mt-5 p-7 text-center">
              <p className="font-body text-[15px] italic text-mute">
                As questões desta prova não estão mais disponíveis neste aparelho, então o gabarito
                detalhado não pôde ser reconstruído. O resultado acima ficou registrado.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {items.map((item, i) => (
                <QuestionReview
                  key={`${item.questionId}-${i}`}
                  item={item}
                  index={i}
                  track={track}
                  legacy={legacy}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/historico" className="btn-ghost">
            voltar ao histórico
          </Link>
          <Link to="/cursos" className="btn-primary">
            estudar de novo
          </Link>
        </div>
      </div>
    </section>
  );
}

function ImprovePanel({
  missedCount,
  totalTopics,
  topicTips,
  courseTip,
  perfect,
}: {
  missedCount: number;
  totalTopics: number;
  topicTips: StudyTip[];
  courseTip: StudyTip | null;
  perfect: boolean;
}) {
  const hasContent = topicTips.length > 0 || courseTip;
  if (!hasContent) return null;

  return (
    <div className="card mt-6 border-[var(--blush-stroke)] bg-blush p-7 shadow-lift sm:p-9">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-wine text-[#FBEFEC]">
          <GraduationCap className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <div>
          <h2 className="font-display text-2xl italic text-ink">Como melhorar</h2>
          <p className="font-body text-[13px] italic text-mute">
            {perfect
              ? 'gabaritou — fica a orientação para manter o nível.'
              : missedCount > 0
                ? `${missedCount} ${missedCount === 1 ? 'tema' : 'temas'} para reforçar nesta prova.`
                : 'orientação do professor para esta prova.'}
          </p>
        </div>
      </div>

      {topicTips.length > 0 && (
        <ul className="mt-6 space-y-5">
          {topicTips.map((t) => (
            <li key={t.topic} className="border-l-2 border-wine/40 pl-4">
              <div className="font-display text-[11px] uppercase tracking-[0.2em] text-wine">
                {t.topic}
              </div>
              <p className="mt-1.5 font-body text-[15px] leading-relaxed text-txt">{t.tip}</p>
              {t.pearl && (
                <p className="mt-2 flex items-start gap-2 font-body text-[14px] italic text-wine">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.8} />
                  {t.pearl}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {courseTip && (
        <div className="mt-6 border-t border-[var(--blush-stroke)] pt-5">
          <div className="font-display text-[11px] uppercase tracking-[0.2em] text-mute">
            estratégia geral · {totalTopics > 0 ? `${totalTopics} ${totalTopics === 1 ? 'tema' : 'temas'} na prova` : 'esta prova'}
          </div>
          <p className="mt-1.5 font-body text-[15px] leading-relaxed text-txt">{courseTip.tip}</p>
          {courseTip.pearl && (
            <p className="mt-2 flex items-start gap-2 font-body text-[14px] italic text-wine">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.8} />
              {courseTip.pearl}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionReview({
  item,
  index,
  track,
  legacy,
}: {
  item: SessionReviewItem;
  index: number;
  track: 'medicina' | 'odonto';
  legacy: boolean;
}) {
  const status: 'right' | 'wrong' | 'blank' = !item.answered
    ? 'blank'
    : item.isRight
      ? 'right'
      : 'wrong';

  // Dica do professor logo na questão errada (pérola contextual).
  const pearl = !item.isRight ? tipForTopic(track, item.topic)?.pearl : undefined;
  // O enunciado principal só aparece no topo quando a questão tem um único
  // bloco (objetiva/associação). ECG e caso clínico carregam a pergunta dentro
  // de cada bloco, para não duplicar nem perder texto.
  const promptAtTop = Boolean(item.prompt) && item.blocks.length === 1;
  const lastBlock = item.blocks.length - 1;

  function labelFor(bi: number): string | undefined {
    if (item.blocks.length <= 1) return undefined;
    if (item.type === 'case') return `etapa ${bi + 1}`;
    if (item.type === 'ecg') return bi === lastBlock ? 'diagnóstico' : 'leitura do traçado';
    return undefined;
  }

  return (
    <article className="card overflow-hidden p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
          {String(index + 1).padStart(2, '0')} · {item.topic}
        </div>
        <StatusBadge status={status} legacy={legacy} />
      </div>

      {item.context && (
        <p className="mt-4 rounded-2xl bg-paper-soft/60 px-4 py-3 font-body text-[14px] italic leading-relaxed text-txt/85">
          {item.context}
        </p>
      )}

      {promptAtTop && (
        <p className="mt-4 font-display text-[18px] leading-snug text-ink sm:text-[20px]">
          {item.prompt}
        </p>
      )}

      {item.imageUrl && (
        <figure className="mt-4 overflow-hidden rounded-2xl border border-line bg-card">
          <img src={item.imageUrl} alt={item.imageCaption ?? 'imagem da questão'} className="w-full object-contain" loading="lazy" />
          {item.imageCaption && (
            <figcaption className="border-t border-line px-4 py-2 font-body text-xs italic text-mute">
              {item.imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      <div className="mt-5 space-y-5">
        {item.blocks.map((block, bi) => (
          <BlockReview
            key={bi}
            block={block}
            label={labelFor(bi)}
            showQuestion={!promptAtTop}
          />
        ))}
      </div>

      {pearl && (
        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-[var(--blush-stroke)] bg-blush/50 px-4 py-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.8} />
          <p className="font-body text-[14px] italic leading-relaxed text-wine">
            <span className="font-display not-italic">dica do professor: </span>
            {pearl}
          </p>
        </div>
      )}
    </article>
  );
}

function BlockReview({
  block,
  label,
  showQuestion,
}: {
  block: ReviewBlock;
  label?: string;
  showQuestion: boolean;
}) {
  return (
    <div>
      {label && (
        <div className="mb-2 font-display text-[10px] uppercase tracking-[0.22em] text-gold">
          {label}
        </div>
      )}
      {showQuestion && block.question && (
        <p className="mb-3 font-display text-[16px] leading-snug text-ink whitespace-pre-line">
          {block.question}
        </p>
      )}

      <ul className="space-y-2">
        {block.options.map((o, i) => {
          let rowClass = 'border-line bg-card text-txt';
          let badge: string | null = null;
          let Icon: typeof Check | null = null;
          let iconClass = '';
          if (o.correct && o.picked) {
            rowClass = 'border-wine bg-blush text-ink';
            badge = 'sua resposta · correta';
            Icon = Check;
            iconClass = 'bg-wine text-[#FBEFEC]';
          } else if (o.correct) {
            rowClass = 'border-wine/70 bg-blush/60 text-ink';
            badge = 'correta';
            Icon = Check;
            iconClass = 'bg-wine text-[#FBEFEC]';
          } else if (o.picked) {
            rowClass = 'border-red/40 bg-red-soft text-ink';
            badge = 'sua resposta';
            Icon = X;
            iconClass = 'bg-red text-white';
          }
          return (
            <li
              key={i}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 font-body text-[14px] leading-snug ${rowClass}`}
            >
              <span
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  Icon ? iconClass : 'bg-blush/70 text-mute'
                }`}
              >
                {Icon ? <Icon className="h-3 w-3" strokeWidth={2.4} /> : <Minus className="h-3 w-3" strokeWidth={2} />}
              </span>
              <span className="flex-1">{o.text}</span>
              {badge && (
                <span className="shrink-0 self-center font-display text-[10px] uppercase tracking-[0.16em] text-wine">
                  {badge}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {block.expl && (
        <div className="mt-3 rounded-2xl border-l-2 border-wine/40 bg-paper-soft/50 px-4 py-3 font-body text-[14px] leading-relaxed text-txt/90">
          {block.expl}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, legacy }: { status: 'right' | 'wrong' | 'blank'; legacy: boolean }) {
  if (legacy) {
    // Em provas antigas não sabemos a marcação exata; mostramos só o resultado.
    if (status === 'right') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 font-display text-[10px] uppercase tracking-[0.16em] text-wine">
          <Check className="h-3 w-3" strokeWidth={2.4} /> acertou
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-soft px-3 py-1 font-display text-[10px] uppercase tracking-[0.16em] text-red">
        <X className="h-3 w-3" strokeWidth={2.4} /> errou
      </span>
    );
  }
  if (status === 'right') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 font-display text-[10px] uppercase tracking-[0.16em] text-wine">
        <Check className="h-3 w-3" strokeWidth={2.4} /> acertou
      </span>
    );
  }
  if (status === 'blank') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 font-display text-[10px] uppercase tracking-[0.16em] text-mute">
        <Minus className="h-3 w-3" strokeWidth={2} /> em branco
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-soft px-3 py-1 font-display text-[10px] uppercase tracking-[0.16em] text-red">
      <X className="h-3 w-3" strokeWidth={2.4} /> errou
    </span>
  );
}
