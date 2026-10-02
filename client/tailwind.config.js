/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9eeff",
          200: "#bae1ff",
          300: "#8ed0ff",
          400: "#4ab0ff",
          500: "#f59e0b",
          600: "#0f172a",
          700: "#0b1220",
          800: "#111827",
          900: "#030712",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
