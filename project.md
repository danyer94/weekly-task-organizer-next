# Weekly Task Organizer - Project Context

## 1. Project Overview

**Weekly Task Organizer** is a Next.js web application designed to manage weekly tasks with a focus on simplicity and efficiency. It serves two primary user roles: an **Administrator** (who organizes tasks) and a **User** (Ramon, who executes tasks). The app features real-time synchronization, priority management, and various productivity tools.

## 2. Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React
- **Styling**: Tailwind CSS v4
- **Database**: Firebase Realtime Database
- **Language**: TypeScript
- **External APIs**: Google Calendar API (via `googleapis` package)

## 3. Core Architecture

### File Structure

- `app/layout.tsx`: Root layout configuration.
- `app/page.tsx`: Home page entry point, loads `WeeklyTaskOrganizer`.
- `app/components/`:
  - `WeeklyTaskOrganizer.tsx`: Main container hooking logic to view components.
  - `AdminView.tsx`: Dashboard for the Administrator role.
  - `UserView.tsx`: Dashboard for the User role.
  - `TaskItem.tsx`: Atomic component for individual tasks.
  - `TaskList.tsx`: List rendering logic (grouped vs flat).
  - `QuickActions.tsx`: Export/Import and bulk action buttons.
  - `TaskStats.tsx`: Statistics display.
  - `DaySelectionModal.tsx` & `BulkAddModal.tsx`: UI modals.
- `hooks/useWeeklyTasks.ts`: **Core Business Logic**. Handles state, Firebase sync, and CRUD operations.
- `lib/firebase.ts`: Firebase configuration and typed helper functions.
- `lib/googleCalendar.ts`: Google OAuth2 and Calendar API helpers (token management, event creation).
- `lib/calendarMapper.ts`: Pure functions to transform `Task`/`Day` into `CalendarEventPayload`.
- `lib/calendarClient.ts`: Abstraction layer for calendar operations (prepared for future MCP integration).
- `types/index.ts`: Shared type definitions (`Task`, `Day`, `Priority`, `CalendarEventPayload`).
- `app/api/google/`: API routes for Google Calendar integration:
  - `auth/url/route.ts`: Generates OAuth consent URL.
  - `auth/callback/route.ts`: Handles OAuth callback and stores tokens.
  - `calendar/events/route.ts`: Creates calendar events.
  - `status/route.ts`: Checks Google Calendar connection status.

### Data Model

Tasks are stored as a mapped object (`TasksByDay`) where keys are day names and values are arrays of tasks.

**Task Interface:**

```typescript
interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}
```

## 4. Key Features & Functionalities

### 4.1. Roles & Views

#### Administrator (👨‍💼)

- **Layout**: 3-Column Grid.
  - **Left Sidebar**:
    - Vertical Day Navigation with task counts.
    - Weekly Stats.
    - Quick Actions (Export/Import, Bulk Add).
  - **Main Area**:
    - Task list for the selected day.
    - Task input area.
- **Capabilities**: Full control (CRUD, Move, Copy, Reorder).

#### User (Ramon) (👤)

- **Layout**: Single Column (Full Width).
  - Horizontal Day Navigation.
  - Simplified Task List.
  - **No Quick Actions** or admin controls.
- **Capabilities**: Can only toggle task completion.

### 4.2. Task Management

- **Add/Edit/Delete**: Full CRUD operations.
- **Priority**: Three levels (High 🔴, Medium 🟠, Low 🟢).
- **Completion**: Toggleable status.
- **Carry Over**: Incomplete tasks are copied to the next calendar day when a new day starts (supports week boundaries). Originals stay in their day to preserve history; copies start unchecked and without calendar links.

### 4.3. Views & Ordering

- **Grouped by Priority**: High -> Medium -> Low sections. Drag-and-drop restricted to same group.
- **Custom Order**: Flat list, free drag-and-drop reordering.
- **Toggle**: Handled by `TaskList.tsx`.

### 4.4. Bulk Operations

- **Select All**: Selects all tasks in the current view.
- **Move/Copy**: Multi-task operations to other days.
- **Bulk Add**: Paste list of tasks to add multiple at once.

### 4.5. Data Synchronization

- **Real-time Sync**: `useWeeklyTasks` subscribes to Firebase changes.
- **Optimistic UI**: Local state updates immediately; logic handles preventing sync loops via `isLocalChange` ref.

### 4.6. Google Calendar Integration

- **OAuth Flow**: Administrator can connect Ramon's Google account via OAuth2 consent flow.
- **Event Creation**: Individual tasks can be converted to Google Calendar events (all-day events on the corresponding day of the week).
- **Token Management**: OAuth tokens (access + refresh) are stored in Firebase under `users/ramon/googleAuth`.
- **Architecture**: Calendar operations are abstracted through `lib/calendarClient.ts`, allowing future MCP (Model Context Protocol) integration without UI changes.
- **UI Elements**:
  - Connection button in header (Admin view only).
  - Calendar icon button on each `TaskItem` (Admin view only) to create events.

## 5. Google Calendar Setup

### Environment Variables Required

Add to `.env.local`:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/auth/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For production, use your production URL
```

### Google Cloud Console Setup

1. Create a project in Google Cloud Console.
2. Enable **Google Calendar API**.
3. Create **OAuth 2.0 Client ID** credentials (Web application type).
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/google/auth/callback` (development)
   - `https://yourdomain.com/api/google/auth/callback` (production)
5. Copy `Client ID` and `Client Secret` to environment variables.

### User Model

- Currently uses a fixed user ID `"ramon"` stored in Firebase at `users/ramon/googleAuth`.
- Structure: `{ accessToken, refreshToken, expiryDate }`.
- Tokens are automatically refreshed when expired before API calls.

## 6. Future MCP Integration

The calendar functionality is designed to be easily replaced by an MCP server:

- **Current**: `lib/calendarClient.ts` calls Next.js API routes that use Google Calendar API directly.
- **Future**: Replace `calendarClient` implementation to call MCP tools instead of API routes.
- **Mapper Reusability**: `lib/calendarMapper.ts` functions (`taskToCalendarEvent`, etc.) can be reused to format payloads for MCP tools.
- **UI Unchanged**: No changes needed to components when switching to MCP.

## 7. Implementation Notes for AI Agents

- **Logic Separation**: UI is in `app/components`, Logic is in `hooks/useWeeklyTasks.ts`. Modify the hook for business rule changes, modify components for UI changes.
- **Type Safety**: strict TypeScript usage. Use `Task`, `Day`, `Priority`, `CalendarEventPayload` from `@/types`.
- **Firebase**: Helper functions in `lib/firebase.ts` return typed Promises.
- **Calendar Operations**: Use `lib/calendarClient.ts` for calendar-related operations. Do not call Google API directly from components.
- **Styling**: Tailwind CSS v4. "Sapphire Nightfall" theme (User-defined Blue Palette).
