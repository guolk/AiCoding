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
          50: "#FDF6F3",
          100: "#FAECE6",
          200: "#F4D5C9",
          300: "#EDBDAC",
          400: "#E8B4A0",
          500: "#D99B87",
          600: "#C47D65",
          700: "#A8644E",
          800: "#8B4E3B",
          900: "#6B3A2D",
        },
        accent: {
          50: "#F5E8EA",
          100: "#E8C5CB",
          200: "#D99CA5",
          300: "#C9727F",
          400: "#8B2635",
          500: "#721F2C",
          600: "#5A1923",
          700: "#42121A",
          800: "#2B0C12",
          900: "#150609",
        },
        champagne: {
          50: "#FBF7EB",
          100: "#F6EDD0",
          200: "#EDDC9E",
          300: "#E4CA6C",
          400: "#D4AF37",
          500: "#B8962E",
          600: "#937825",
          700: "#6E5A1C",
          800: "#493C12",
          900: "#251E09",
        },
        ivory: "#FFF8F0",
        warmGray: {
          50: "#FAF8F6",
          100: "#F2EFEB",
          200: "#E6E1DB",
          300: "#D3CCC3",
          400: "#B8AEA1",
          500: "#9C9080",
          600: "#7A6E60",
          700: "#5F554A",
          800: "#433C34",
          900: "#2B2621",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ['"Lato"', "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(139, 38, 53, 0.08)",
        cardHover: "0 8px 30px -4px rgba(139, 38, 53, 0.15)",
        soft: "0 2px 10px rgba(232, 180, 160, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "bounce-soft": "bounceSoft 2s infinite",
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
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};
