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
        cyber: {
          bg: '#0a0e1a',
          card: '#111827',
          surface: '#1a1f2e',
          border: '#1e293b',
          'border-light': '#334155',
          green: '#00ff88',
          blue: '#00d4ff',
          amber: '#ffb800',
          red: '#ff3366',
          'green-dim': '#00cc6a',
          'blue-dim': '#0099cc',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-red': '0 0 20px rgba(255, 51, 102, 0.3)',
        'glow-amber': '0 0 20px rgba(255, 184, 0, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'number-roll': 'numberRoll 1s ease-out',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        numberRoll: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
