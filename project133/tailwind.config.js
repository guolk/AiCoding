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
          50: '#f0f5fa',
          100: '#d9e4f0',
          200: '#b3c9e1',
          300: '#83a8cd',
          400: '#5384b7',
          500: '#2d65a0',
          600: '#1e4f82',
          700: '#1e3a5f',
          800: '#1a2f4d',
          900: '#14253d',
        },
        accent: {
          mint: '#2dd4bf',
          orange: '#f97316',
        }
      },
      fontFamily: {
        display: ['Lora', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.15s ease-out',
        'grow-up': 'growUp 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        growUp: {
          '0%': { transform: 'scaleY(0)' },
          '100%': { transform: 'scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
};
