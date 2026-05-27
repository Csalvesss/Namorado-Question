import type { Transition, Variants } from 'framer-motion';

export const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const easeInOutQuint: [number, number, number, number] = [0.83, 0, 0.17, 1];

export const duration = {
  fast: 0.18,
  base: 0.32,
  slow: 0.52,
  page: 0.42,
} as const;

export const transition = {
  base: { duration: duration.base, ease: easeOutExpo } satisfies Transition,
  slow: { duration: duration.slow, ease: easeOutExpo } satisfies Transition,
  spring: { type: 'spring', stiffness: 260, damping: 24 } satisfies Transition,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const stagger = (childDelay = 0.06): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: childDelay, delayChildren: 0.04 },
  },
});

export const palette = {
  wine: '#7a1f3d',
  wineDeep: '#5a1530',
  rose: '#c97b8a',
  roseSoft: '#f3d9dd',
  gold: '#b8895a',
  green: '#4f6b4a',
  ink: '#2b1d1a',
} as const;
