/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        robotoslab: ['Roboto Slab', 'serif'],
        hindvadodara: ['Hind Vadodara', 'sans-serif'],
        serif: ['Roboto Slab', 'serif'],
        sans: ['Hind Vadodara', 'sans-serif'],
      },
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
        white: {
          50: '#FEFCFB',
          100: '#FEF8F6',
          200: '#FCEEE9',
          300: '#FAE7E0',
          400: '#F8DDD3',
          500: '#F7D7CA',
          DEFAULT: '#F7D7CA',
          600: '#EB9A7A',
          700: '#E0612F',
          800: '#9B3D17',
          900: '#501F0C',
          950: '#281006',
        },
        orange: {
          50: '#FFF0EB',
          100: '#FFE5DB',
          200: '#FFC8B3',
          300: '#FFAF8F',
          400: '#FF9166',
          500: '#FF7642',
          DEFAULT: '#FF7642',
          600: '#FF4800',
          700: '#C23700',
          800: '#802400',
          900: '#421300',
          950: '#1F0900',
        },
      },
    },
  },
  plugins: [],
};
