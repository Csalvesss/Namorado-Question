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
        // Novo sistema editorial (PR A)
        display: ['Fraunces', '"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Newsreader', 'Georgia', 'serif'],
        // Mantidos durante a migração
        serif: ['Fraunces', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hand: ['Caveat', '"Cormorant Garamond"', 'cursive'],
      },
      fontSize: {
        display: ['clamp(2.5rem, 6vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        'display-sm': ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        eyebrow: ['0.78125rem', { lineHeight: '1.2', letterSpacing: '0.2em' }],
      },
      colors: {
        // Novo design system editorial
        paper: '#F8EFE9',
        band: '#F4E3DD',
        card: '#FFFFFF',
        ink: '#4A1226',
        txt: '#3D2D2F',
        wine: '#7C1733',
        'wine-deep': '#5A0F22',
        rose: '#C0758B',
        'rose-soft': '#F4E3DD',
        gold: '#B49A82',
        mute: '#8A746F',
        muted: '#8A746F',
        line: '#ECDCD5',
        blush: '#FBE7E3',
        'blush-stroke': '#E6B6B3',

        // Compatibilidade durante a migração
        bg: '#F8EFE9',
        'bg-soft': '#FBE7E3',
        'ink-soft': '#6E4A4A',
        green: '#4f6b4a',
        'green-soft': '#dfe8d8',
        red: '#9a3a3a',
        'red-soft': '#f1d6d6',
      },
      boxShadow: {
        soft: '0 6px 24px rgba(92,15,36,.06)',
        lift: '0 18px 44px rgba(92,15,36,.12)',
        card: '0 6px 24px rgba(92,15,36,.06)',
        'card-hover': '0 18px 44px rgba(92,15,36,.12)',
        wine: '0 6px 22px rgba(124,23,51,.22)',
        'wine-hover': '0 10px 28px rgba(124,23,51,.32)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(124,23,51,0.04)',
      },
      borderRadius: {
        pill: '999px',
      },
      backgroundImage: {
        'paper-soft': 'linear-gradient(160deg, #FFFFFF, #FBE7E3)',
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
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};
