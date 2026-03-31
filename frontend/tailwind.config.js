/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cyan: "#00f5d4",
        ngreen: "#39ff14",
        nyellow: "#cfff00",
        nred: "#ff4d4d",
        slate: "#1a1f2e",
        charcoal: "#232936",
      },
    },
  },
  plugins: [],
}