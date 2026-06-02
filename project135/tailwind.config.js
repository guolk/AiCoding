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
        primary: '#2C5F2D',
        secondary: '#B5651D',
        background: '#F5F0E1',
        accent: '#8B4513',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"SimSun"', 'serif'],
      },
    },
  },
  plugins: [],
};
