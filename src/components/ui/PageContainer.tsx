import type { HTMLAttributes, ReactNode } from 'react';

interface PageContainerProps extends HTMLAttributes<HTMLElement> {
  band?: boolean;
  /** controla a largura máxima — default 5xl é seguro pra a maioria das telas. */
  width?: 'md' | 'lg' | 'xl' | '2xl';
  children: ReactNode;
}

const widths = {
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  '2xl': 'max-w-6xl',
};

/**
 * Wrapper padrão de página — bg-paper (ou band) + container centrado com
 * padding editorial. Use em qualquer tela que renderiza dentro do Layout.
 */
export default function PageContainer({
  band = false,
  width = 'xl',
  className = '',
  children,
  ...rest
}: PageContainerProps) {
  return (
    <section className={`${band ? 'bg-band' : 'bg-paper'} ${className}`} {...rest}>
      <div className={`mx-auto w-full ${widths[width]} px-6 py-12 sm:px-10 sm:py-16 lg:px-20`}>
        {children}
      </div>
    </section>
  );
}
