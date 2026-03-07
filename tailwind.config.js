/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gpblue: "#1f4fa3",
        gpblue2: "#1f8bb6",
        gporange: "#f59e0b",
        gporangehover: "#d97706",
        gplight: "#f4f6f9",
      },
    },
  },
  plugins: [],
};