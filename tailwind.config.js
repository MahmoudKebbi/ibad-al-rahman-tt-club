/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: true, // or 'media' or 'class'
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        "tt-green": {
          light: "#8fbf9f",
          DEFAULT: "#4c9a61",
          dark: "#2c5a38",
        },
        "tt-black": {
          light: "#4a4a4a",
          DEFAULT: "#121212",
          dark: "#000000",
        },
      },
    },
  },
  plugins: [],
};
