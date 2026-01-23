import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-20 h-10 rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-brand/40 border border-border-subtle ${
        theme === "dark" ? "bg-bg-sidebar" : "bg-bg-surface/80"
      }`}
      aria-label="Toggle Theme"
    >
      <div
        className={`absolute top-1 bg-white w-7 h-7 rounded-full shadow-sm transform transition-transform duration-300 flex items-center justify-center text-xs z-10 ${
          theme === "dark" ? "translate-x-10 left-1" : "translate-x-0 left-1"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="w-3.5 h-3.5 text-text-secondary" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
      <span
        className={`absolute top-0 bottom-0 flex items-center text-[10px] font-bold transition-opacity duration-300 ${
          theme === "dark" 
            ? "left-3 text-text-primary opacity-100" 
            : "left-3 text-text-secondary opacity-0"
        }`}
      >
        Dark
      </span>
      <span
        className={`absolute top-0 bottom-0 flex items-center text-[10px] font-bold transition-opacity duration-300 ${
          theme === "dark" 
            ? "right-3 text-text-secondary opacity-0" 
            : "right-3 text-text-secondary opacity-100"
        }`}
      >
        Light
      </span>
    </button>
  );
};
