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
          DEFAULT: "#C2185B",
          dark: "#880E4F"
        },
        secondary: {
          DEFAULT: "#4A148C"
        },
        accent: {
          DEFAULT: "#FF6F00"
        },
        neutral: {
          DEFAULT: "#FFF8F0"
        },
        ink: "#231F20"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(35, 31, 32, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
