import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "Arial", "sans-serif"],
        serif: ["var(--font-montserrat)", "Arial", "sans-serif"]
      },
      colors: {
        primary: {
          DEFAULT: "#000000",
          dark: "#000000"
        },
        secondary: {
          DEFAULT: "#000000"
        },
        accent: {
          DEFAULT: "#000000"
        },
        neutral: {
          DEFAULT: "#FFFFFF"
        },
        ink: "#000000"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(35, 31, 32, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
