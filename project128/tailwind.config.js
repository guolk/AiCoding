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
        gold: {
          50: '#FEFAF0',
          100: '#FDF5E6',
          200: '#F5E6C8',
          300: '#E8D5A3',
          400: '#D4AF37',
          500: '#B8860B',
          600: '#996B00',
          700: '#7A5400',
          800: '#5C3D00',
          900: '#3D2800',
        },
        cream: {
          50: '#FFFEFC',
          100: '#FDF8F0',
          200: '#FAF0E6',
        },
        ink: {
          50: '#F5F5F5',
          100: '#E0E0E0',
          200: '#C0C0C0',
          300: '#A0A0A0',
          400: '#606060',
          500: '#404040',
          600: '#2C2C2C',
          700: '#1F1F1F',
          800: '#121212',
          900: '#0A0A0A',
        },
        rose: {
          400: '#E8B4B8',
          500: '#D4A5A5',
          600: '#B76E79',
        },
        emerald: {
          500: '#50C878',
        },
        sapphire: {
          500: '#0F52BA',
        },
        ruby: {
          500: '#E0115F',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Cormorant Garamond', 'serif'],
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(184, 134, 11, 0.15)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
