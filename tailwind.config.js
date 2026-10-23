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
          charcoal: '#383938',
          primary: '#2445db',
          'primary-dark': '#1d39b4',
          indigo: '#2445db',
          teal: '#1dc9b8',
          grey: '#bfc0c3',
          red: '#ed1f24',
          ink: '#262726',
          'teal-light': '#55e7d8',
        },
        surface: '#f3f4f8',
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
