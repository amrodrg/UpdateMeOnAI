import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Neutrals and the accent shades used for text are CSS variables, so
        // one class works in both themes. Values live in app/globals.css.
        white: v("white"),
        stone: { 100: v("stone-100") },
        slate: {
          50: v("slate-50"),
          100: v("slate-100"),
          200: v("slate-200"),
          300: v("slate-300"),
          400: v("slate-400"),
          500: v("slate-500"),
          600: v("slate-600"),
          700: v("slate-700"),
          800: v("slate-800"),
          900: v("slate-900"),
          950: v("slate-950"),
        },
        cyan: { 300: v("cyan-300"), 400: v("cyan-400") },
        violet: { 200: v("violet-200"), 300: v("violet-300"), 400: v("violet-400") },
        pink: { 300: v("pink-300"), 400: v("pink-400") },
        emerald: { 300: v("emerald-300"), 400: v("emerald-400") },
        amber: { 300: v("amber-300") },
        tools: "#22d3ee",
        models: "#a78bfa",
        updates: "#f472b6",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
