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
          charcoal: '#14213d',
          bar: '#1b2b52',
          primary: '#1dc9b8',
          'primary-dark': '#0e8378',
          indigo: '#2445db',
          teal: '#1dc9b8',
          grey: '#bfc0c3',
          red: '#ed1f24',
          ink: '#0e1730',
          'teal-light': '#55e7d8',
        },
        surface: '#f2f5fa',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
