import { Heart } from 'lucide-react';

interface FeedbackCardProps {
  isRight: boolean;
  phrase: string;
  correctLetter: string;
  explanation: string;
  mode: 'namorado' | 'doutora' | 'irmao';
}

export default function FeedbackCard({
  isRight,
  phrase,
  correctLetter,
  explanation,
  mode,
}: FeedbackCardProps) {
  const isNamorado = mode === 'namorado';
  const isIrmao = mode === 'irmao';
  const isAffective = isNamorado || isIrmao;

  return (
    <div
      className={`mt-6 rounded-3xl border p-7 shadow-soft ${
        isAffective
          ? 'bg-blush border-[var(--blush-stroke)]'
          : 'bg-card border-line'
      }`}
    >
      <div className="flex items-center gap-3">
        {isNamorado && (
          <Heart
            className={`h-5 w-5 ${isRight ? 'fill-wine text-wine' : 'text-wine'}`}
            strokeWidth={1.6}
          />
        )}
        <h4
          className={`font-display text-lg italic ${
            isAffective ? 'text-wine' : 'text-ink'
          }`}
        >
          {phrase}
        </h4>
      </div>
      <p className="mt-3 font-body text-[15px] leading-relaxed text-txt/85">
        <strong className="font-display not-italic text-ink">
          Resposta correta: {correctLetter}.
        </strong>{' '}
        {explanation}
      </p>
    </div>
  );
}
