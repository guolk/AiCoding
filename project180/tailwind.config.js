/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        ink: {
          50: '#F5F0E8',
          100: '#E8DFD1',
          200: '#CFC4B0',
          900: '#1B2A4A',
          950: '#0F1A2E',
        },
        gold: {
          50: '#FDF8EC',
          100: '#F8EDC8',
          400: '#E6BF5E',
          500: '#D4A843',
          600: '#B98E2E',
          700: '#9A7225',
        },
        pro: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#2E7D32',
          600: '#256429',
        },
        con: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          500: '#C62828',
          600: '#A71F1F',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 24px -8px rgba(27, 42, 74, 0.12)',
        'card-hover': '0 12px 36px -12px rgba(27, 42, 74, 0.20)',
        'ink': '0 8px 32px -8px rgba(27, 42, 74, 0.25)',
      },
      backgroundImage: {
        'paper-grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
