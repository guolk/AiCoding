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
        go: {
          wood: {
            50: '#FAF3E0',
            100: '#F5E6C8',
            200: '#E8D5A3',
            300: '#D4BE7E',
            400: '#BFA365',
            500: '#A68B4B',
            600: '#8B6F3A',
            700: '#6D552C',
            800: '#5D4037',
            900: '#3E2723',
          },
          black: '#1A1A1A',
          white: '#FAFAFA',
          bamboo: '#7CB342',
          red: '#D32F2F',
          gold: '#FF8F00',
          blue: '#0288D1',
          ink: '#2C1810',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      backgroundImage: {
        'wood-pattern': `linear-gradient(135deg, #F5E6C8 0%, #E8D5A3 50%, #D4BE7E 100%)`,
        'wood-texture': `repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(139, 111, 58, 0.03) 2px,
          rgba(139, 111, 58, 0.03) 4px
        ), linear-gradient(135deg, #F5E6C8 0%, #E8D5A3 100%)`,
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '60%': { opacity: '1', transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'stone': '2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.2)',
        'stone-white': '2px 2px 4px rgba(0,0,0,0.2), inset -1px -1px 3px rgba(0,0,0,0.1)',
        'card-hover': '0 10px 30px -5px rgba(93, 64, 55, 0.2)',
      },
    },
  },
  plugins: [],
};
