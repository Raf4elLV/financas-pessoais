/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        earth: {
          50:  '#FAF8F5',
          100: '#F2EDE6',
          200: '#E5DDD5',
          300: '#C9B9AA',
          400: '#A89078',
          500: '#8B6F5E',
          600: '#6E5748',
          700: '#503F35',
          800: '#352A23',
          900: '#1C1916',
        },
        positive: {
          DEFAULT: '#5A7A5A',
          light: '#EBF2EB',
          dark: '#7DAB7D',
          darkbg: '#1A2E1A',
        },
        negative: {
          DEFAULT: '#8B4A3A',
          light: '#F5EBE8',
          dark: '#C47A6A',
          darkbg: '#2E1A16',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
