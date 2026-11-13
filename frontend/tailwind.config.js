/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Amazon-inspired Midnight Navy
        navy: {
          50: '#f0f4f9',
          100: '#dce5f0',
          200: '#b8cbe1',
          300: '#8ca9cd',
          400: '#5a82b3',
          500: '#396397',
          600: '#2a4d79',
          700: '#1d385a',
          800: '#152A45', // Deep Navy
          900: '#0F1B2D', // Midnight Navy
          950: '#09101C',
          DEFAULT: '#0F1B2D',
        },
        // Marketplace Brand Orange
        marketplace: {
          orange: '#FF9900',
          hover: '#e68a00',
          yellow: '#FFD814',
          yellowHover: '#f7ca00',
          dark: '#0F1B2D',
          bg: '#F3F5F8',
          border: '#D9E0E8',
          text: '#172337',
          muted: '#667085',
          green: '#168A43',
          red: '#D93025',
        },
        primary: {
          50: '#fff9eb',
          100: '#ffefc6',
          200: '#ffde88',
          300: '#ffc84a',
          400: '#ffb31f',
          500: '#FF9900', // Marketplace Orange
          600: '#e68a00',
          700: '#cc7a00',
          800: '#a36200',
          900: '#0F1B2D',
          DEFAULT: '#FF9900',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#FFD814', // Marketplace Bright Yellow
          500: '#FF9900', // Marketplace Orange
          600: '#ea8900',
          700: '#c66e00',
          800: '#9e5500',
          900: '#0F1B2D',
          DEFAULT: '#FF9900',
        },
        secondary: {
          50: '#fff9eb',
          100: '#ffefc6',
          200: '#ffde88',
          300: '#ffc84a',
          400: '#ffb31f',
          500: '#FF9900',
          600: '#e68a00',
          700: '#cc7a00',
          800: '#a36200',
          900: '#0F1B2D',
          DEFAULT: '#FFD814',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
