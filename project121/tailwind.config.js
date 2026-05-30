/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        burgundy: {
          50: "#FAF0F0",
          100: "#F2D5D5",
          200: "#E4ABAB",
          300: "#D57D7D",
          400: "#C75454",
          500: "#A83C3C",
          600: "#8B3030",
          700: "#6B2E2E",
          800: "#502424",
          900: "#361818",
        },
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#D4AF37",
          600: "#B8941D",
          700: "#92400E",
          800: "#78350F",
          900: "#451A03",
        },
        parchment: {
          50: "#FEFDFC",
          100: "#FAF7F2",
          200: "#F3ECE1",
          300: "#E7DCC8",
          400: "#D9C9A8",
          500: "#CAB588",
          600: "#B89D64",
          700: "#9A7D4B",
          800: "#7C623D",
          900: "#544329",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Lato", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
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
      },
      boxShadow: {
        elegant: "0 4px 20px -2px rgba(107, 46, 46, 0.15)",
        gold: "0 4px 20px -2px rgba(212, 175, 55, 0.25)",
      },
    },
  },
  plugins: [],
};
