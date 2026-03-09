/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 24px 80px rgba(15, 23, 42, 0.45)",
      },
      colors: {
        ink: {
          950: "#08111f",
          900: "#0d1727",
          800: "#13233b",
        },
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
