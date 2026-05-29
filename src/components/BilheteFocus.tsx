import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Coffee, Wind } from 'lucide-react';
import BilheteCard from './BilheteCard';
import SpringFlower from './decorative/SpringFlower';
import type { Bilhete } from '../data/bilhetes';
import { duration, easeOutExpo } from '../lib/motion';

interface Props {
  open: boolean;
  bilhete: Bilhete | null;
  signature?: string;
  uid?: string;
  onClose: () => void;
}

const BREATH_STEPS = [
  { label: 'inspira', sec: 4 },
  { label: 'segura', sec: 4 },
  { label: 'solta', sec: 6 },
];

export default function BilheteFocus({ open, bilhete, signature, uid, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && bilhete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.base }}
          className="fixed inset-0 z-[60] overflow-y-auto bg-paper-soft"
        >
          <div className="safe-top mx-auto flex min-h-full max-w-6xl flex-col px-5 pt-6 pb-safe sm:px-8 sm:pt-10">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 self-start text-[11px] uppercase tracking-[0.22em] text-muted transition hover:text-wine"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              voltar para a prova
            </button>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.slow, ease: easeOutExpo, delay: 0.05 }}
              className="mt-6 flex items-center justify-center gap-3 text-rose"
            >
              <span className="h-px w-12 bg-rose-soft" />
              <span className="font-serif text-[11px] uppercase tracking-[0.32em] text-gold">
                uma pausa para você
              </span>
              <span className="h-px w-12 bg-rose-soft" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.slow, ease: easeOutExpo, delay: 0.15 }}
              className="mx-auto mt-3 max-w-2xl text-center font-serif italic leading-[1.05] text-wine-deep"
            >
              <span className="block text-[clamp(2rem,5vw,3.25rem)]">respira fundo,</span>
              <span className="block text-[clamp(2rem,5vw,3.25rem)] text-rose">doutora.</span>
            </motion.h1>

            <p className="mx-auto mt-4 max-w-md text-center font-serif text-base italic leading-relaxed text-ink-soft sm:text-lg">
              o estudo espera. seu corpo também merece atenção.
            </p>

            <div className="mt-10 grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: duration.slow, ease: easeOutExpo, delay: 0.25 }}
                className="relative"
              >
                <SpringFlower
                  size={120}
                  className="pointer-events-none absolute -left-8 -top-10 opacity-70"
                />
                <BilheteCard
                  bilhete={bilhete}
                  signature={signature}
                  uid={uid}
                  className="relative"
                />
              </motion.div>

              <motion.aside
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: duration.slow, ease: easeOutExpo, delay: 0.35 }}
                className="space-y-6"
              >
                <section className="rounded-3xl border border-line bg-paper px-6 py-7 shadow-soft">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold">
                    <Wind className="h-3.5 w-3.5" strokeWidth={1.75} />
                    respiração quadrada
                  </div>
                  <p className="mt-3 font-serif text-base italic leading-relaxed text-ink-soft">
                    Três ciclos. Sem pressa.
                  </p>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {BREATH_STEPS.map((step) => (
                      <div
                        key={step.label}
                        className="rounded-2xl border border-line bg-paper-soft px-3 py-4 text-center"
                      >
                        <div className="font-serif text-3xl font-semibold leading-none text-wine-deep">
                          {step.sec}s
                        </div>
                        <div className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-muted">
                          {step.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-line bg-paper px-6 py-7 shadow-soft">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold">
                    <Coffee className="h-3.5 w-3.5" strokeWidth={1.75} />
                    lembrete carinhoso
                  </div>
                  <ul className="mt-3 space-y-2 font-serif text-base italic leading-relaxed text-ink-soft">
                    <li>· bebe água, doutora.</li>
                    <li>· solta o ombro, mexe o pescoço.</li>
                    <li>· se quiser, fecha o olho por um minuto.</li>
                    <li>· você está indo muito bem.</li>
                  </ul>
                </section>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex w-full items-center justify-center rounded-full bg-wine px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-wine transition active:scale-[0.98] hover:bg-wine-deep"
                >
                  voltar para a prova
                </button>
              </motion.aside>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3 text-rose opacity-50">
              <span className="h-px w-12 bg-rose-soft" />
              <span className="font-serif text-lg italic">·</span>
              <span className="h-px w-12 bg-rose-soft" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
