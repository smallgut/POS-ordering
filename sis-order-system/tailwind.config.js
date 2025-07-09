/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF', // Deep blue for headers
        secondary: '#F3F4F6', // Light gray for backgrounds
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'], // Professional Chinese font
      },
    },
  },
  plugins: [],
}
