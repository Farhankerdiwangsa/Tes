/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mustard: '#FFC300',
        panel: '#FFF9E0',
        textblack: '#000000',
      },
      fontFamily: {
        bangers: ['Bangers', 'cursive'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'dot-bounce': 'dot-bounce 1.4s infinite ease-in-out',
        'simple-bounce': 'simple-bounce 1s infinite ease-in-out',
        'tvSpin': 'tvSpin 1.8s ease-in-out infinite',
        'tvScanlines': 'tvScanlines 0.2s linear infinite',
        'tvFlicker': 'tvFlicker 1.5s linear infinite',
      },
      keyframes: {
        'dot-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'simple-bounce': {
          '0%, 100%': { transform: 'scale(0.5)', opacity: '0.3' },
          '50%': { transform: 'scale(1)', opacity: '1' },
        },
        'tvSpin': {
          '0%': { transform: 'scale(0.8) rotate(0deg)', opacity: '0.5' },
          '50%': { transform: 'scale(1.1) rotate(15deg)', opacity: '1' },
          '100%': { transform: 'scale(0.8) rotate(0deg)', opacity: '0.5' },
        },
        'tvScanlines': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 6px' },
        },
        'tvFlicker': {
          '0%, 100%': { opacity: '0.2', filter: 'brightness(0.8)' },
          '20%': { opacity: '0.4', filter: 'brightness(1)' },
          '40%': { opacity: '0.2', filter: 'brightness(0.7)' },
          '60%': { opacity: '0.5', filter: 'brightness(1.2)' },
          '80%': { opacity: '0.3', filter: 'brightness(0.9)' },
        },
      },
    },
  },
  plugins: [],
}