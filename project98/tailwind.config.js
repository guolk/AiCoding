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
        primary: {
          50: '#e8f0fe',
          100: '#d0e3fd',
          200: '#a7c7fb',
          300: '#7baaf9',
          400: '#508df7',
          500: '#3172f6',
          600: '#1e3a5f',
          700: '#152a45',
          800: '#0d1d30',
          900: '#071020',
        },
        gold: {
          50: '#fdf8e8',
          100: '#faefc3',
          200: '#f5de8a',
          300: '#f0c94c',
          400: '#ebaf22',
          500: '#c9a227',
          600: '#a8861f',
          700: '#866b1a',
          800: '#6a5618',
          900: '#564716',
        },
      },
    },
  },
  plugins: [],
};
