import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: "#0d3822",
          forestLight: "#165233",
          beige: "#d9cdb0",
          beigeLight: "#f4efe6",
          gold: "#b8a068",
          accent: "#10b981",
          accentBright: "#22c55e",
          dark: "#081c11",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
