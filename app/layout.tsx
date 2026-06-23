import type { Metadata } from "next";
import { AuthProvider } from "./components/AuthProvider";
import "./globals.css";

const IBM_PLEX_SANS_URL = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap";
const IBM_PLEX_MONO_URL = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap";

export const metadata: Metadata = {
	title: "Weekly Task Organizer",
	description:
		"Plan, track, and organize your weekly tasks with collaborative admin and user views.",
};

const themeInitScript = `
(function () {
  try {
    var savedTheme = window.localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var hasSavedTheme = savedTheme === "light" || savedTheme === "dark";
    var shouldUseDark = savedTheme === "dark" || (!hasSavedTheme && prefersDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  } catch (_error) {
    document.documentElement.classList.remove("dark");
  }
})();
`;

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href={IBM_PLEX_SANS_URL} rel="stylesheet" />
				<link href={IBM_PLEX_MONO_URL} rel="stylesheet" />
			</head>
			<body className="antialiased">
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-bg-surface focus:px-4 focus:py-2 focus:text-text-primary focus:shadow-lg"
				>
					Skip to content
				</a>
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
