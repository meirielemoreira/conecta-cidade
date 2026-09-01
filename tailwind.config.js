/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        primary: '#f97316',
        background: '#09090b',
      },

      boxShadow: {
        orange: '0 10px 30px rgba(249, 115, 22, 0.25)',
      },

      borderRadius: {
        xl2: '1.5rem',
      },
    },
  },

  plugins: [],
};

module.exports = config;