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
          50: '#f5f0e8',
          100: '#e8e0d0',
          200: '#d4c8b0',
          300: '#b8a888',
          400: '#9c8868',
          500: '#806848',
          600: '#6b5038',
          700: '#563c28',
          800: '#3d2a1a',
          900: '#1a1a2e',
          950: '#0f0f1e',
        },
        gold: {
          50: '#fdf8ef',
          100: '#f8ecd0',
          200: '#f0d9a0',
          300: '#e5c070',
          400: '#d4a848',
          500: '#c9a96e',
          600: '#a88850',
          700: '#866838',
          800: '#6a5028',
          900: '#503c18',
        },
        crimson: {
          50: '#fdf2f0',
          100: '#f8ddd8',
          200: '#f0bab0',
          300: '#e09080',
          400: '#c86850',
          500: '#8b4513',
          600: '#703810',
          700: '#582c0d',
          800: '#402008',
          900: '#2c1405',
        },
        slate: {
          600: '#6b7b8d',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
