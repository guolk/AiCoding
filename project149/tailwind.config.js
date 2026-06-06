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
          50: '#f0f4f2',
          100: '#d9e3de',
          200: '#b3c7bd',
          300: '#8caa9c',
          400: '#668e7b',
          500: '#2D4A3E',
          600: '#243a31',
          700: '#1b2b25',
          800: '#121d19',
          900: '#090e0c',
        },
        gold: {
          50: '#fdf8f3',
          100: '#f9ecd9',
          200: '#f3d9b3',
          300: '#edc68d',
          400: '#e0a574',
          500: '#D4A574',
          600: '#b88e5e',
          700: '#8a6b47',
          800: '#5c472f',
          900: '#2e2418',
        },
        coral: {
          50: '#fef6f3',
          100: '#fce7df',
          200: '#f9cfbf',
          300: '#f5b79f',
          400: '#ea8a7a',
          500: '#E07A5F',
          600: '#c96a50',
          700: '#a8533d',
          800: '#7a3c2c',
          900: '#4a251a',
        },
        cream: '#F8F5F0',
        charcoal: '#1A1A1A',
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
