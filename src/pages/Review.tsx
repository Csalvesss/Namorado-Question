import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import PageContainer from '../components/ui/PageContainer';
import { duration, easeOutExpo } from '../lib/motion';
import { db } from '../lib/db';
import {
  defaultState,
  getCardState,
  listDueCards,
  previewIntervals,
  reviewCard,
  SRS_CHANGE_EVENT,
  srsStats,
  type Grade,
} from '../lib/srs';
import { useUser } from '../lib/useUser';
import type { FlashcardQuestion } from '../types';

interface ReviewItem {
  card: FlashcardQuestion;
  course: string;
}

const GRADES: Array<{ value: Grade; label: string; helper: string; classes: string }> = [
  {
    value: 'again',
    label: 'Errei',
    helper: 'volta logo',
    classes: 'border-red bg-red-soft text-red hover:bg-red-soft/80',
  },
  {
    value: 'hard',
    label: 'Difícil',
    helper: 'intervalo menor',
    classes: 'border-gold bg-paper text-gold hover:bg-bg-soft',
  },
  {
    value: 'good',
    label: 'Bom',
    helper: 'intervalo padrão',
    classes: 'border-wine bg-rose-soft text-wine-deep hover:bg-rose-soft/80',
  },
  {
    value: 'easy',
    label: 'Fácil',
    helper: 'estica o prazo',
    classes: 'border-green bg-green-soft text-green hover:bg-green-soft/80',
  },
];

export default function Review() {
  const navigate = useNavigate();
  const { user } = useUser();
  const userTrack = user?.track ?? 'medicina';

  const allCards = useMemo<ReviewItem[]>(() => {
    const courses = db.courses.listByTrack(userTrack);
    const items: ReviewItem[] = [];
    courses.forEach((c) => {
      const cards = db.questions
        .listByCourse(c.id)
        .filter((q): q is FlashcardQuestion => q.type === 'flashcard');
      cards.forEach((card) => items.push({ card, course: c.title }));
    });
    return items;
  }, [userTrack]);

  const stats = useMemo(() => {
    if (!user) return null;
    return srsStats(user.uid, allCards.map((i) => i.card.id), Date.now(), userTrack);
  }, [user, allCards, userTrack]);

  const dueQueue = useMemo<ReviewItem[]>(() => {
    if (!user || allCards.length === 0) return [];
    const dueIds = new Set(
      listDueCards(user.uid, allCards.map((i) => i.card.id), Date.now(), userTrack),
    );
    return allCards.filter((i) => dueIds.has(i.card.id));
  }, [user, allCards, userTrack]);

  const [order, setOrder] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [, forceRender] = useState(0);

  useEffect(() => {
    function bump() {
      forceRender((n) => n + 1);
    }
    window.addEventListener(SRS_CHANGE_EVENT, bump);
    return () => window.removeEventListener(SRS_CHANGE_EVENT, bump);
  }, []);

  useEffect(() => {
    setOrder(dueQueue.map((i) => i.card.id));
    setCursor(0);
    setFlipped(false);
    setDoneCount(0);
  }, [dueQueue]);

  if (!user) return null;

  if (allCards.length === 0) {
    return (
      <PageContainer width="lg">
      <div className="space-y-8">
        <Link
          to="/app"
          className="inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-wine"
        >
          <ArrowLeft className="mr-1 h-3 w-3" strokeWidth={2} /> Voltar
        </Link>
        <EmptyState
          illustration="spark"
          title="Você ainda não tem flashcards"
          description="Vá em Autor, escolha o tipo Flashcard e crie seus cards diretamente nos formulários. Eles aparecem aqui para revisão com repetição espaçada."
          action={
            <Link to="/autor" className="btn-primary">
              Criar flashcards
            </Link>
          }
        />
      </div>
      </PageContainer>
    );
  }

  if (order.length === 0) {
    return (
      <PageContainer width="lg">
      <div className="space-y-8">
        <Link
          to="/app"
          className="inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-wine"
        >
          <ArrowLeft className="mr-1 h-3 w-3" strokeWidth={2} /> Voltar
        </Link>
        <EmptyState
          illustration="petal"
          title="Nenhum card para revisar agora"
          description={
            stats
              ? `Você tem ${stats.total} flashcards no banco. Volte mais tarde ou estude novos cards começando uma rodada.`
              : 'Volte mais tarde quando algum card estiver vencido.'
          }
          action={
            <Link to="/app" className="btn-secondary">
              Voltar ao Dashboard
            </Link>
          }
        />
      </div>
      </PageContainer>
    );
  }

  const currentItem = dueQueue.find((i) => i.card.id === order[cursor]);

  if (!currentItem) {
    return (
      <PageContainer width="lg">
      <div className="space-y-8 text-center">
        <Link
          to="/app"
          className="inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-wine"
        >
          <ArrowLeft className="mr-1 h-3 w-3" strokeWidth={2} /> Voltar
        </Link>
        <div className="card mx-auto max-w-md p-8">
          <Sparkles className="mx-auto h-8 w-8 text-wine" strokeWidth={1.5} />
          <h2 className="mt-4 font-serif text-3xl italic text-wine-deep">Rodada concluída</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Você revisou {doneCount} {doneCount === 1 ? 'card' : 'cards'}. Cada nota ajusta o
            próximo intervalo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate(0)} className="btn-secondary">
              Estudar mais
            </button>
            <Link to="/app" className="btn-primary">
              Voltar
            </Link>
          </div>
        </div>
      </div>
      </PageContainer>
    );
  }

  const { card } = currentItem;
  const state = getCardState(user.uid, card.id, userTrack);
  const previews = previewIntervals(state);

  function grade(value: Grade) {
    if (!user || !currentItem) return;
    reviewCard(user.uid, currentItem.card.id, value, userTrack);
    forceRender((n) => n + 1);
    setDoneCount((n) => n + 1);
    setFlipped(false);
    setCursor((c) => c + 1);
  }

  const progress = ((cursor) / order.length) * 100;
  const cardKey = `${card.id}-${cursor}`;

  return (
    <PageContainer width="lg">
    <div className="space-y-6 pb-32 md:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/app"
            className="inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-wine"
          >
            <ArrowLeft className="mr-1 h-3 w-3" strokeWidth={2} /> Voltar
          </Link>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-serif text-3xl italic leading-none text-gold opacity-60">I</span>
            <h1 className="display-title-sm">Revisão</h1>
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-muted">
            {currentItem.course} · {card.topic}
          </p>
        </div>
        {stats && (
          <div className="flex items-baseline gap-4 text-[11px] uppercase tracking-[0.18em] text-muted">
            <span>
              <strong className="font-serif text-base text-wine-deep">{order.length - cursor}</strong>{' '}
              restantes
            </span>
            <span>
              <strong className="font-serif text-base text-wine-deep">{stats.newCount}</strong>{' '}
              novos
            </span>
            <span>
              <strong className="font-serif text-base text-wine-deep">{stats.mature}</strong>{' '}
              maduros
            </span>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-full bg-rose-soft">
        <div
          className="h-1.5 bg-gradient-to-r from-rose to-wine transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.button
            key={cardKey}
            type="button"
            onClick={() => setFlipped((f) => !f)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: duration.base, ease: easeOutExpo }}
            className="card-elevated mx-auto block w-full max-w-2xl cursor-pointer p-8 text-left transition active:scale-[0.995] hover:shadow-card-hover sm:p-12"
            aria-label={flipped ? 'Tocar para esconder a resposta' : 'Tocar para revelar a resposta'}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow-gold">{flipped ? 'Resposta' : 'Pergunta'}</span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-paper-soft text-wine">
                {flipped ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />}
              </span>
            </div>
            <p className="font-serif text-2xl italic leading-snug text-wine-deep sm:text-3xl">
              {flipped ? card.back : card.front}
            </p>
            {!flipped && card.hint && (
              <p className="mt-4 text-sm italic leading-relaxed text-ink-soft">
                dica: {card.hint}
              </p>
            )}
            {!flipped && (
              <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-muted">
                Tocar para ver a resposta
              </p>
            )}
          </motion.button>
        </AnimatePresence>
      </div>

      <div className="sticky-cta">
        <div className="mx-auto max-w-2xl">
          {flipped ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {GRADES.map((g) => (
                <button
                  key={g.value}
                  onClick={() => grade(g.value)}
                  className={`flex min-h-touch flex-col items-center rounded-xl border px-3 py-2.5 transition active:scale-[0.97] ${g.classes}`}
                >
                  <span className="font-serif text-base font-semibold leading-tight">
                    {g.label}
                  </span>
                  <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] opacity-80">
                    {previews[g.value]}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => setFlipped(true)}
              className="btn-primary w-full sm:w-auto"
            >
              Mostrar resposta
            </button>
          )}
        </div>
      </div>
    </div>
    </PageContainer>
  );
}

// Re-export for App.tsx route convenience
export { defaultState };
