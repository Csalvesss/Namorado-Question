import { Heart } from 'lucide-react';

interface NoteCardProps {
  body: string;
  timeLabel: string;
  signature: string;
  highlighted?: boolean;
  onClick?: () => void;
}

export default function NoteCard({
  body,
  timeLabel,
  signature,
  highlighted = false,
  onClick,
}: NoteCardProps) {
  const cardClass = highlighted
    ? 'bg-blush border-[var(--blush-stroke)] shadow-lift'
    : 'bg-card border-line shadow-soft';

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-3xl border p-7 text-left transition ${
        onClick ? 'hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.99]' : ''
      } ${cardClass}`}
    >
      <div className="mx-auto mb-5 h-2 w-24 rounded-full bg-blush" />
      <div className="mx-auto -mt-7 mb-5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-card text-wine">
        <Heart className="h-4 w-4" strokeWidth={1.6} />
      </div>

      <p className="font-body text-[17px] italic leading-relaxed text-txt">
        &ldquo;{body}&rdquo;
      </p>

      <div className="mt-6 flex items-end justify-between gap-4">
        <span className="font-display text-[11px] uppercase tracking-[0.22em] text-mute">
          {timeLabel}
        </span>
        <span className="font-display text-base italic text-rose">— {signature}</span>
      </div>
    </Wrapper>
  );
}
