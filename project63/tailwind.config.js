/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#0a0a1a',
          800: '#1a1a3a',
          700: '#2a2a5a',
          600: '#3a3a7a',
          500: '#4a4a9a',
        },
        star: {
          yellow: '#ffd700',
          white: '#ffffff',
          blue: '#87ceeb',
          orange: '#ffa500',
        }
      }
    },
  },
  plugins: [],
}
