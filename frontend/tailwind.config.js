/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#12232E",
          50: "#EEF2F3",
          100: "#D3DDE1",
          400: "#4E6873",
          600: "#233C48",
          700: "#182B34",
          900: "#0B161C",
        },
        brass: {
          DEFAULT: "#C08A3E",
          50: "#FBF3E7",
          100: "#F3E0BE",
          400: "#D6A45C",
          600: "#A16E2C",
        },
        canvas: "#EFF2F0",
        rust: "#B5482F",
        moss: "#3F7A5C",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
