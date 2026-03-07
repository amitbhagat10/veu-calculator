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
        gpblue: "#1787C8",
        gpdark: "#0C1E3B",
        gporange: "#F59E0B",
        gporangehover: "#D97706",
      },
      backgroundImage: {
        "gp-gradient":
          "linear-gradient(135deg, #1787C8 0%, #0C1E3B 100%)",
      },
    },
  },
  plugins: [],
};