/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
      colors: {
        'theme-bg': {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
        'theme-text': {
          light: '#1a1a1a',
          dark: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}