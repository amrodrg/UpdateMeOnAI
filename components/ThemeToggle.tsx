"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  // Read the theme after mount so server and client markup match.
  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage may be blocked; the choice still applies for this page view.
    }
  }

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="fixed right-4 top-4 z-50 inline-flex rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-md sm:right-6 sm:top-6"
    >
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => choose(opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
              active ? "bg-stone-100 text-slate-950" : "text-slate-300 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
