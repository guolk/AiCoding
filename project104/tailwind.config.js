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
          50: '#FFF5F2',
          100: '#FFE8E0',
          200: '#FFD4C6',
          300: '#FFB8A1',
          400: '#FF8F6B',
          500: '#FF6B35',
          600: '#E65119',
          700: '#C43F0D',
          800: '#A1340B',
          900: '#7D2909',
        },
        secondary: {
          50: '#E8ECF4',
          100: '#B9C3D7',
          200: '#8A9ABA',
          300: '#5B719D',
          400: '#365084',
          500: '#1A365D',
          600: '#172F54',
          700: '#15294B',
          800: '#122342',
          900: '#0E1E39',
        },
        warm: {
          50: '#FFFBF7',
          100: '#FFF8F0',
          200: '#FFF1E1',
          300: '#FFE7CC',
          400: '#FFD9A8',
          500: '#FFCB85',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Source Sans Pro"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
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
        }
      }
    },
  },
  plugins: [],
};
