import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, RotateCw } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';
import { db } from '../lib/db';
import { shuffle } from '../lib/quiz';
import { useUser } from '../lib/useUser';
import type { FlashcardQuestion } from '../types';

interface Item {
  card: FlashcardQuestion;
  course: string;
}

export default function QuickReview() {
  const { user } = useUser();
  const courses = useMemo(() => db.courses.list(), []);
  const items = useMemo(() => {
    const out: Item[] = [];
    courses.forEach((c) => {
      const cards = db.questions
        .listByCourse(c.id)
        .filter((q): q is FlashcardQuestion => q.type === 'flashcard');
      cards.forEach((card) => out.push({ card, course: c.title }));
    });
    return out;
  }, [courses]);

  const [deck, setDeck] = useState<Item[]>([]);
  const [cursor, setCursor] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    setDeck(shuffle(items).slice(0, Math.min(10, items.length)));
    setCursor(0);
    setFlipped(false);
  }, [items]);

  if (!user) return null;

  if (items.length === 0) {
    return (
      <PageContainer width="md">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <Link to="/app" className="inline-flex items-center text-[11px] uppercase tracking-wider text-muted hover:text-wine">
            <ArrowLeft className="mr-1 h-3 w-3" /> Voltar
          </Link>
          <h1 className="font-serif text-3xl italic text-wine-deep">passa-fácil noturno</h1>
          <p className="font-serif text-base italic text-ink-soft">
            ainda não temos flashcards no banco. quando os cursos ganharem cards, eles aparecem aqui para uma revisão tranquila.
          </p>
        </div>
      </PageContainer>
    );
  }

  const cur = deck[cursor];
  const done = cursor >= deck.length;

  function nextCard() {
    setFlipped(false);
    setCursor((c) => c + 1);
  }

  function restart() {
    setDeck(shuffle(items).slice(0, Math.min(10, items.length)));
    setCursor(0);
    setFlipped(false);
  }

  return (
    <PageContainer width="md">
    <div className="space-y-8 pb-20">
      <header>
        <Link to="/app" className="inline-flex items-center text-[11px] uppercase tracking-wider text-muted transition hover:text-wine">
          <ArrowLeft className="mr-1 h-3 w-3" strokeWidth={2} /> Voltar
        </Link>
        <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-gold opacity-80">
          <Moon className="h-3 w-3" strokeWidth={1.75} />
          revisão noturna
        </div>
        <h1 className="mt-2 font-serif italic leading-[1.05] text-wine-deep">
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">passa-fácil,</span>{' '}
          <span className="text-[clamp(1.75rem,4vw,2.75rem)] text-rose">doutora</span>
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">.</span>
        </h1>
        <p className="mt-3 font-serif text-base italic leading-relaxed text-ink-soft sm:text-lg">
          dez cards aleatórios. sem cobrança, sem gabarito. só relembrar o que você já sabe antes de dormir.
        </p>
      </header>

      {done ? (
        <section className="rounded-3xl border border-line bg-paper px-6 py-10 text-center shadow-card">
          <div className="text-[10px] uppercase tracking-[0.32em] text-gold">acabou por hoje</div>
          <h2 className="mt-3 font-serif text-3xl italic text-wine-deep">você passou pelos dez.</h2>
          <p className="mt-3 font-serif text-base italic text-ink-soft">
            agora é dormir. amanhã a gente continua.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-full bg-wine px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98]"
            >
              <RotateCw className="h-3.5 w-3.5" strokeWidth={2} />
              mais dez
            </button>
            <Link
              to="/app"
              className="inline-flex items-center rounded-full border border-line bg-paper px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink-soft transition hover:bg-paper-soft"
            >
              ir dormir
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted">
            <span>card {cursor + 1} de {deck.length}</span>
            <span>{cur.course}</span>
          </div>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="block w-full overflow-hidden rounded-3xl border border-line bg-paper px-6 py-10 text-left shadow-card transition active:scale-[0.997] hover:shadow-card-hover sm:px-10 sm:py-12"
          >
            <div className="text-[10px] uppercase tracking-[0.32em] text-gold">
              {flipped ? 'verso' : 'frente'}
            </div>
            <p className="mt-4 font-serif text-2xl italic leading-snug text-wine-deep sm:text-3xl">
              {flipped ? cur.card.back : cur.card.front}
            </p>
            {!flipped && cur.card.hint && (
              <p className="mt-4 text-sm italic text-ink-soft">dica: {cur.card.hint}</p>
            )}
            <div className="mt-6 text-[11px] uppercase tracking-wider text-muted">
              {flipped ? 'toca para voltar' : 'toca para virar'}
            </div>
          </button>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={nextCard}
              className="inline-flex items-center rounded-full bg-wine px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98]"
            >
              próximo
            </button>
          </div>
        </>
      )}
    </div>
    </PageContainer>
  );
}
