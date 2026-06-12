/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: '#E8ECF2',
          100: '#C5CDE0',
          200: '#8B9BC1',
          300: '#5169A2',
          400: '#2D4780',
          500: '#1B2A4A',
          600: '#162240',
          700: '#111A33',
          800: '#0C1226',
          900: '#070A19',
        },
        accent: {
          50: '#FFF3ED',
          100: '#FFE0CC',
          200: '#FFC199',
          300: '#FFA266',
          400: '#FF8333',
          500: '#FF6B35',
          600: '#E55A22',
          700: '#BF4515',
          800: '#993510',
          900: '#73280C',
        },
        surface: {
          DEFAULT: '#F0F2F5',
          dark: '#0F1629',
          card: '#FFFFFF',
          'card-dark': '#1A2342',
          hover: '#E5E8ED',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
