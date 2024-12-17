/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {},
      // via https://www.tints.dev
      colors: {
        black: {
          50: '#CCFCFF',
          100: '#9EFAFF',
          200: '#3DF5FF',
          300: '#00CBD6',
          400: '#006F75',
          500: '#001415', // from pic
          DEFAULT: '#001415',
          600: '#000F0F',
          700: '#000A0A',
          800: '#000A0A',
          900: '#000505',
          950: '#000000',
        },
      },
    },
  },
  plugins: [],
};
