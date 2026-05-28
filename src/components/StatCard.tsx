interface Stat {
  label: string;
  value: string;
}

interface StatCardProps {
  stats: Stat[];
  footer?: string;
}

export default function StatCard({ stats, footer }: StatCardProps) {
  return (
    <div className="card p-7">
      <div className="grid grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-display text-[40px] leading-none text-ink">{s.value}</div>
            <div className="mt-2 font-display text-[11px] uppercase tracking-[0.2em] text-mute">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      {footer && (
        <p className="mt-5 border-t border-line pt-4 font-body text-sm italic leading-relaxed text-mute">
          {footer}
        </p>
      )}
    </div>
  );
}
