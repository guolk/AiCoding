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
          50: '#E8EEF5',
          100: '#C5D4E5',
          200: '#9FB5CF',
          300: '#7A96B8',
          400: '#5577A2',
          500: '#1E3A5F',
          600: '#193151',
          700: '#142843',
          800: '#0F1F35',
          900: '#0A1627',
        },
        wood: {
          50: '#FAF4ED',
          100: '#F3E7D8',
          200: '#E8D0B0',
          300: '#DEB989',
          400: '#D4A262',
          500: '#D4A574',
          600: '#B8895A',
          700: '#9C6D41',
          800: '#805127',
          900: '#64350E',
        },
        coral: {
          50: '#FFF0F0',
          100: '#FFD9D9',
          200: '#FFB3B3',
          300: '#FF8C8C',
          400: '#FF6B6B',
          500: '#FF6B6B',
          600: '#E65050',
          700: '#CC3535',
          800: '#B31A1A',
          900: '#990000',
        },
        mint: {
          50: '#E8FAF8',
          100: '#C1F1EC',
          200: '#9AE8DF',
          300: '#73DFD3',
          400: '#4ECDC4',
          500: '#4ECDC4',
          600: '#3FB5AD',
          700: '#309E96',
          800: '#21867F',
          900: '#126F68',
        },
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F5',
          200: '#F5F0E8',
          300: '#F0E8DB',
          400: '#EBE0CE',
          500: '#FAF8F5',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
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
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
