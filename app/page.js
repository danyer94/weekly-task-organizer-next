"use client";
import dynamic from "next/dynamic";

// Import component with SSR disabled to avoid hydration mismatches
const WeeklyTaskOrganizer = dynamic(
  () => import("./components/WeeklyTaskOrganizer"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Loading...
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main>
      <WeeklyTaskOrganizer />
    </main>
  );
}
