/** @type {import('tailwindcss').Config */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        base: {
          900: "#0F1923",
          800: "#1A2332",
          700: "#243447",
          600: "#2D4059",
          500: "#3A5068",
        },
        neon: {
          green: "#00FF88",
          blue: "#4A9EFF",
          orange: "#FF6B35",
          red: "#FF3B5C",
          yellow: "#FFD93D",
          purple: "#B47AFF",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Noto Sans SC", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 10px rgba(0, 255, 136, 0.3), 0 0 20px rgba(0, 255, 136, 0.1)",
        "neon-strong": "0 0 15px rgba(0, 255, 136, 0.5), 0 0 30px rgba(0, 255, 136, 0.2)",
        "neon-blue": "0 0 10px rgba(74, 158, 255, 0.3), 0 0 20px rgba(74, 158, 255, 0.1)",
        "neon-orange": "0 0 10px rgba(255, 107, 53, 0.3), 0 0 20px rgba(255, 107, 53, 0.1)",
        "neon-red": "0 0 10px rgba(255, 59, 92, 0.3), 0 0 20px rgba(255, 59, 92, 0.1)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "20px 20px",
      },
      animation: {
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
      },
      keyframes: {
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(0, 255, 136, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 255, 136, 0.6)" },
        },
        glow: {
          "0%": { opacity: "0.7" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
