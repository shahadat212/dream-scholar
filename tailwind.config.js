import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14141F",
        cream: "#FFFDF7",
        violet: {
          DEFAULT: "#5B4CFB",
          50: "#EEECFF",
          100: "#DEDAFF",
          600: "#4A3CE0",
          700: "#3B2FB8",
        },
        coral: {
          DEFAULT: "#FF6B57",
          50: "#FFEDE9",
          600: "#EB5A47",
          700: "#C7452F",
        },
        sun: {
          DEFAULT: "#FFC145",
          50: "#FFF6E0",
          700: "#8A6400",
        },
        mint: {
          DEFAULT: "#22C55E",
          50: "#EAFBF1",
          700: "#127A38",
        },
      },
      fontFamily: {
        display: ['"Poppins"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        dreamscholar: {
          primary: "#5B4CFB",
          secondary: "#FF6B57",
          accent: "#FFC145",
          neutral: "#14141F",
          "base-100": "#FFFFFF",
          info: "#5B4CFB",
          success: "#2DBE7E",
          warning: "#FFC145",
          error: "#FF6B57",
        },
      },
    ],
  },
};
