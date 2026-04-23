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
        background: "#ffffff",
        "background-2": "#d7e5ff",
        "card-bg": "#ffffff",
        "side-panel": "#EBEBF7",
        "side-panel2": "#FAF8FF",
        login: "#F2F2F2",
        "input-login": "#e9e9f200",
        "button-login-1": "#2f6fed",
        "button-login-2": "#1e4bb8",
        "button-login-hover-1": "#3b7bfd",
        "button-login-hover-2": "#2555cc",
        "primary-blue": "#1152D4",
        "primary-blue-hover": "#092d75",
        "primary-blue-active": "#1664ff",
        "input-border": "#C7D1D9",
        "subtitle": "#707070",
        "side-button": "#FEFFFE",
        "side-button-hover": "#E0E0E0",
        "tr-bg": "#E9E9F2"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "default": "0.500rem",
        "lg": "0.25rem",
        "xl": "0.9rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
