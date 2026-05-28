import type { HTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'highlight' | 'wine';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  default: 'border border-line bg-card shadow-soft',
  highlight: 'bg-blush shadow-lift border border-[var(--blush-stroke)]',
  wine: 'bg-wine text-[#FBEFEC] shadow-lift border border-wine',
};

export default function Card({
  variant = 'default',
  className = '',
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-3xl ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
