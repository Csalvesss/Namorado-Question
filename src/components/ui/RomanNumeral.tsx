interface RomanNumeralProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-[3.5rem]',
};

export default function RomanNumeral({ value, size = 'md', className = '' }: RomanNumeralProps) {
  return (
    <span
      aria-hidden
      className={`font-display italic font-light leading-none text-rose ${sizes[size]} ${className}`}
    >
      {value}
    </span>
  );
}
