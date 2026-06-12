"use client";
import dynamic from "next/dynamic";

// Import HomePage with SSR disabled to avoid hydration mismatches
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

export default function Home() {
  return (
    <main id="main-content">
      <HomePage />
    </main>
  );
}
