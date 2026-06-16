"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useAuth } from "./components/AuthProvider";

// Import both with SSR disabled to avoid hydration mismatches
const HomePage = dynamic(() => import("./components/HomePage"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-bg-main flex items-center justify-center">
      <div className="text-text-primary text-2xl font-semibold animate-pulse motion-reduce:animate-none">
        Loading…
      </div>
    </div>
  ),
});

const WeeklyTaskOrganizer = dynamic(() => import("./components/WeeklyTaskOrganizer"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-bg-main flex items-center justify-center">
      <div className="text-text-primary text-2xl font-semibold animate-pulse motion-reduce:animate-none">
        Loading…
      </div>
    </div>
  ),
});

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-text-primary text-2xl font-semibold animate-pulse motion-reduce:animate-none">
          Loading…
        </div>
      </div>
    );
  }

  // Each component is a full-page shell; render directly without shared wrapper
  return user ? <WeeklyTaskOrganizer /> : <HomePage />;
}