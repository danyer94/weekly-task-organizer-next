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
      className={`relative w-24 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sapphire-400 ${
        theme === "dark" ? "bg-sapphire-800" : "bg-sapphire-200"
      }`}
      aria-label="Toggle Theme"
    >
      <div
        className={`absolute top-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-xs z-10 glow-ring ${
          theme === "dark" ? "translate-x-16 left-1" : "translate-x-0 left-1"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="w-3.5 h-3.5 text-sapphire-900" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </div>
      <span
        className={`absolute top-0 bottom-0 flex items-center text-[10px] font-bold transition-opacity duration-300 ${
          theme === "dark" 
            ? "left-3 text-white opacity-100" 
            : "left-3 text-sapphire-800 opacity-0"
        }`}
      >
        Dark
      </span>
      <span
        className={`absolute top-0 bottom-0 flex items-center text-[10px] font-bold transition-opacity duration-300 ${
          theme === "dark" 
            ? "right-3 text-white opacity-0" 
            : "right-3 text-sapphire-800 opacity-100"
        }`}
      >
        Light
      </span>
    </button>
  );
};
