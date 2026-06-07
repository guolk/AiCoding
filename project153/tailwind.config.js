/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        primary: {
          50: '#FDF6E9',
          100: '#F5E6D3',
          200: '#E8D0B3',
          300: '#D4B896',
          400: '#B8956E',
          500: '#8B6914',
          600: '#6D4C41',
          700: '#5D4037',
          800: '#4E342E',
          900: '#3E2723',
        },
        accent: {
          gold: '#B8860B',
          bronze: '#CD7F32',
          teal: '#5F9EA0',
          jade: '#00A86B',
        },
        paper: {
          light: '#FDF6E9',
          DEFAULT: '#F5EFE0',
          dark: '#E8DFC8',
        },
        ink: {
          light: '#6D4C41',
          DEFAULT: '#5D4037',
          dark: '#3E2723',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'scroll': '0 4px 20px -2px rgba(93, 64, 55, 0.15)',
        'card': '0 2px 12px -1px rgba(93, 64, 55, 0.1)',
        'card-hover': '0 8px 30px -4px rgba(93, 64, 55, 0.2)',
        'inner-gold': 'inset 0 1px 0 0 rgba(184, 134, 11, 0.3)',
      },
      backgroundImage: {
        'paper-texture': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        'gradient-gold': 'linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #B8860B 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-up': 'fadeUp 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
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
