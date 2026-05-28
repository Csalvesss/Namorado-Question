import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import IconChip from './ui/IconChip';

interface ToolCardProps {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
  variant?: 'default' | 'wine';
}

export default function ToolCard({
  to,
  title,
  description,
  icon,
  variant = 'default',
}: ToolCardProps) {
  const isWine = variant === 'wine';
  return (
    <Link
      to={to}
      className={`group relative block overflow-hidden rounded-3xl border p-7 transition hover:-translate-y-0.5 active:scale-[0.99] ${
        isWine
          ? 'bg-wine border-wine text-[#FBEFEC] shadow-lift'
          : 'border-line bg-card shadow-soft hover:shadow-lift'
      }`}
    >
      <IconChip icon={icon} tone={isWine ? 'white' : 'blush'} className="mb-7" />

      <h3
        className={`font-display text-[22px] italic leading-tight ${
          isWine ? 'text-[#FBEFEC]' : 'text-ink'
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-3 font-body text-[15px] leading-relaxed ${
          isWine ? 'text-[#FBEFEC]/85' : 'text-txt/85'
        }`}
      >
        {description}
      </p>
    </Link>
  );
}
