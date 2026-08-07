/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f6f6f5",
          100: "#e8e7e4",
          200: "#d1cfc9",
          300: "#aeaba1",
          400: "#87837a",
          500: "#6b675e",
          600: "#54514a",
          700: "#44423c",
          800: "#2b2a26",
          900: "#1a1917",
          950: "#0f0e0d",
        },
        amber: {
          50: "#fef8ec",
          100: "#fcecc9",
          200: "#f8d68d",
          300: "#f4bd53",
          400: "#eea22b",
          500: "#e8891a",
          600: "#cc6c13",
          700: "#a95213",
          800: "#894116",
          900: "#703715",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 6px -1px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};
