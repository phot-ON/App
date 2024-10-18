/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}", // Include all files in the screens directory
  ],
  theme: {
    extend: {
      // You can add custom colors, fonts, and more here
      colors: {
        discord: '#7289da', // Example custom color for Discord button
      },
    },
  },
  plugins: [],
};
