# Weekly Task Organizer - Project Context

## 1. Project Overview

**Weekly Task Organizer** is a Next.js web application designed to manage weekly tasks with a focus on simplicity and efficiency. It serves two primary user roles: an **Administrator** (who organizes tasks) and a **User** (Ramon, who executes tasks). The app features real-time synchronization, priority management, and various productivity tools.

## 2. Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React
- **Styling**: Tailwind CSS v4
- **Database**: Firebase Realtime Database
- **Language**: JavaScript

## 3. Core Architecture

### File Structure

- `app/page.js`: Main entry point, loads the `WeeklyTaskOrganizer` component dynamically (client-side only).
- `app/components/WeeklyTaskOrganizer.js`: Monolithic component containing all UI logic, state management, and business logic.
- `lib/firebase.js`: Firebase configuration and helper functions (`saveTasks`, `subscribeToTasks`).
- `app/globals.css`: Global styles and Tailwind imports.

### Data Model

Tasks are stored as an object where keys are day names (e.g., "Monday") and values are arrays of task objects.

**Task Object Structure:**

```json
{
  "id": 1734567890123,
  "text": "Task description",
  "completed": false,
  "priority": "high" // "high" | "medium" | "low"
}
```

## 4. Key Features & Functionalities

### 4.1. Roles & Modes

- **Administrator (👨‍💼)**: Full control. Can add, edit, delete, move, and copy tasks.
- **User (Ramon) (👤)**: Execution mode. Can only mark tasks as complete/incomplete. Interface is simplified.

### 4.2. Task Management

- **Add Task**: Inputs for text and priority selection.
- **Edit Task**: In-place editing of text and priority.
- **Delete Task**: Individual deletion or bulk deletion of selected tasks.
- **Priority**: Three levels (High 🔴, Medium 🟠, Low 🟢).
- **Completion**: Checkbox to toggle status.

### 4.3. Views & Ordering

- **Grouped by Priority (Default)**: Tasks are displayed in sections (High -> Medium -> Low).
  - _Constraint_: Drag-and-drop is restricted to within the same priority group.
- **Custom Order**: Flat list view where tasks can be reordered freely via drag-and-drop.
- **Toggle**: A button switches between these two views.

### 4.4. Bulk Operations via Selection

- **Select All**: Button to select all tasks for a specific day.
- **Move/Copy**: Selected tasks can be moved or copied to one or multiple target days.
  - _Logic_: Uses a robust non-destructive append strategy.
- **Bulk Add**: text area to add multiple tasks at once (one per line).

### 4.5. Data Synchronization

- **Real-time Sync**: Uses Firebase `onValue` listener to sync state across devices instantly.
- **Optimistic Updates**: Local state calls `updateTasks`, which updates local state immediately and pushes to Firebase.
- **Offline/Error Handling**: UI indicator shows connection status (🟢 Synced, 🟡 Connecting, 🔴 Error).
- **Edge Cases**: Handles sparse data (null/undefined arrays) from Firebase seamlessly.

### 4.6. Import / Export

- **WhatsApp Export**: Generates a formatted string with emojis representing status and priority, copies to clipboard.
- **JSON Backup**: Downloads a full state backup file.
- **JSON Restore**: Restores state from a backup file (with validation).

## 5. Important Code Functions (`WeeklyTaskOrganizer.js`)

- `renderTaskList(day, isAdmin)`: Logic to render tasks either grouped by priority or as a plain list based on `groupByPriority` state.
- `updateTasks(updater)`: Central wrapper for `setTasks` that flags changes as "local" to prevent circular sync loops with Firebase.
- `moveOrCopyTasks(targetDays, isMove)`: Handles the logic for duplicating/moving selected tasks to target days.
- `reorderTasks(day, fromIndex, toIndex)`: Handles drag-and-drop reordering logic.

## 6. Implementation Notes for AI Agents

- **Props/State**: The component relies heavily on local state (`tasks`, `selectedTasks`, `groupByPriority`).
- **Safety**: Always ensure array access is safe (e.g., `(prev[day] || [])`) as Firebase may return null for empty nodes.
- **Modals**: Custom inline modals are used for "Move/Copy" and "Bulk Add".
- **Styling**: Uses standard Tailwind utility classes; ensure consistency with the existing purple/white theme.
