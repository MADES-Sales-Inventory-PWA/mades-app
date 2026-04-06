/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#204473",
        "background-2": "#182E59",
        "card-bg": "#5783c43b",
        login: "#F2F2F2",
        "input-login": "#E9E9F2",
        "button-login-1": "#2f6fed",
        "button-login-2": "#1e4bb8",
        "button-login-hover-1": "#3b7bfd",
        "button-login-hover-2": "#2555cc",
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "default": "0.500rem",
        "lg": "0.25rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
