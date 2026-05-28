/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brown-900': '#3E2723',
        'brown-800': '#4E342E',
        'brown-700': '#5D4037',
        'brown-600': '#6D4C41',
        'brown-500': '#795548',
        'brown-400': '#8D6E63',
        'brown-300': '#A1887F',
        'brown-200': '#BCAAA4',
        'brown-100': '#D7CCC8',
        'warm-beige': '#F5F1EB',
        'antique-white': '#FDF8F3',
        'gold-accent': '#D4AF37',
      },
      fontFamily: {
        'song': ['"Noto Serif SC"', 'serif'],
        'sans': ['"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
