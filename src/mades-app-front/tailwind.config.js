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
        login: "#F2F2F2",
        "input-login": "#e9e9f200",
        "button-login-1": "#2f6fed",
        "button-login-2": "#1e4bb8",
        "button-login-hover-1": "#3b7bfd",
        "button-login-hover-2": "#2555cc",
        "icon-color": "#1152D4",
        "input-border": "#C7D1D9"
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
