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
          50: '#f0f9f0',
          100: '#dbf3dc',
          200: '#b9e7bb',
          300: '#86d48b',
          400: '#4ebd56',
          500: '#2E7D32',
          600: '#256429',
          700: '#1f5023',
          800: '#1b401e',
          900: '#17351a',
        },
        accent: {
          50: '#fff8e6',
          100: '#ffedbf',
          200: '#ffdf80',
          300: '#ffd140',
          400: '#ffc200',
          500: '#FF8F00',
          600: '#e67300',
          700: '#b35900',
          800: '#804000',
          900: '#4d2600',
        },
        background: {
          DEFAULT: '#F8F9F5',
          dark: '#1a1a2e',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
