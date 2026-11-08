import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tools: "#22d3ee",
        models: "#a78bfa",
        updates: "#f472b6",
      },
      fontFamily: {
        display: ["ui-rounded", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
