import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, GitBranch, RotateCw, Workflow } from 'lucide-react';
import PageContainer from '../components/ui/PageContainer';
import { db } from '../lib/db';
import { duration as motionDuration, easeOutExpo } from '../lib/motion';
import { useUser } from '../lib/useUser';
import type { AlgorithmNode, AlgorithmOutcome, AlgorithmQuestion } from '../types';

export function AlgorithmsList() {
  const { user } = useUser();
  const userTrack = user?.track ?? 'medicina';
  const algos = useMemo(() => {
    const courses = db.courses.listByTrack(userTrack);
    const out: Array<{ q: AlgorithmQuestion; courseTitle: string }> = [];
    courses.forEach((c) => {
      db.questions
        .listByCourse(c.id)
        .filter((q): q is AlgorithmQuestion => q.type === 'algorithm')
        .forEach((q) => out.push({ q, courseTitle: c.title }));
    });
    return out;
  }, [userTrack]);

  return (
    <PageContainer>
    <div className="space-y-10">
      <section>
        <div className="eyebrow-gold">protocolos e fluxogramas</div>
        <h1 className="mt-3 font-serif italic leading-[1.05] text-wine-deep">
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">algoritmos,</span>{' '}
          <span className="text-[clamp(1.75rem,4vw,2.75rem)] text-rose">na ponta da mão</span>
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">.</span>
        </h1>
        <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-ink-soft sm:text-lg">
          árvores de decisão clínica. cada escolha leva a um próximo nó até o desfecho. erro não custa nada aqui, só ensina.
        </p>
      </section>

      {algos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-paper-soft px-5 py-8 text-center font-serif text-base italic text-ink-soft">
          nenhum algoritmo disponível ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {algos.map(({ q, courseTitle }) => (
            <Link
              key={q.id}
              to={`/algoritmos/${q.id}`}
              className="group block overflow-hidden rounded-3xl border border-line bg-paper shadow-card transition active:scale-[0.995] hover:shadow-card-hover"
            >
              <div className="relative flex items-start gap-3 bg-wine-deep px-5 py-4 text-paper">
                <span
                  aria-hidden
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-rose-soft"
                >
                  <Workflow className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-rose-soft/80">
                    {q.specialty ?? q.topic}
                  </div>
                  <h3 className="mt-0.5 font-serif text-xl italic leading-tight sm:text-2xl">
                    {q.title}
                  </h3>
                </div>
              </div>
              <div className="px-5 py-4">
                {q.subtitle && (
                  <p className="font-serif text-base italic leading-relaxed text-ink-soft">
                    {q.subtitle}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted">
                  <span className="inline-flex items-center gap-1 rounded-full bg-paper-soft px-2.5 py-0.5">
                    <GitBranch className="h-3 w-3" strokeWidth={1.75} />
                    {q.nodes.length} nós
                  </span>
                  <span className="rounded-full bg-paper-soft px-2.5 py-0.5">
                    {q.outcomes.length} desfechos
                  </span>
                </div>
                <div className="mt-3 text-[11px] italic text-muted">{courseTitle}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    </PageContainer>
  );
}

export default function AlgorithmPlayer() {
  const { algoId = '' } = useParams();
  const algo = useMemo(() => {
    const courses = db.courses.list();
    for (const c of courses) {
      const found = db.questions.listByCourse(c.id).find((q) => q.id === algoId);
      if (found && found.type === 'algorithm') return found;
    }
    return null;
  }, [algoId]);

  const [nodeId, setNodeId] = useState<string>(() => algo?.startNodeId ?? '');
  const [outcome, setOutcome] = useState<AlgorithmOutcome | null>(null);
  const [trail, setTrail] = useState<Array<{ nodeId: string; choice: string }>>([]);

  function reset() {
    if (!algo) return;
    setNodeId(algo.startNodeId);
    setOutcome(null);
    setTrail([]);
  }

  if (!algo) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="font-serif text-xl italic text-ink-soft">Algoritmo não encontrado.</p>
        <Link to="/algoritmos" className="btn-secondary mt-4 inline-block">Voltar</Link>
      </div>
    );
  }

  const node = algo.nodes.find((n) => n.id === nodeId) ?? algo.nodes.find((n) => n.id === algo.startNodeId)!;

  function choose(opt: AlgorithmNode['options'][number]) {
    const outcomeMatch = algo!.outcomes.find((o) => o.id === opt.nextId);
    setTrail((t) => [...t, { nodeId: node.id, choice: opt.label }]);
    if (outcomeMatch) {
      setOutcome(outcomeMatch);
    } else {
      setNodeId(opt.nextId);
    }
  }

  return (
    <PageContainer width="md">
    <div className="space-y-6 pb-16">
      <Link
        to="/algoritmos"
        className="inline-flex items-center text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-wine"
      >
        <ArrowLeft className="mr-1 h-3 w-3" strokeWidth={2} />
        voltar aos algoritmos
      </Link>

      <header className="overflow-hidden rounded-3xl border border-wine-deep bg-wine-deep text-paper shadow-card">
        <div className="px-6 py-7 sm:px-9 sm:py-9">
          <div className="text-[10px] uppercase tracking-[0.32em] text-rose-soft/80">
            {algo.specialty ?? 'algoritmo clínico'}
          </div>
          <h1 className="mt-2 font-serif text-3xl italic leading-tight sm:text-4xl">{algo.title}</h1>
          {algo.subtitle && (
            <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-paper/85 sm:text-lg">
              {algo.subtitle}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-rose-soft/80">
            <span className="rounded-full bg-white/10 px-2.5 py-1">
              passo {trail.length + (outcome ? 0 : 1)} {outcome ? '· final' : ''}
            </span>
          </div>
        </div>
      </header>

      {outcome ? (
        <OutcomeView outcome={outcome} trail={trail} algo={algo} onReset={reset} />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={node.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: motionDuration.slow, ease: easeOutExpo }}
            className="rounded-3xl border border-line bg-paper px-6 py-7 shadow-card sm:px-9 sm:py-9"
          >
            {node.prompt && (
              <p className="mb-4 whitespace-pre-line font-serif text-[14px] italic leading-relaxed text-ink-soft sm:text-[15px]">
                {node.prompt}
              </p>
            )}
            <h2 className="font-serif text-xl italic leading-snug text-wine-deep sm:text-2xl">
              {node.question}
            </h2>

            <div className="mt-6 flex flex-col gap-2.5">
              {node.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(opt)}
                  className="flex min-h-[56px] items-start gap-3 rounded-2xl border border-line bg-paper px-4 py-3 text-left text-[15px] leading-snug text-ink-soft transition hover:border-rose hover:text-ink active:scale-[0.99]"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-paper font-serif text-sm font-semibold text-wine"
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt.label}</span>
                  <ChevronRight className="mt-2 h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.75} />
                </button>
              ))}
            </div>

            {trail.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="mt-6 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted transition hover:text-wine"
              >
                <RotateCw className="h-3 w-3" strokeWidth={1.75} />
                recomeçar
              </button>
            )}
          </motion.article>
        </AnimatePresence>
      )}
    </div>
    </PageContainer>
  );
}

function OutcomeView({
  outcome,
  trail,
  algo,
  onReset,
}: {
  outcome: AlgorithmOutcome;
  trail: Array<{ nodeId: string; choice: string }>;
  algo: AlgorithmQuestion;
  onReset: () => void;
}) {
  const banner =
    outcome.tone === 'good'
      ? 'bg-green text-white'
      : outcome.tone === 'bad'
        ? 'bg-red text-white'
        : 'bg-wine-deep text-white';

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionDuration.slow, ease: easeOutExpo }}
      className="overflow-hidden rounded-3xl border border-line bg-paper-soft shadow-card"
    >
      <div className={`px-6 py-6 sm:px-9 ${banner}`}>
        <div className="text-[10px] uppercase tracking-[0.32em] text-white/80">
          {outcome.tone === 'good' ? 'desfecho favorável' : outcome.tone === 'bad' ? 'desfecho adverso' : 'desfecho'}
        </div>
        <h2 className="mt-2 font-serif text-3xl italic leading-tight sm:text-4xl">{outcome.title}</h2>
      </div>
      <div className="px-6 py-7 sm:px-9 sm:py-9">
        <p className="whitespace-pre-line font-serif text-[15px] leading-relaxed text-ink sm:text-base">
          {outcome.body}
        </p>

        <div className="mt-7 rounded-2xl border border-line bg-paper px-5 py-4">
          <div className="text-[10px] uppercase tracking-wider text-gold">seu caminho</div>
          <ol className="mt-3 space-y-2 text-sm italic text-ink-soft">
            {trail.map((step, i) => {
              const node = algo.nodes.find((n) => n.id === step.nodeId);
              return (
                <li key={i} className="flex gap-2">
                  <span className="font-serif text-muted">{String(i + 1).padStart(2, '0')}.</span>
                  <span className="flex-1">
                    {node?.question}
                    <br />
                    <span className="text-wine-deep">→ {step.choice}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-full border border-wine bg-paper px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-wine-deep transition hover:bg-rose-soft active:scale-[0.98]"
          >
            <RotateCw className="h-3.5 w-3.5" strokeWidth={2} />
            tentar outro caminho
          </button>
          <Link
            to="/algoritmos"
            className="inline-flex items-center rounded-full bg-wine px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition hover:bg-wine-deep active:scale-[0.98]"
          >
            outro algoritmo
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
