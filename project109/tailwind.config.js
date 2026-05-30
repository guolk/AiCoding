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
          50: '#eef4fb',
          100: '#d8e4f3',
          200: '#b5c7e6',
          300: '#8aa2d3',
          400: '#667fc1',
          500: '#4a63af',
          600: '#3a509e',
          700: '#314082',
          800: '#2c376a',
          900: '#1E3A5F',
        },
        accent: {
          50: '#fefae6',
          100: '#fdf2be',
          200: '#fae580',
          300: '#f5d242',
          400: '#e6bd1c',
          500: '#D4AF37',
          600: '#a98428',
          700: '#7e5f21',
          800: '#53401c',
          900: '#332615',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      backgroundImage: {
        'gradient-bg': 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
      },
    },
  },
  plugins: [],
};
