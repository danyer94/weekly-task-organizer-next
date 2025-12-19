# Weekly Task Organizer - Project Context

## 1. Project Overview

**Weekly Task Organizer** is a Next.js web application designed to manage weekly tasks with a focus on simplicity and efficiency. It serves two primary user roles: an **Administrator** (who organizes tasks) and a **User** (Ramon, who executes tasks). The app features real-time synchronization, priority management, and various productivity tools.

## 2. Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React
- **Styling**: Tailwind CSS v4
- **Database**: Firebase Realtime Database
- **Language**: TypeScript

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
- `types/index.ts`: Shared type definitions (`Task`, `Day`, `Priority`).

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

## 5. Implementation Notes for AI Agents

- **Logic Separation**: UI is in `app/components`, Logic is in `hooks/useWeeklyTasks.ts`. Modify the hook for business rule changes, modify components for UI changes.
- **Type Safety**: strict TypeScript usage. Use `Task`, `Day`, `Priority` from `@/types`.
- **Firebase**: Helper functions in `lib/firebase.ts` return typed Promises.
- **Styling**: Tailwind CSS v4. Standard purple/white theme consistency.
