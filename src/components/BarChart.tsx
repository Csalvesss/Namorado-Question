interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  highlightThreshold?: number;
  maxValue?: number;
}

export default function BarChart({
  data,
  highlightThreshold = 28,
  maxValue = 100,
}: BarChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(maxValue, ...data.map((d) => d.value));

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end justify-around gap-3 px-4" style={{ minHeight: 200 }}>
        {data.map((d, i) => {
          const h = max > 0 ? Math.max(8, Math.round((d.value / max) * 180)) : 0;
          const highlighted = d.value >= highlightThreshold;
          return (
            <div key={`${d.label}-${i}`} className="flex flex-col items-center gap-2">
              <div className="font-display text-[11px] uppercase tracking-[0.18em] text-mute">
                {d.value}%
              </div>
              <div
                className={`w-9 rounded-t-[10px] transition-all ${
                  highlighted ? 'bg-wine' : 'bg-rose'
                }`}
                style={{ height: h }}
              />
              <div className="font-display text-[10px] uppercase tracking-[0.2em] text-mute">
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
