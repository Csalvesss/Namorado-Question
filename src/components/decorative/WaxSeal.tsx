interface Props {
  size?: number;
  label?: string;
  motto?: string;
}

export default function WaxSeal({ size = 80, label = 'GUAVA', motto = 'ad astra' }: Props) {
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-wine-deep via-wine to-wine-deep text-rose-soft shadow-wine"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div className="absolute inset-1.5 rounded-full border border-rose-soft/30" />
      <div className="flex flex-col items-center text-center">
        <span className="font-serif text-[10px] italic leading-none opacity-80">{motto}</span>
        <span className="mt-1 font-serif text-[9px] uppercase tracking-[0.32em]">{label}</span>
      </div>
    </div>
  );
}
