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
          DEFAULT: "#000000", // Black
          dark: "#111111" // Near Black
        },
        secondary: {
          DEFAULT: "#000000" // Black
        },
        accent: {
          DEFAULT: "#000000" // Black
        },
        neutral: {
          DEFAULT: "#F5F5F5" // Light Gray
        },
        ink: "#000000" // Black
      },
      boxShadow: {
        soft: "0 18px 50px rgba(35, 31, 32, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
