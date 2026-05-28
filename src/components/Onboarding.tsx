import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Heart, Sparkles, Target, type LucideIcon } from 'lucide-react';
import { duration, easeOutExpo } from '../lib/motion';

const STORAGE_KEY = 'guava.onboardingSeen';

interface Slide {
  Icon: LucideIcon;
  title: string;
  body: string;
}

const slides: Slide[] = [
  {
    Icon: Sparkles,
    title: 'bem-vinda',
    body: 'esta plataforma é o seu espaço de estudo. cada matéria tem um banco próprio de questões, com vários modos para você escolher: revisão rápida, simulado cronometrado, maratona.',
  },
  {
    Icon: Target,
    title: 'modo erro',
    body: 'sempre que você errar uma questão, ela vai para o modo erro. é o jeito mais rápido de fechar os pontos fracos sem precisar refazer prova inteira.',
  },
  {
    Icon: Heart,
    title: 'modo namorado · modo doutora',
    body: 'no perfil você troca o tom das mensagens. modo namorado tem as frases carinhosas. modo doutora deixa tudo neutro para estudar em público sem chamar atenção.',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !!localStorage.getItem(STORAGE_KEY);
  });

  if (done) return null;

  function next() {
    if (step < slides.length - 1) setStep(step + 1);
    else finish();
  }

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1');
    setDone(true);
  }

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration.base }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-wine-deep/30 px-4 py-6 pb-safe backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: duration.slow, ease: easeOutExpo }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-paper-soft p-7 text-center shadow-card-hover sm:p-9"
        >
          <button
            onClick={finish}
            className="absolute right-4 top-3 text-xs uppercase tracking-[0.18em] text-muted transition hover:text-wine"
          >
            Pular
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: duration.base, ease: easeOutExpo }}
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-soft text-wine-deep">
                <slide.Icon className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <h2
                id="onboarding-title"
                className="mt-5 font-serif text-3xl italic text-wine-deep sm:text-4xl"
              >
                {slide.title}
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-soft">
                {slide.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-wine' : 'w-1.5 bg-rose-soft'
                }`}
              />
            ))}
          </div>

          <button onClick={next} className="btn-primary mt-7 w-full sm:w-auto">
            {isLast ? 'Começar' : (
              <>
                Próxima
                <ChevronRight className="ml-1 h-4 w-4" strokeWidth={2} />
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
