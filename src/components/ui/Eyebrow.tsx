import type { HTMLAttributes, ReactNode } from 'react';

export default function Eyebrow({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`eyebrow ${className}`} {...rest}>
      {children}
    </div>
  );
}
