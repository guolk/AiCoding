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
          DEFAULT: '#1e3a5f',
          light: '#2d5f8a',
          lighter: '#4a7fad',
        },
        accent: {
          DEFAULT: '#d4a857',
          light: '#e8c77b',
        },
        success: {
          DEFAULT: '#2d6a4f',
          light: '#40916c',
        },
        warning: {
          DEFAULT: '#e07a5f',
          light: '#f09c85',
        },
        ivory: '#f8f5f0',
        'ivory-warm': '#f3efe8',
        layer: {
          core: '#1e3a5f',
          support: '#2d6a4f',
          general: '#7b68ee',
        },
        depth: {
          aware: '#c5d5e5',
          familiar: '#6b95c0',
          master: '#1e3a5f',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
