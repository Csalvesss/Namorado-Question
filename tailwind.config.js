/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
        soft: '0 1px 2px rgba(60,30,30,0.05), 0 8px 30px rgba(60,30,30,0.06)',
        wine: '0 4px 18px rgba(122,31,61,0.25)',
        'wine-hover': '0 6px 22px rgba(122,31,61,0.32)',
      },
      backgroundImage: {
        'paper-soft': 'linear-gradient(160deg, #ffffff, #fdf7f3)',
      },
    },
  },
  plugins: [],
};
