/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
          light: '#FFEDD5',
        },
        secondary: {
          DEFAULT: '#8B1E1E',
          hover: '#731818',
          dark: '#5F1515',
          light: '#FEE2E2',
        },
        gold: {
          DEFAULT: '#D4A017',
          light: '#FEF3C7',
          hover: '#B8860B',
        },
        warm: {
          bg: '#FFF8EE',
          surface: '#FFFFFF',
          subtle: '#FBF4EA',
          hover: '#F6EDE1',
        },
        text: {
          main: '#241A17',
          muted: '#6B625D',
          subtle: '#8C827C',
          inverse: '#FFFFFF',
        },
        border: {
          warm: '#E9DED1',
          subtle: '#F2E8DC',
          strong: '#D1C0AF',
        },
        success: {
          DEFAULT: '#15803D',
          light: '#DCFCE7',
        },
        error: {
          DEFAULT: '#B91C1C',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#B45309',
          light: '#FEF3C7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Rozha One"', 'Cinzel', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      maxWidth: {
        'container': '1280px',
      },
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgba(36, 26, 23, 0.05)',
        'warm-md': '0 4px 6px -1px rgba(36, 26, 23, 0.07), 0 2px 4px -2px rgba(36, 26, 23, 0.05)',
        'warm-lg': '0 10px 15px -3px rgba(36, 26, 23, 0.08), 0 4px 6px -4px rgba(36, 26, 23, 0.04)',
        'festive': '0 10px 25px -5px rgba(249, 115, 22, 0.15), 0 8px 10px -6px rgba(139, 30, 30, 0.08)',
      },
      borderRadius: {
        'card': '12px',
        'modal': '16px',
        'button': '8px',
      },
    },
  },
  plugins: [],
}
