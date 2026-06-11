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
        brand: {
          DEFAULT: '#C41E3A',
          light: '#E8384F',
          dark: '#9A1730',
        },
      },
    },
  },
  plugins: [],
};
