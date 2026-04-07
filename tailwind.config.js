/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Replace these with real brand values when design system is received
        brand: {
          // DEFAULT: "#AA4545",
          DEFAULT: "#26AFFF",
          dark: "#26AFFF",
        },
        surface: {
          DEFAULT: "#F2F2F7",
          dark: "#1C1C1E",
        },
        muted: {
          DEFAULT: "#888888",
          dark: "#777777",
        },
      },
    },
  },
  plugins: [],
};
