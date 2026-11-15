/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif']
      },
      colors: {
        theme: {
          base: '#08111F',
          surface: '#0D1929',
          card: '#111F31',
          'card-hover': '#16273E',
          border: '#203047',
          teal: '#22C7B8',
          'teal-dark': '#1EB3A5',
          sky: '#38BDF8',
          sand: '#D6B98C',
          muted: '#94A3B8',
          ink: '#F4F7FA'
        }
      }
    },
  },
  plugins: [],
}
