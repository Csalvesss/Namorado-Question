import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import IconChip from './ui/IconChip';

interface CourseCardProps {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
  questionCount: number;
  topicCount: number;
  accuracy?: number | null;
  number?: number;
  isLastSeen?: boolean;
}

export default function CourseCard({
  to,
  title,
  description,
  icon,
  questionCount,
  topicCount,
  accuracy,
  number,
  isLastSeen,
}: CourseCardProps) {
  return (
    <Link
      to={to}
      className={`group relative block overflow-hidden rounded-3xl border p-7 transition hover:-translate-y-0.5 active:scale-[0.99] ${
        isLastSeen
          ? 'bg-blush border-[var(--blush-stroke)] shadow-lift'
          : 'border-line bg-card shadow-soft hover:shadow-lift'
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <IconChip icon={icon} tone={isLastSeen ? 'wine' : 'blush'} />
        {isLastSeen ? (
          <span className="rounded-full bg-blush/80 px-3 py-1 font-display text-[10px] italic uppercase tracking-[0.22em] text-wine">
            último visto
          </span>
        ) : number ? (
          <span className="font-display text-[10px] italic uppercase tracking-[0.22em] text-gold">
            no. {String(number).padStart(2, '0')}
          </span>
        ) : null}
      </div>

      <h3 className="font-display text-[28px] italic leading-tight text-ink">
        {title}
      </h3>

      <p className="mt-3 font-body text-[15px] leading-relaxed text-txt/85">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 font-display text-[11px] uppercase tracking-[0.2em] text-mute">
        <span>· {questionCount} questões</span>
        <span>· {topicCount} tópicos</span>
        {accuracy !== null && accuracy !== undefined && (
          <span>· {accuracy}% acerto</span>
        )}
      </div>
    </Link>
  );
}
