/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ember: '#ff7a00', amber: '#ff9d00', ink: '#050505', panel: '#101010', card: '#171717' },
      fontFamily: { display: ['Bebas Neue', 'sans-serif'], sans: ['DM Sans', 'sans-serif'] },
      boxShadow: { ember: '0 0 30px rgba(255,122,0,.18)' },
    },
  },
  plugins: [],
};
