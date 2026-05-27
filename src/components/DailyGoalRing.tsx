import { motion } from 'framer-motion';
import { duration, easeOutExpo } from '../lib/motion';

interface DailyGoalRingProps {
  done: number;
  goal: number;
  size?: number;
  stroke?: number;
}

export default function DailyGoalRing({ done, goal, size = 132, stroke = 8 }: DailyGoalRingProps) {
  const safeGoal = Math.max(1, goal);
  const pct = Math.min(100, (done / safeGoal) * 100);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const reached = done >= safeGoal;
  const ringColor = reached ? '#4f6b4a' : '#7a1f3d';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3d9dd" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: duration.slow, ease: easeOutExpo }}
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="font-serif text-3xl font-semibold leading-none text-wine-deep">
          {Math.min(done, safeGoal)}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">de {safeGoal}</span>
      </div>
    </div>
  );
}
