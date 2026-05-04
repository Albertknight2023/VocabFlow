/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f8f6",
          100: "#e0f1ed",
          200: "#c1e3db",
          300: "#a1d5c9",
          400: "#65aa95",
          500: "#0f9d82",
          600: "#0e8d75",
          700: "#006e5f",
          800: "#00544a",
          900: "#003a33",
        },
      },
    },
  },
  plugins: [],
};
