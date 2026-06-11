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
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#95D5B2',
          400: '#4ade80',
          500: '#2D6A4F',
          600: '#1B4332',
          700: '#14532d',
          800: '#0f3d20',
          900: '#052e16',
        },
        amber: {
          50: '#FEFAE0',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#D4A373',
          400: '#B8860B',
          500: '#92400E',
        },
        brown: {
          700: '#5C4033',
          800: '#3E2723',
        },
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
