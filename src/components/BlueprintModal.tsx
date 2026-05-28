import { useEffect } from 'react';
import { AlertTriangle, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { blueprintsForCourse } from '../data/blueprints';
import { duration, easeOutExpo } from '../lib/motion';

interface Props {
  open: boolean;
  courseTitle: string;
  onClose: () => void;
}

export default function BlueprintModal({ open, courseTitle, onClose }: Props) {
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

  const blueprints = blueprintsForCourse(courseTitle);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.base }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 px-3 py-6 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: duration.slow, ease: easeOutExpo }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-paper shadow-card"
          >
            <div className="flex items-start justify-between gap-3 border-b border-line bg-wine-deep px-5 py-4 text-paper sm:px-7">
              <div>
                <div className="text-[10px] uppercase tracking-[0.32em] text-rose-soft/80">resumo rápido</div>
                <h2 className="mt-1 font-serif text-2xl italic sm:text-3xl">
                  blueprint · {courseTitle.toLowerCase()}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="fechar"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-paper/80 transition hover:bg-white/10"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
              {blueprints.length === 0 ? (
                <p className="font-serif text-base italic leading-relaxed text-ink-soft">
                  blueprint ainda não escrito para esse curso. quando o Cesar adicionar o resumo, ele aparece aqui.
                </p>
              ) : (
                blueprints.map((bp) => (
                  <section key={bp.topic} className="space-y-3">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[10px] uppercase tracking-[0.32em] text-gold">tópico</span>
                      <h3 className="font-serif text-xl italic text-wine-deep sm:text-2xl">{bp.topic}</h3>
                    </div>
                    <ul className="space-y-2 pl-1">
                      {bp.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink sm:text-[15px]">
                          <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-wine" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    {bp.redFlag && (
                      <div className="flex items-start gap-2 rounded-xl border-l-[3px] border-red bg-red-soft/60 px-3 py-2 text-sm leading-relaxed text-ink">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red" strokeWidth={1.75} />
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-red">red flag</div>
                          <p className="mt-0.5">{bp.redFlag}</p>
                        </div>
                      </div>
                    )}
                    {bp.pearl && (
                      <div className="flex items-start gap-2 rounded-xl border-l-[3px] border-gold bg-gold/10 px-3 py-2 text-sm leading-relaxed text-ink">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.75} />
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-gold">pérola clínica</div>
                          <p className="mt-0.5">{bp.pearl}</p>
                        </div>
                      </div>
                    )}
                  </section>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
