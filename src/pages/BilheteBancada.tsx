import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Pill, RotateCcw } from 'lucide-react';
import Eyebrow from '../components/ui/Eyebrow';
import IconChip from '../components/ui/IconChip';
import { useUser } from '../lib/useUser';
import { currentBilhete, formatRotationCountdown, nextRotationIn, type Tone } from '../lib/bilhete';
import { PILULAS_CLINICAS, pickPilulaForBucket, type PilulaClinica } from '../data/pilulas-clinicas';
import { reviewCard } from '../lib/srs';

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

function bucketIndex(now: number) {
  return Math.floor(now / FIVE_HOURS_MS);
}

/**
 * Bilhete da Bancada — versão odonto-específica do bilhete rotativo,
 * acopla 1 micro-pílula clínica de farmaco odonto. Ela toca em "já sei"
 * ou "revisa amanhã" — entra no SRS com prefixo bancada-{id}.
 */
export default function BilheteBancada() {
  const { user } = useUser();
  const displayMode = user?.displayMode ?? 'namorado';
  const isNamorado = displayMode === 'namorado';
  const isIrmao = displayMode === 'irmao';
  const [tick, setTick] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [marked, setMarked] = useState<null | 'sabe' | 'revisar'>(null);

  // Pega bilhete e pílula do bucket atual
  const tone: Tone = isIrmao ? 'irmao' : user?.displayMode === 'doutora' ? 'doutora' : 'namorado';
  const bilhete = useMemo(() => currentBilhete(tone), [tick, tone]);
  const pilula = useMemo<PilulaClinica>(
    () => pickPilulaForBucket(bucketIndex(Date.now())),
    [tick],
  );
  const nextIn = useMemo(() => formatRotationCountdown(nextRotationIn()), [tick]);

  useEffect(() => {
    const delay = nextRotationIn();
    const timer = setTimeout(() => {
      setTick((t) => t + 1);
      setRevealed(false);
      setMarked(null);
    }, delay + 1000);
    return () => clearTimeout(timer);
  }, [tick]);

  function markKnow() {
    if (!user) return;
    setMarked('sabe');
    reviewCard(user.uid, `bancada:${pilula.id}`, 'easy', 'odonto');
  }

  function markReview() {
    if (!user) return;
    setMarked('revisar');
    reviewCard(user.uid, `bancada:${pilula.id}`, 'hard', 'odonto');
  }

  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-3xl px-6 py-14 sm:px-10 sm:py-20 lg:px-12">
        <Link
          to="/ferramentas"
          className="inline-flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.22em] text-mute transition hover:text-wine"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={2} /> voltar para ferramentas
        </Link>

        <div className="mt-6 flex items-baseline gap-5">
          <IconChip icon={Pill} size="lg" />
          <h1 className="font-display font-light text-ink text-[clamp(2rem,5vw,3rem)] leading-[1.05]">
            Bilhete da Bancada
          </h1>
        </div>

        <p className="mt-4 max-w-xl font-body text-lg italic leading-relaxed text-mute">
          {isNamorado
            ? 'um bilhete carinhoso a cada 5h — com uma pílula clínica anexada, para fixar enquanto descansa.'
            : isIrmao
              ? 'recado curto a cada 5h e uma pílula clínica de quebra. fixa enquanto descansa.'
              : 'micro-revisão clínica embrulhada num recado curto. roda a cada 5 horas.'}
        </p>

        {/* Bilhete carinhoso */}
        <div className="mt-10 rounded-3xl border border-[var(--blush-stroke)] bg-blush p-7 shadow-lift sm:p-9">
          <Eyebrow>recado</Eyebrow>
          <p className="mt-4 font-body text-[17px] italic leading-relaxed text-txt sm:text-[19px]">
            &ldquo;{bilhete.body}&rdquo;
          </p>
          <div className="mt-5 flex items-end justify-between gap-3 border-t border-[var(--blush-stroke)] pt-4 font-display text-[11px] uppercase tracking-[0.22em] text-mute">
            <span>novo em {nextIn}</span>
            <span className="italic text-rose">— {isIrmao ? 'irmão' : user?.partnerName?.trim() || 'César'}</span>
          </div>
        </div>

        {/* Micro-pílula clínica */}
        <div className="card mt-6 p-7 sm:p-9">
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>pílula clínica do dia</Eyebrow>
            <span className="font-display text-[10px] uppercase tracking-[0.22em] text-gold">
              {pilula.topic}
            </span>
          </div>

          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-paper px-6 py-8 text-center font-display italic text-mute transition hover:border-wine/40 hover:text-wine"
            >
              <Pill className="h-4 w-4" strokeWidth={1.6} /> toca para revelar
            </button>
          ) : (
            <>
              <p className="mt-4 font-body text-[17px] leading-relaxed text-txt">
                {pilula.body}
              </p>
              {pilula.hint && (
                <p className="mt-3 font-body text-[14px] italic text-mute">{pilula.hint}</p>
              )}

              {/* Ações de SRS */}
              {marked === null ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={markKnow}
                    className="btn-ghost flex-1 sm:flex-none"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2} /> já sei
                  </button>
                  <button
                    type="button"
                    onClick={markReview}
                    className="btn-primary flex-1 sm:flex-none"
                  >
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} /> revisa amanhã
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-line bg-blush/40 px-5 py-4 font-body text-sm italic text-wine">
                  {marked === 'sabe'
                    ? isNamorado
                      ? 'beleza, doutora. essa tá no bolso.'
                      : isIrmao
                        ? 'beleza, essa tá no bolso.'
                        : 'marcada como dominada.'
                    : isNamorado
                      ? 'volta amanhã para fechar. sem pressão.'
                      : isIrmao
                        ? 'volta amanhã para fechar. sem drama.'
                        : 'agendada para revisão.'}
                </div>
              )}
            </>
          )}
        </div>

        {/* Estatística — quantas pílulas no banco */}
        <p className="mt-10 text-center font-body text-xs italic text-mute">
          banco com {PILULAS_CLINICAS.length} pílulas. Rotaciona a cada 5 horas.
        </p>
      </div>
    </section>
  );
}
