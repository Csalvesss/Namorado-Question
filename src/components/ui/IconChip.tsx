import type { LucideIcon } from 'lucide-react';

type Tone = 'blush' | 'wine' | 'white';
type Size = 'sm' | 'md' | 'lg';

interface IconChipProps {
  icon: LucideIcon;
  tone?: Tone;
  size?: Size;
  className?: string;
}

const tones: Record<Tone, string> = {
  blush: 'bg-blush text-wine',
  wine: 'bg-wine text-[#FBEFEC]',
  white: 'bg-white/10 text-blush',
};

const sizes: Record<Size, { box: string; icon: number }> = {
  sm: { box: 'h-9 w-9 rounded-xl', icon: 16 },
  md: { box: 'h-11 w-11 rounded-2xl', icon: 18 },
  lg: { box: 'h-14 w-14 rounded-2xl', icon: 22 },
};

export default function IconChip({
  icon: Icon,
  tone = 'blush',
  size = 'md',
  className = '',
}: IconChipProps) {
  const s = sizes[size];
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center ${s.box} ${tones[tone]} ${className}`}
    >
      <Icon size={s.icon} strokeWidth={1.5} />
    </span>
  );
}
