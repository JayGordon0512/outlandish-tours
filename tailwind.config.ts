// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        highland: {
          offwhite: "#f7f3e9", // page background
          stone: "#d9d7ca",    // cards / panels
          gold: "#b9934a",     // CTA + accents
          ink: "#3b3024"       // primary text
        }
      }
    }
  },
  plugins: []
};

export default config;