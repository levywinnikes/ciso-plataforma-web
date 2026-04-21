import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0a2e2a",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#c4a47c",
          foreground: "#000000",
        },
        background: "#ffffff",
        surface: "#f5f7f6",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
