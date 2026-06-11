export const metadata = {
  title: "Terms of Service | Weekly Task Organizer",
  description: "Terms of service for Weekly Task Organizer.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-bg-main px-6 py-12 text-text-primary">
      <article className="mx-auto max-w-3xl rounded-3xl border border-border-subtle bg-bg-surface/90 p-8 shadow-sm">
        <p className="text-sm font-medium text-text-brand">Effective date: June 11, 2026</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-text-secondary">
          By using Weekly Task Organizer, you agree to use the app responsibly and only for
          lawful task planning and calendar management purposes.
        </p>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold">Service description</h2>
          <p className="text-text-secondary">
            Weekly Task Organizer provides weekly task planning features and optional Google
            Calendar integration for creating and managing calendar events based on user action.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold">User responsibility</h2>
          <p className="text-text-secondary">
            You are responsible for the tasks, schedules, and calendar events you create or
            modify through the app. Do not use the app to violate laws, platform policies, or
            the rights of others.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold">Google Calendar integration</h2>
          <p className="text-text-secondary">
            Calendar access is optional. If you connect Google Calendar, the app will request
            permission to manage calendar events needed for the task scheduling features you use.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="text-text-secondary">
            Questions about these terms can be sent to
            {" "}
            <a className="text-text-brand underline" href="mailto:danyeracevedo94@gmail.com">
              danyeracevedo94@gmail.com
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
