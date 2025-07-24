/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Open Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#7c3aed', // blue-violet
          light: '#a78bfa',
          dark: '#5b21b6',
        },
        secondary: {
          DEFAULT: '#14b8a6', // teal
          light: '#5eead4',
          dark: '#0f766e',
        },
        accent: {
          DEFAULT: '#f59e42', // warm amber
          light: '#fbbf24',
          dark: '#b45309',
        },
        background: {
          DEFAULT: '#f6f7fb', // soft off-white
          light: '#ffffff',
          dark: '#e0e7ef',
        },
        muted: {
          DEFAULT: '#e5e7eb', // for borders, subtle backgrounds
        },
        success: {
          DEFAULT: '#22c55e',
        },
        warning: {
          DEFAULT: '#fbbf24',
        },
        danger: {
          DEFAULT: '#ef4444',
        },
      },
      borderRadius: {
        DEFAULT: '0.75rem', // rounded-lg
        lg: '1.25rem', // extra rounded
        xl: '2rem',
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(124,58,237,0.08)', // subtle violet shadow
        modal: '0 8px 32px 0 rgba(20,184,166,0.12)', // subtle teal shadow
      },
    },
  },
  plugins: [],
};
