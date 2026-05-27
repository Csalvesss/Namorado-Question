/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '380px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['clamp(2.5rem, 6vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        'display-sm': ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.28em' }],
      },
      colors: {
        bg: '#f8f1ec',
        'bg-soft': '#fdf7f3',
        paper: '#ffffff',
        ink: '#2b1d1a',
        'ink-soft': '#5b4842',
        muted: '#8a7771',
        wine: '#7a1f3d',
        'wine-deep': '#5a1530',
        rose: '#c97b8a',
        'rose-soft': '#f3d9dd',
        gold: '#b8895a',
        green: '#4f6b4a',
        'green-soft': '#dfe8d8',
        red: '#9a3a3a',
        'red-soft': '#f1d6d6',
        line: '#e6d9d2',
      },
      boxShadow: {
        soft: '0 1px 0 rgba(122,31,61,0.04), 0 8px 24px -10px rgba(60,30,30,0.08)',
        card: '0 1px 0 rgba(122,31,61,0.04), 0 12px 32px -12px rgba(60,30,30,0.12)',
        'card-hover': '0 2px 0 rgba(122,31,61,0.06), 0 20px 44px -14px rgba(122,31,61,0.20)',
        wine: '0 4px 18px rgba(122,31,61,0.25)',
        'wine-hover': '0 6px 22px rgba(122,31,61,0.32)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(122,31,61,0.04)',
      },
      backgroundImage: {
        'paper-soft': 'linear-gradient(160deg, #ffffff, #fdf7f3)',
        'paper-grain':
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.4  0 0 0 0 0.35  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};
