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
        nano: {
          bg: "#F8F3F1",
          "new-white": "#F4F3F1",
          primary: "#FEB300",
          text: "#3C3C42",
          black: "#4D4745",
          teal: "#3AABD2",
          orange: "#E87A46",
          green: "#8EBE09",
          pink: "#F467B2",
          shadow: "#907FA0",
          error: "#E7000B",
          link: "#0088FF",
          purple: "#9810FA",
          line: "rgba(38,38,38,0.1)",
          surface: "#F2F2F6",
          border: "#F1F1F7",
          muted: "#D9D9D9",
          divider: "#E5E5EA",
          "sub-text": "#4A5565",
          heading: "#101828",
          "blue-light": "#B0ECED",
          "red-light": "#FAC7B3",
          "yellow-light": "#FFE199",
        },
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', "Helvetica Neue", "Arial", "sans-serif"],
        sf: ['"SF Pro"', '"SF Pro Display"', "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"],
        inter: ['"Inter"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
