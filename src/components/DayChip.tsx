interface DayChipProps {
  value: number;
  active: boolean;
  onClick: () => void;
}

export default function DayChip({ value, active, onClick }: DayChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-5 py-2 font-display italic transition active:scale-[0.97] ${
        active
          ? 'border-wine bg-wine text-[#FBEFEC] shadow-wine'
          : 'border-line bg-card text-mute hover:border-wine/40 hover:text-wine'
      }`}
    >
      <span className="text-base">{value}</span>
      <span className="font-display text-[10px] uppercase not-italic tracking-[0.2em]">
        {active ? 'questões/dia' : '/dia'}
      </span>
    </button>
  );
}
