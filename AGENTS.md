# AGENTS

## Quick Context
- Weekly Task Organizer is a Next.js 16 (App Router) app for weekly task planning with admin/user views.
- Primary logic lives in `hooks/useWeeklyTasks.ts` and `lib/*`.
- UI is in `app/components/*` and follows Tailwind CSS v4 patterns.

## Core Areas
- **Weekly flow**: `useWeeklyTasks.ts` → `WeeklyTaskOrganizer.tsx` → Admin/User views.
- **Calendar**: client calls via `lib/calendarClient.ts`, server logic in `lib/googleCalendar.ts`.
- **Firebase**: setup in `lib/firebase.ts`, admin in `lib/firebaseAdmin.ts`.
- **Notifications**: server in `lib/notifications.ts`, client in `lib/notificationsClient.ts`.

## Conventions
- Use `getWeekPath(date)` from `lib/calendarMapper.ts` for week data paths.
- Use `createTaskId()` from `lib/firebase.ts` for task IDs.
- Keep UI logic in components; keep business rules in hooks/lib.

## Things to Avoid
- Do not move auth or calendar logic without reviewing `project.md`.
- Avoid changing Firebase paths without updating `project.md`.

## Commands
- `npm run dev`
- `npm run lint`
- `npm run build`

## Docs
- `project.md`: architecture and system overview.
- `GOOGLE_CLOUD_SETUP.md`: OAuth setup steps.
