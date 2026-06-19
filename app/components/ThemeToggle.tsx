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
      onClick={toggleTheme}
      className={`relative h-10 w-[4.5rem] rounded-full border border-border-subtle p-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 ${
        theme === "dark" ? "bg-bg-sidebar" : "bg-bg-surface"
      }`}
      aria-label="Toggle Theme"
    >
      <div
        className={`absolute left-1 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-bg-surface text-xs shadow-sm transition-transform duration-200 ${
          theme === "dark" ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="w-3.5 h-3.5 text-text-secondary" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
    </button>
  );
};
