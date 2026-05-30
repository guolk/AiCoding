/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e8e8f0",
          100: "#c1c1d6",
          200: "#9a9abc",
          300: "#7373a2",
          400: "#4a4a88",
          500: "#1a1a40",
          600: "#151533",
          700: "#101026",
          800: "#0b0b19",
          900: "#06060d",
        },
        accent: {
          50: "#faf4ed",
          100: "#f1e2d1",
          200: "#e7cfb5",
          300: "#debd99",
          400: "#d4aa7d",
          500: "#d4a574",
          600: "#c48b5a",
          700: "#a87245",
          800: "#8b5a30",
          900: "#6e411b",
        },
        surface: {
          50: "#2a2a2a",
          100: "#252525",
          200: "#1f1f1f",
          300: "#1a1a1a",
          400: "#151515",
          500: "#121212",
          600: "#0f0f0f",
          700: "#0c0c0c",
          800: "#090909",
          900: "#060606",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
