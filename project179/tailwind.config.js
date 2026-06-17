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
        forest: {
          50: '#f0f9f4',
          100: '#dcf2e6',
          200: '#bbe5ce',
          300: '#8dd1ae',
          400: '#58b386',
          500: '#2D6A4F',
          600: '#275c44',
          700: '#204b37',
          800: '#1a3c2d',
          900: '#132d22',
        },
        earth: {
          50: '#fbf8f5',
          100: '#f3ece4',
          200: '#e6d7c7',
          300: '#d4bda4',
          400: '#be9d7e',
          500: '#8B7355',
          600: '#7a644a',
          700: '#66523d',
          800: '#524131',
          900: '#3d3025',
        },
        lake: {
          50: '#f0f9f6',
          100: '#d9f0e7',
          200: '#b7e1d1',
          300: '#86cbb1',
          400: '#58af8e',
          500: '#40916C',
          600: '#357a5a',
          700: '#2b6149',
          800: '#234e3b',
          900: '#183528',
        },
        sun: {
          50: '#fefbf5',
          100: '#fcf4e4',
          200: '#f8e7c6',
          300: '#f2d59e',
          400: '#e8bb6e',
          500: '#D4A373',
          600: '#c18e5b',
          700: '#a07147',
          800: '#7f593a',
          900: '#5a3d28',
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(45, 106, 79, 0.08)',
        'card-hover': '0 8px 24px rgba(45, 106, 79, 0.15)',
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
