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
          DEFAULT: '#0D7377',
          light: '#14A3A8',
          dark: '#095556',
          50: '#E6F5F5',
          100: '#B3E0E1',
          200: '#80CBCD',
        },
        accent: {
          DEFAULT: '#FF6B35',
          light: '#FF8F66',
          dark: '#E55A25',
        },
      },
    },
  },
  plugins: [],
};
