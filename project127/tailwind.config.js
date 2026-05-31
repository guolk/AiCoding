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
        'dark-bg': '#1a1f35',
        'dark-card': '#2a2f4a',
        'dark-border': '#3a3f5a',
        'gold': '#d4af37',
        'copper': '#c77800',
        'magic-cyan': '#4a8f9e',
        'tech-purple': '#8b5cf6',
      },
      fontFamily: {
        'display': ['"Cinzel"', 'serif'],
        'body': ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
