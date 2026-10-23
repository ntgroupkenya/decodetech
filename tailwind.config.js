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
          yellow: '#48c0b0',
          orange: '#7dd5c8',
          ember: '#e0242b',
          red: '#e0242b',
          blue: '#5060a8',
          charcoal: '#2a336e',
          black: '#181e45',
        }
      }
    },
  },
  plugins: [],
}
