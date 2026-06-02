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
        brand: {
          50: '#fff3ed',
          100: '#ffe4d5',
          200: '#ffc5a9',
          300: '#ff9f72',
          400: '#ff6b35',
          500: '#ff450a',
          600: '#f02b00',
          700: '#c61d02',
          800: '#9d1b09',
          900: '#7f1a0c',
        },
        dark: {
          50: '#f6f6f8',
          100: '#ececf1',
          200: '#d6d6df',
          300: '#b3b3c2',
          400: '#8a8a9e',
          500: '#6c6c82',
          600: '#57576a',
          700: '#474756',
          800: '#1a1a2e',
          900: '#0f0f1a',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 107, 53, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
