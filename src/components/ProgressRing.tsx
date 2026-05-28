interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  value,
  max,
  size = 96,
  label,
  sublabel,
}: ProgressRingProps) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const deg = Math.round(pct * 360);

  return (
    <div className="flex items-center gap-5">
      <div
        className="relative shrink-0 rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(var(--wine) ${deg}deg, var(--blush) ${deg}deg)`,
        }}
      >
        <div
          className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-card"
        >
          <span className="font-display text-2xl italic leading-none text-ink">
            {label ?? max}
          </span>
          <span className="mt-0.5 font-display text-[9px] uppercase tracking-[0.2em] text-mute">
            {sublabel ?? '/dia'}
          </span>
        </div>
      </div>
    </div>
  );
}
