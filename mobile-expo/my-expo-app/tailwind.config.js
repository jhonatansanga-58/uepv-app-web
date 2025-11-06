/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Full shade scales copied from web `src/app/globals.css` so mobile
        // matches the web theme. Use as bg-primary-500, text-primary-700, etc.
        primary: {
          50: '#f9f1fb',
          100: '#eed3f4',
          200: '#dda5e9',
          300: '#c873da',
          400: '#a84cc3',
          500: '#9334ad',
          600: '#842d9c',
          700: '#75288a',
          800: '#672578',
          900: '#882e96',
        },
        secondary: {
          50: '#fffcea',
          100: '#fef4c3',
          200: '#fdeb97',
          300: '#fce270',
          400: '#fbd950',
          500: '#f4c83c',
          600: '#dbaf33',
          700: '#ba942c',
          800: '#9a7a24',
          900: '#f7e27d',
        },
        success: {
          50: '#e7f6f0',
          100: '#c0e8d7',
          200: '#97dabd',
          300: '#6ccba1',
          400: '#45bd8a',
          500: '#2fad74',
          600: '#2b9966',
          700: '#278658',
          800: '#257153',
          900: '#257153',
        },
        error: {
          50: '#fdecea',
          100: '#f9c7be',
          200: '#f5a096',
          300: '#f0786c',
          400: '#ec5449',
          500: '#e83d2f',
          600: '#d73728',
          700: '#c53321',
          800: '#b32d1c',
          900: '#d94323',
        },
      },
    },
  },
  plugins: [],
};
