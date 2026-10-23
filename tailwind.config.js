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
          primary: '#ed1f24',
          'primary-dark': '#c4161b',
          indigo: '#5163ad',
          teal: '#4bc1b4',
          grey: '#bfc0c3',
          red: '#ed1f24',
          ink: '#262726',
          'teal-light': '#7fd4ca',
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
