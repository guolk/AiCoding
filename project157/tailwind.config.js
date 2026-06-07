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
        primary: {
          50: '#FFF8ED',
          100: '#FFEFD5',
          200: '#FFDCA8',
          300: '#FFC97A',
          400: '#FFB64D',
          500: '#FFB347',
          600: '#CC8E39',
          700: '#996A2B',
        },
        secondary: {
          50: '#EAF6FB',
          100: '#D5EEF7',
          200: '#ABDDEF',
          300: '#81CBE7',
          400: '#57B9DF',
          500: '#87CEEB',
          600: '#6CA5BC',
          700: '#517C8D',
        },
        accent: {
          pink: '#FFB6C1',
          green: '#98FB98',
          purple: '#E6E6FA',
          coral: '#FF7F7F',
        },
        cream: '#FFFAF0',
        paper: '#FFFEF8',
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', 'cursive'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-soft': 'bounceSoft 0.5s ease-out',
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
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
