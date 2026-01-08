/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-main": "var(--bg-main)",
        "bg-surface": "var(--bg-surface)",
        "bg-sidebar": "var(--bg-sidebar)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "text-brand": "var(--text-brand)",
        "border-subtle": "var(--border-subtle)",
        "border-brand": "var(--border-brand)",
        "border-hover": "var(--border-hover)",
        emerald: colors.emerald,
        sapphire: {
          50: "var(--color-sapphire-50)",
          100: "var(--color-sapphire-100)",
          200: "var(--color-sapphire-200)",
          300: "var(--color-sapphire-300)",
          400: "var(--color-sapphire-400)",
          500: "var(--color-sapphire-500)",
          600: "var(--color-sapphire-600)",
          700: "var(--color-sapphire-700)",
          800: "var(--color-sapphire-800)",
          900: "var(--color-sapphire-900)",
          950: "var(--color-sapphire-950)",
        },
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 rgba(56, 189, 248, 0.2)" },
          "50%": { boxShadow: "0 0 24px rgba(56, 189, 248, 0.45)" },
        },
        "gradient-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "float-slow": "float-slow 10s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "gradient-pan": "gradient-pan 12s ease infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
