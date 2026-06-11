import Link from "next/link";

export const metadata = {
  title: "Weekly Task Organizer",
  description:
    "Weekly Task Organizer helps users plan weekly tasks and optionally schedule them in Google Calendar.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg-main px-6 py-12 text-text-primary">
      <section className="mx-auto max-w-4xl rounded-3xl border border-border-subtle bg-bg-surface/90 p-8 shadow-sm">
        <p className="text-sm font-medium text-text-brand">
          Weekly planning with calendar support
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Organize your weekly tasks and schedule them with Google Calendar.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-text-secondary">
          Weekly Task Organizer helps users plan tasks by week, track progress,
          and optionally connect Google Calendar to create or update events from
          selected tasks.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/auth/login"
            className="rounded-2xl bg-sapphire-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-sapphire-600"
          >
            Sign in
          </Link>
          <Link
            href="/privacy"
            className="rounded-2xl border border-border-subtle px-5 py-3 font-semibold text-text-primary transition-colors hover:border-border-brand"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="rounded-2xl border border-border-subtle px-5 py-3 font-semibold text-text-primary transition-colors hover:border-border-brand"
          >
            Terms
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5">
          <h2 className="font-semibold">Weekly planning</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Organize tasks into weekly views and keep track of what needs
            attention.
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5">
          <h2 className="font-semibold">Task scheduling</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Choose task dates and times before creating calendar events.
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5">
          <h2 className="font-semibold">Google Calendar</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Calendar access is optional and used only for event management
            requested by the user.
          </p>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";

export const metadata = {
  title: "Weekly Task Organizer",
  description:
    "Weekly Task Organizer helps users plan weekly tasks and optionally schedule them in Google Calendar.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg-main px-6 py-12 text-text-primary">
      <section className="mx-auto max-w-4xl rounded-3xl border border-border-subtle bg-bg-surface/90 p-8 shadow-sm">
        <p className="text-sm font-medium text-text-brand">
          Weekly planning with calendar support
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Organize your weekly tasks and schedule them with Google Calendar.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-text-secondary">
          Weekly Task Organizer helps users plan tasks by week, track progress,
          and optionally connect Google Calendar to create or update events from
          selected tasks.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/auth/login"
            className="rounded-2xl bg-sapphire-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-sapphire-600"
          >
            Sign in
          </Link>
          <Link
            href="/privacy"
            className="rounded-2xl border border-border-subtle px-5 py-3 font-semibold text-text-primary transition-colors hover:border-border-brand"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="rounded-2xl border border-border-subtle px-5 py-3 font-semibold text-text-primary transition-colors hover:border-border-brand"
          >
            Terms
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5">
          <h2 className="font-semibold">Weekly planning</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Organize tasks into weekly views and keep track of what needs
            attention.
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5">
          <h2 className="font-semibold">Task scheduling</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Choose task dates and times before creating calendar events.
          </p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-bg-surface/80 p-5">
          <h2 className="font-semibold">Google Calendar</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Calendar access is optional and used only for event management
            requested by the user.
          </p>
        </div>
      </section>
    </main>
  );
}
