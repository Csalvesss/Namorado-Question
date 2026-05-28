import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'ghost';
type Size = 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const base =
  'inline-flex min-h-touch items-center justify-center gap-2 rounded-full font-display italic transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

const variants: Record<Variant, string> = {
  primary:
    'bg-wine text-[#FBEFEC] shadow-wine hover:bg-[#5A0F22] hover:shadow-wine-hover',
  ghost:
    'border border-wine/45 text-wine hover:bg-blush',
};

const sizes: Record<Size, string> = {
  md: 'px-7 py-3 text-[15px]',
  sm: 'px-5 py-2 text-sm',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
