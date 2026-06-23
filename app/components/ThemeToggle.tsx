import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex h-10 w-[4.5rem] items-center justify-center rounded-full border border-border-subtle p-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 ${
        theme === "dark" ? "bg-bg-sidebar" : "bg-bg-surface"
      }`}
      aria-label="Toggle Theme"
    >
      <span aria-hidden="true" className="pointer-events-none relative h-8 w-full">
        <span
          data-theme-icon="sun"
          className={`pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-center blur-0 transition-[left,transform,opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
            theme === "light"
              ? "left-0.5 z-10 h-7 w-7 scale-100 rounded-full border border-border-subtle bg-bg-surface opacity-100 shadow-sm"
              : "left-1.5 h-5 w-5 scale-75 opacity-40"
          }`}
        >
          <Sun
            className={`h-3.5 w-3.5 ${
              theme === "light" ? "text-amber-500" : "text-text-secondary"
            }`}
          />
        </span>
        <span
          data-theme-icon="moon"
          className={`pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-center blur-0 transition-[right,transform,opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
            theme === "dark"
              ? "right-0.5 z-10 h-7 w-7 scale-100 rounded-full border border-border-subtle bg-bg-surface opacity-100 shadow-sm"
              : "right-1.5 h-5 w-5 scale-75 opacity-40"
          }`}
        >
          <Moon
            className={`h-3.5 w-3.5 ${
              theme === "dark" ? "text-text-primary" : "text-text-secondary"
            }`}
          />
        </span>
      </span>
    </button>
  );
};
