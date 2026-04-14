/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#FAF9F6',
        b1: '#E5DFD5',
        b2: '#C8C0B5',
        t1: '#1C1A18',
        t2: '#6B6460',
        t3: '#A8A49F',
        red: {
          800: '#8B1A1A',
          50: '#F7EEEE',
          400: '#C44040',
        },
        ok: {
          DEFAULT: '#2A6049',
          50: '#EBF5EF',
          100: '#A8D5BC',
        },
        warn: {
          DEFAULT: '#C44B1A',
          50: '#FDF0E8',
          100: '#F0C4A8',
        },
        gold: {
          DEFAULT: '#7A6200',
          50: '#FFFBF0',
          100: '#E8D98A',
        },
        blue: {
          DEFAULT: '#1A4A8B',
          50: '#EEF3FA',
          100: '#B0C8E8',
        },
        pur: {
          DEFAULT: '#5A1A8B',
          50: '#F3EEFD',
          100: '#C8B0E8',
        },
        teal: {
          DEFAULT: '#0D6B6B',
          50: '#E8F6F6',
          100: '#7ECECE',
        },
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'on-surface': 'var(--color-on-surface)',
      },
      fontFamily: {
        sans: ['Sarabun', 'sans-serif'],
        serif: ['Bebas Neue', 'Sarabun', 'sans-serif'],
        display: ['Bebas Neue', 'Sarabun', 'sans-serif'],
      },
      borderRadius: {
        'xl': 'var(--radius-xl)',
        'lg': 'var(--radius-lg)',
        'md': 'var(--radius-md)',
        'sm': 'var(--radius-sm)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-up': 'fadeUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
