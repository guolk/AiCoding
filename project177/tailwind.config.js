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
        racing: {
          green: "#00d26a",
          "green-dark": "#00a855",
          "green-light": "#33db88",
          orange: "#ff6b35",
          "orange-dark": "#e55a2b",
        },
        dark: {
          950: "#0a0a0a",
          900: "#111111",
          850: "#151515",
          800: "#1a1a1a",
          750: "#1f1f1f",
          700: "#262626",
          600: "#333333",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 210, 106, 0.3)",
        "glow-sm": "0 0 10px rgba(0, 210, 106, 0.2)",
        "glow-orange": "0 0 20px rgba(255, 107, 53, 0.3)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 210, 106, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(0, 210, 106, 0.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
