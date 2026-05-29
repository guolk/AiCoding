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
        "wood-brown": {
          50: "#F9F5F3",
          100: "#F1E7E2",
          200: "#E2CFC6",
          300: "#D0B1A3",
          400: "#BE9380",
          500: "#A67B67",
          600: "#8D6451",
          700: "#744D3C",
          800: "#5D4037",
          900: "#4A332C",
          950: "#3D2923",
        },
        ivory: {
          50: "#FFFFFA",
          100: "#FEFEF7",
          200: "#FCFBEF",
          300: "#FAF7E3",
          400: "#F7F3D7",
          500: "#F5F5DC",
          600: "#E6E5C8",
          700: "#C9C8AD",
          800: "#ABAA92",
          900: "#8D8C77",
          950: "#6B6A58",
        },
        gold: {
          50: "#FFFDF0",
          100: "#FFFACC",
          200: "#FFF399",
          300: "#FFE966",
          400: "#FFE033",
          500: "#FFD700",
          600: "#CCAC00",
          700: "#998100",
          800: "#665600",
          900: "#332B00",
          950: "#1A1600",
        },
        "light-square": "#F0D9B5",
        "dark-square": "#B58863",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ['"Noto Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
