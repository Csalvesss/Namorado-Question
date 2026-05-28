type Status = 'done' | 'in-progress' | 'todo';

interface TopicRowProps {
  number: number;
  title: string;
  questionCount: number;
  status: Status;
}

const STATUS_LABEL: Record<Status, string> = {
  done: 'concluído',
  'in-progress': 'em andamento',
  todo: 'a fazer',
};

const STATUS_TONE: Record<Status, string> = {
  done: 'text-mute',
  'in-progress': 'text-wine',
  todo: 'text-mute/70',
};

export default function TopicRow({ number, title, questionCount, status }: TopicRowProps) {
  const numberClass =
    status === 'done'
      ? 'bg-wine text-[#FBEFEC]'
      : status === 'in-progress'
        ? 'bg-blush text-wine'
        : 'border border-line bg-card text-mute';

  return (
    <div className="flex items-center gap-5 border-b border-line/70 py-5 last:border-b-0">
      <span
        aria-hidden
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm italic ${numberClass}`}
      >
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg italic text-ink">{title}</h3>
        <p className="mt-0.5 font-body text-[13px] italic text-mute">
          {questionCount} {questionCount === 1 ? 'questão' : 'questões'}
        </p>
      </div>
      <span
        className={`font-display text-[11px] uppercase tracking-[0.2em] ${STATUS_TONE[status]}`}
      >
        {STATUS_LABEL[status]}
      </span>
    </div>
  );
}
