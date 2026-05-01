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
          DEFAULT: "#7B1E38", // Deep Maroon
          dark: "#5A1226"
        },
        secondary: {
          DEFAULT: "#D4AF37" // Elegant Gold
        },
        accent: {
          DEFAULT: "#FDFBF7" // Cream/Off-white
        },
        neutral: {
          DEFAULT: "#F9F6F0" // Light Beige
        },
        ink: "#2C2C2C" // Soft Black for text
      },
      boxShadow: {
        soft: "0 18px 50px rgba(35, 31, 32, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
