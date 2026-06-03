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
        ink: {
          DEFAULT: '#1A3C34',
          50: '#E8F0EE',
          100: '#C5D9D5',
          200: '#8FB3AB',
          300: '#598D81',
          400: '#2D5E52',
          500: '#1A3C34',
          600: '#15312A',
          700: '#102620',
          800: '#0B1B16',
          900: '#06100C',
        },
        gold: {
          DEFAULT: '#D4A853',
          50: '#FBF5E8',
          100: '#F5E5BF',
          200: '#EDD196',
          300: '#E5BD6D',
          400: '#DCA944',
          500: '#D4A853',
          600: '#C4922A',
          700: '#9A7321',
          800: '#705518',
          900: '#46360F',
        },
        ivory: '#FAF7F0',
        sand: '#E8E4DC',
        crimson: '#8B2D2D',
      },
      fontFamily: {
        display: ['Playfair Display', 'Noto Serif SC', 'Georgia', 'serif'],
        body: ['Source Sans 3', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'count-up': 'countUp 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};
