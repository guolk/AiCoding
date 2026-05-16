/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        mood: {
          happy: '#4ade80',
          excited: '#fbbf24',
          calm: '#60a5fa',
          sad: '#94a3b8',
          angry: '#f87171',
          anxious: '#fb923c',
          grateful: '#34d399',
          tired: '#a78bfa',
        }
      }
    },
  },
  plugins: [],
}
