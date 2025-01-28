/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,jsx,ts,tsx}'], // Update this path to match your project's files
    theme: {
      extend: {
        colors: {
            customOrange: '#e37d34', // Your custom color
            hoverCustomOrange: '#ca6f2e', // Your custom color
        },
      },
    },
    plugins: [],
  };
  