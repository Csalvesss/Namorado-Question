import { motion } from 'framer-motion';
import { duration, easeOutExpo } from '../lib/motion';

type Illustration = 'petal' | 'book' | 'spark' | 'compass';

interface EmptyStateProps {
  illustration?: Illustration;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  illustration = 'petal',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.slow, ease: easeOutExpo }}
      className="card flex flex-col items-center px-6 py-12 text-center sm:py-16"
    >
      <Art kind={illustration} />
      <h3 className="mt-5 font-serif text-2xl italic text-wine-deep sm:text-3xl">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft sm:text-base">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

function Art({ kind }: { kind: Illustration }) {
  switch (kind) {
    case 'book':
      return <BookSvg />;
    case 'spark':
      return <SparkSvg />;
    case 'compass':
      return <CompassSvg />;
    case 'petal':
    default:
      return <PetalSvg />;
  }
}

function PetalSvg() {
  return (
    <svg
      width="92"
      height="92"
      viewBox="0 0 92 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g stroke="#7a1f3d" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M46 16c6 6 9 14 7 22-2 8-9 14-17 14-8 0-15-6-17-14-2-8 1-16 7-22 3-3 7-5 10-5s7 2 10 5z" opacity="0.65" />
        <path d="M30 38c-7 2-13 8-14 17M62 38c7 2 13 8 14 17" opacity="0.45" />
        <path d="M46 52v22" opacity="0.5" />
        <circle cx="46" cy="32" r="3.5" fill="#c97b8a" opacity="0.7" stroke="none" />
        <path d="M40 76c2 2 4 3 6 3s4-1 6-3" opacity="0.5" />
      </g>
    </svg>
  );
}

function BookSvg() {
  return (
    <svg
      width="92"
      height="92"
      viewBox="0 0 92 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g stroke="#7a1f3d" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M14 22c10-2 22-2 32 4v50c-10-6-22-6-32-4V22z" opacity="0.7" />
        <path d="M78 22c-10-2-22-2-32 4v50c10-6 22-6 32-4V22z" opacity="0.7" />
        <path d="M46 26v50" opacity="0.45" />
        <path d="M22 34h16M22 42h14M58 34h12M54 42h16" opacity="0.5" />
        <circle cx="46" cy="14" r="2.5" fill="#c97b8a" opacity="0.7" stroke="none" />
      </g>
    </svg>
  );
}

function SparkSvg() {
  return (
    <svg
      width="92"
      height="92"
      viewBox="0 0 92 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g stroke="#7a1f3d" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M46 14l4 16 16 4-16 4-4 16-4-16-16-4 16-4z" opacity="0.7" />
        <path d="M70 56l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" opacity="0.55" />
        <path d="M22 60l1.5 6 6 1.5-6 1.5-1.5 6-1.5-6-6-1.5 6-1.5z" opacity="0.45" />
      </g>
    </svg>
  );
}

function CompassSvg() {
  return (
    <svg
      width="92"
      height="92"
      viewBox="0 0 92 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g stroke="#7a1f3d" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx="46" cy="46" r="30" opacity="0.6" />
        <path d="M46 24v6M46 62v6M24 46h6M62 46h6" opacity="0.5" />
        <path d="M46 28l8 22-22-8 22 8-8 22z" fill="#f3d9dd" opacity="0.7" stroke="#7a1f3d" />
        <circle cx="46" cy="46" r="2.5" fill="#7a1f3d" opacity="0.8" stroke="none" />
      </g>
    </svg>
  );
}
