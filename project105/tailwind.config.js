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
        lego: {
          red: "#E3000B",
          yellow: "#FFD500",
          blue: "#0A2463",
          gray: "#3E3E3C",
          cream: "#F5F5F0",
          dark: "#1A1A1A",
          light: "#FAFAFA",
        },
        status: {
          owned: "#10B981",
          building: "#F59E0B",
          completed: "#3B82F6",
          disassembled: "#6B7280",
          wishlist: "#EC4899",
          planning: "#8B5CF6",
          "in-progress": "#F59E0B",
        },
      },
      fontFamily: {
        display: ["Montserrat", "system-ui", "sans-serif"],
        body: ["Roboto", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "lego-sm": "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
        "lego-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        "lego-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        "lego-stud": "inset 0 -3px 0 rgba(0,0,0,0.2)",
      },
      borderRadius: {
        brick: "8px",
      },
      backgroundImage: {
        "gradient-lego": "linear-gradient(135deg, #E3000B 0%, #FFD500 100%)",
        "gradient-blue": "linear-gradient(135deg, #0A2463 0%, #1E3A8A 100%)",
      },
      animation: {
        "bounce-in": "bounceIn 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
