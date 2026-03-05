/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce8ff',
          200: '#b8d0ff',
          300: '#85afff',
          400: '#5284ff',
          500: '#2f5af5',
          600: '#1f3feb',
          700: '#1a2fd6',
          800: '#1b2aad',
          900: '#1c2a88',
          950: '#141a55',
        },
      },
    },
  },
  plugins: [],
}
