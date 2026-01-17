# Weekly Task Organizer - Project Context

## 1. Project Overview

**Weekly Task Organizer** is a Next.js web application for managing weekly tasks with a focus on clarity and speed. It supports **Multi-tenancy** using Firebase Authentication, allowing multiple users to have their own tasks and Google Calendar integrations. Tasks are organized by ISO week and day, with real-time sync, priority grouping, and daily summary notifications.

## 2. Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Firebase Realtime Database
- **Utilities**: date-fns, lucide-react
- **External APIs**: Google Calendar (googleapis)
- **Authentication**: Firebase Auth (Google, Email/Password, Username/Password)
- **Admin Utilities**: Firebase Admin SDK (server-side verification)
- **Notifications**: Nodemailer (SMTP) + Twilio (SMS/WhatsApp)

## 3. Core Architecture

### 3.1 Key Files and Directories

- `app/layout.tsx`: Root layout and fonts.
- `app/page.tsx`: Client-only entry point (SSR disabled for UI).
- `app/auth/login/page.tsx`: Premium login page with multi-method support.
- `app/components/`:
  - `AuthProvider.tsx`: Context provider for manages user sessions.
  - `WeeklyTaskOrganizer.tsx`: Main container tying logic to UI.
  - `AdminView.tsx`: Dashboard with full task management control and week selector.
  - `UserView.tsx`: Dashboard with completion-only control.
  - `Sidebar.tsx`: Date picker (admin sidebar), day navigation, stats, quick actions.
  - `TaskList.tsx`, `TaskItem.tsx`: Task rendering, state styling (including dark mode), and interactions.
  - `TaskTimeline.tsx`: Daily timeline view (all-day, scheduled, unscheduled).
  - `TaskViewToggle.tsx`: List/timeline mode selector.
  - `PrioritySelector.tsx`: Priority dropdown.
  - `DatePicker.tsx`: ISO week date picker.
  - `QuickActions.tsx`: Bulk actions and import/export.
  - `CalendarEventModal.tsx`: All-day/timed event UI.
  - `DaySelectionModal.tsx`, `BulkAddModal.tsx`, `ConfirmationModal.tsx`: Modals.
  - `ThemeToggle.tsx`: Light/dark mode toggle.
  - `UserMenu.tsx`: Header account menu with settings and logout.
  - `UserSettingsModal.tsx`: Profile and password management modal.

- `hooks/useWeeklyTasks.ts`: Core business logic (state, sync, CRUD, carry-over).
- `lib/firebase.ts`: Firebase setup, typed helpers, task ID generation.
- `lib/calendarMapper.ts`: Mapping tasks to calendar payloads and week paths.
- `lib/calendarClient.ts`: Client API wrapper for Google Calendar endpoints.
- `lib/googleCalendar.ts`: OAuth and Calendar API server helpers.
- `lib/notifications.ts`: Server-side notification delivery.
- `lib/notificationsClient.ts`: Client API wrapper for notifications.
- `lib/migration.ts`: Legacy utilities for structural cleanup and one-time data migration (completed).
- `lib/firebaseAdmin.ts`: Server-side Firebase Admin SDK initialization and verification helpers.
- `app/api/google/*`: Google Calendar API routes (protected with ID tokens).
- `app/api/notifications/*`: Notification API routes.
- `scripts/`: Firebase maintenance scripts.

### 3.2 Data Model

Tasks are stored per user in the Firebase Realtime Database:

- **Root level**:
  - `usernames/${username}`: Mapping of usernames to email addresses.
- **User path**: `users/${uid}/`
  - `weeks/YYYY/WW`: ISO week-based task lists.
  - `meta/lastCarryOverDate`: Tracks progress for task carry-over.
  - `googleAuth`: Stores Google OAuth tokens for the specific user.

**Task Interface**

```typescript
interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  calendarEvent?: {
    eventId: string;
    date: string; // YYYY-MM-DD
    startTime?: string | null; // HH:mm
    endTime?: string | null; // HH:mm
    lastSynced?: number | null;
  } | null;
  calendarEvent?: CalendarEvent | null;
  copiedFromId?: string | null; // Tracks original task ID when copied (carry-over)
}
```

## 4. Key Features and Functionalities

### 4.1 Roles and Views

- **Administrator**
  - Full CRUD, priority control, drag-reorder, selection tools.
  - Week selector in the admin panel header plus sidebar date picker, day navigation, stats, quick actions.
  - Google Calendar connect, event sync, and daily summary sending.
  - **Timeline view**: daily timeline (all-day, scheduled, unscheduled) with optional list.
- **User (per account)**
  - Simplified view with day scroller and date picker.
  - Uses the signed-in display name in the UI.
  - Can only toggle completion status.
  - **Timeline view**: daily timeline with optional list.


### 4.2 Weekly Navigation and Carry-Over

- Date picker selects the active ISO week.
- Date picker includes quick previous/next week navigation buttons.
- Data loads from `weeks/YYYY/WW` for the selected week.
- Incomplete tasks carry over to the next calendar day (including week boundaries).
  - Copies are reset to `completed = false`.
  - Calendar links are cleared on copies.
  - Dedupe is done by normalized task text against the target day.
  - Uses both local storage and `meta/lastCarryOverDate` to avoid repeat runs.

### 4.3 Task Management

- Add, edit, delete tasks.
- Priority selection (high/medium/low).
- Completion toggling (admin and user).
- Drag-and-drop reordering within a day.
- Weekly stats: total and completed tasks.

### 4.4 Views and Ordering

- **Grouped by priority**: High, Medium, Low sections.
- **Custom order**: Flat list, manual ordering.
- **Timeline modes**: List only, timeline only, or timeline + list.
- Timeline sections: All-day, Scheduled, Unscheduled (per current day).
- Toggle between views from both Admin and User screens.


### 4.5 Bulk Operations

- Select all / deselect all for the current day.
- Move or copy selected tasks to multiple days.
- Bulk add via multiline paste.
- Clear completed tasks across all days (confirmation required).
- Delete selected tasks with confirmation.

### 4.6 Import and Export

- Export to WhatsApp formatted text (copied to clipboard).
- Export to JSON backup file.
- Import JSON (replaces current week after confirmation).

### 4.7 Real-Time Sync and Status

- Live subscription to Firebase changes per week path.
- Optimistic local updates with a short guard to avoid stale overwrites.
- Week switching clears local task cache before new data arrives to avoid showing stale tasks.
- Sync indicator in the header: `connecting`, `synced`, `error`.

### 4.8 Google Calendar Integration

- OAuth connection button (Admin only).
- Create an all-day or timed event per task.
- Edit a calendar event by recreating it with the new time.
- Delete calendar events from the task UI.
- Manual sync checks if events were deleted or changed in Google Calendar and updates tasks.

### 4.9 Notifications (Daily Summary)

- Admin quick action to send a daily summary for the selected day.
- Server endpoint builds summaries grouped by priority.
- Supports email, WhatsApp, and SMS via SMTP/Twilio.
- Vercel cron triggers `/api/notifications/daily`.

### 4.10 Theme

- Light/dark mode toggle persisted in `localStorage`, located in the header next to the user menu.

### 4.11 User Settings

- Header menu provides access to profile updates (display name) and password changes.
- Password changes may require a recent sign-in per Firebase rules.

## 5. API Routes

- `app/api/google/auth/url`: Returns OAuth consent URL.
- `app/api/google/auth/callback`: Handles OAuth callback, stores tokens.
- `app/api/google/status`: Returns Google connection status.
- `app/api/google/calendar/events`: Create or delete events.
- `app/api/google/calendar/sync`: Sync existing events for changes/deletes.
- `app/api/notifications`: Send a single notification.
- `app/api/notifications/daily`: Send daily summary (GET/POST).

## 6. Environment Variables

### Firebase (client)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Google Calendar

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `NEXT_PUBLIC_APP_URL`

### Notifications (delivery + recipients)

- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM`, `TWILIO_WHATSAPP_FROM`
- Recipients: `NOTIFY_SMS_TO`, `NOTIFY_WHATSAPP_TO` (email recipients are configured per user)

### Firebase Admin (server-side auth)

- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Notifications (schedule)

- `NOTIFICATIONS_TIME_ZONE` (default `America/New_York`)
- `NOTIFY_DAILY_HOUR` (default `9`)
- `NOTIFY_DAILY_MINUTE` (default `0`)
- `NOTIFY_DAILY_WEEKDAYS` (default `1,2,3,4,5`)

## 7. Cron and Scheduling

- `vercel.json` schedules `/api/notifications/daily` at `0 14 * * 1-5` (UTC).
- The endpoint enforces the configured timezone and weekday rules unless `force=true`.
- Adjust the cron if you need a different UTC window, especially around DST.

## 8. Scripts and Maintenance

- `scripts/backfillTaskIds.ts`: Ensures all tasks have string IDs across weeks and legacy root.
- `scripts/renameFirebaseNode.ts`: One-off helper to rename nodes in Firebase.

## 9. Implementation Notes for AI Agents

- **Logic vs UI**: Business rules live in `hooks/useWeeklyTasks.ts`. UI lives in `app/components`.
- **Week paths**: Always compute data paths with `getWeekPath(date)` in `lib/calendarMapper.ts`.
- **Task IDs**: Use `createTaskId()` from `lib/firebase.ts`; do not use numeric IDs.
- **Calendar**: Use `lib/calendarClient.ts` from the UI and `lib/googleCalendar.ts` on the server.
- **Notifications**: Use `lib/notificationsClient.ts` for client calls; format logic is in `app/api/notifications/daily`.
- **Carry-over**: Keep logic in `useWeeklyTasks.ts` and respect `meta/lastCarryOverDate`.
- **Theme**: `ThemeToggle` manages light/dark and persists to `localStorage`.
