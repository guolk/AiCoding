/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF8E7",
          100: "#FFEFCB",
          200: "#FFDF97",
          300: "#FFCF63",
          400: "#FFBF2F",
          500: "#FF9F1C",
          600: "#E07C00",
          700: "#AD6000",
          800: "#7A4400",
          900: "#472800",
        },
        secondary: {
          50: "#E8F7F6",
          100: "#CFF0ED",
          200: "#9FE1DB",
          300: "#6FD2C9",
          400: "#3FC3B7",
          500: "#2EC4B6",
          600: "#26A397",
          700: "#1E8278",
          800: "#166159",
          900: "#0E403A",
        },
        accent: {
          50: "#FFF0F0",
          100: "#FFDEDE",
          200: "#FFBDBD",
          300: "#FF9C9C",
          400: "#FF7B7B",
          500: "#FF6B6B",
          600: "#E04D4D",
          700: "#B33C3C",
          800: "#862B2B",
          900: "#591A1A",
        },
        neutral: {
          50: "#FFF9F0",
          100: "#FFF2E0",
          200: "#F5E6D3",
          300: "#E6D5C3",
          400: "#B8A89A",
          500: "#8A7B6E",
          600: "#5C4F44",
          700: "#3A535C",
          800: "#1A535C",
          900: "#0F3238",
        },
      },
      fontFamily: {
        display: ['"Fredoka One"', "cursive"],
        body: ['"Quicksand"', "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(26, 83, 92, 0.08)",
        "card-hover": "0 8px 30px rgba(26, 83, 92, 0.12)",
        glow: "0 0 20px rgba(255, 159, 28, 0.3)",
        "glow-secondary": "0 0 20px rgba(46, 196, 182, 0.3)",
      },
      animation: {
        "float-slow": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "bounce-slow": "bounce 2s infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        confetti: "confetti 1s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(255, 159, 28, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(255, 159, 28, 0.6)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        confetti: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100px) rotate(720deg)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
