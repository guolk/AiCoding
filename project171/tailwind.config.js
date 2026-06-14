/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      }
    },
    extend: {
      colors: {
        terracotta: {
          50: '#FDF6F3',
          100: '#FBEBE5',
          200: '#F5D4C7',
          300: '#EDB6A0',
          400: '#E07A5F',
          500: '#D46347',
          600: '#B84D33',
          700: '#973E2A',
          800: '#7A3323',
          900: '#632B1E',
        },
        forest: {
          50: '#F4F4F6',
          100: '#E8E8ED',
          200: '#D0D1DB',
          300: '#A9ABB9',
          400: '#7C7E92',
          500: '#3D405B',
          600: '#34374E',
          700: '#2C2E42',
          800: '#252737',
          900: '#1F202E',
        },
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F2',
          200: '#F4F1DE',
          300: '#E8E3C9',
          400: '#D9D2B0',
          500: '#C7BE94',
          600: '#A89E78',
          700: '#877E60',
          800: '#6B644D',
          900: '#57513F',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Source Sans Pro"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(61, 64, 91, 0.08)',
        'card': '0 8px 30px rgba(61, 64, 91, 0.12)',
        'hover': '0 12px 40px rgba(224, 122, 95, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'bounce-soft': 'bounceSoft 2s infinite',
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
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
};
