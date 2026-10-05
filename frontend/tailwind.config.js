/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        espresso: '#2B1E1A',
        coffee: '#5C4033',
        cream: '#F4EFE7',
        beige: '#D8C3A5',
        gold: '#B38B59',
        charcoal: '#242424',
      },
      fontFamily: { display: ['Georgia', 'serif'], body: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
