import type { HTMLAttributes, ReactNode } from 'react';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  band?: boolean;
  children: ReactNode;
}

export default function Section({
  band = false,
  className = '',
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      className={`${band ? 'bg-band' : 'bg-paper'} ${className}`}
      {...rest}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 sm:py-20 lg:px-20">
        {children}
      </div>
    </section>
  );
}
