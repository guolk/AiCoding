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
        'n5-green': '#27ae60',
        'n4-blue': '#2980b9',
        'n3-purple': '#8e44ad',
        'n2-amber': '#e67e22',
        'n1-crimson': '#c0392b',
        'ink': '#1a1a2e',
        'ink-light': '#2d2d4a',
        'vermillion': '#c0392b',
        'vermillion-dark': '#96281b',
        'warm-white': '#faf3e0',
        'pale-gold': '#d4a574',
        'sakura': '#ffc0cb',
        'wave': '#4a90d9',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
