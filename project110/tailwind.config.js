/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        sage: {
          50: '#F5F7F5',
          100: '#E8EFE8',
          200: '#D1DFD1',
          300: '#B7CFB7',
          400: '#9FC29F',
          500: '#7C9A8B',
          600: '#5D7A6A',
          700: '#4A6153',
          800: '#3D4F47',
          900: '#2D3A34',
        },
        cream: {
          50: '#FAFAF8',
          100: '#F5F2EE',
          200: '#EDE6DD',
          300: '#E5D9CB',
          400: '#DDCCB9',
          500: '#F5EFE7',
          600: '#D9CBBE',
          700: '#B8A898',
          800: '#968678',
          900: '#75685D',
        },
        terracotta: {
          50: '#FDF7F5',
          100: '#FBEAE6',
          200: '#F6D4CC',
          300: '#F0BEB2',
          400: '#EAA798',
          500: '#E8A598',
          600: '#D4897A',
          700: '#BE6E5E',
          800: '#A85443',
          900: '#8C3F2F',
        },
        olive: {
          50: '#F6F7F4',
          100: '#E8EBE3',
          200: '#D1D6C6',
          300: '#BAC1AA',
          400: '#A3AD8E',
          500: '#8A9A71',
          600: '#6F7E59',
          700: '#5A6647',
          800: '#454E35',
          900: '#303723',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'medium': '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 40px rgba(124, 154, 139, 0.2)',
      },
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
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
