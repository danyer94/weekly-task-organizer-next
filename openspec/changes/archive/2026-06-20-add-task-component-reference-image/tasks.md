# Tasks: Add Task Composer Matching Reference (Amended)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 380-450 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR: tests, composer, wiring, calendar integration |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add tested admin task composer with calendar integration | PR 1 | Single PR; keep tests with component and wiring changes. |

## Phase 1: RED Tests

- [x] 1.1 Add `hooks/useWeeklyTasks.test.tsx` failing test: `addTask` with optional `calendarEvent` persists metadata; assert task includes `{ eventId, date, startTime, endTime }`.
- [x] 1.2 Add `hooks/useWeeklyTasks.test.tsx` failing test: `addTask` without `calendarEvent` omits metadata; assert task has no `calendarEvent` field.
- [x] 1.3 Add `app/components/AdminView.test.tsx` failing test: priority is a dropdown menu (not radiogroup), opens on click, selects High/Medium/Low with correct flag colors `text-red-500`, `text-orange-500`, `text-green-500`.
- [x] 1.4 Add `app/components/AdminView.test.tsx` failing test: time input is present, default empty, accessible name `Task time`, accepts `type="time"` value.
- [x] 1.5 Add `app/components/AdminView.test.tsx` failing test: submit with time selected and Google connected calls `createTaskEventForRamon` and persists task with `calendarEvent` metadata.
- [x] 1.6 Add `app/components/AdminView.test.tsx` failing test: submit with time selected but Google disconnected creates task without `calendarEvent`.
- [x] 1.7 Add `app/components/AdminView.test.tsx` failing test: submit with time selected, Google connected, but calendar event creation fails creates task without `calendarEvent` and shows non-blocking alert.
- [x] 1.8 Add `app/components/AdminView.test.tsx` failing test: composer has no Add Tag button, tag field, or tag selector; no `dueDate` field written.

## Phase 2: GREEN Component

- [x] 2.1 Add `startTime` and `onStartTimeChange` props to `AddTaskComposerProps` in `app/components/AddTaskComposer.tsx`.
- [x] 2.2 Add optional `type="time"` input to `AddTaskComposer.tsx` with accessible name `Task time`, default empty string, placed after date control in grid.
- [x] 2.3 Replace priority radiogroup in `AddTaskComposer.tsx` with dropdown menu (native `<select>` or custom listbox): default Medium, options High/Medium/Low with `Flag` icon colored `text-red-500`/`text-orange-500`/`text-green-500`.
- [x] 2.4 Update `AddTaskComposer.tsx` focus order: text → date → time → priority dropdown → Add Task button.
- [x] 2.5 Verify no Add Tag UI or `dueDate` field in `AddTaskComposer.tsx`; keep existing validation for empty text.

## Phase 3: GREEN Wiring and Calendar Integration

- [x] 3.1 Add `newTaskStartTime` state to `WeeklyTaskOrganizer.tsx`, pass as `startTime`/`onStartTimeChange` props to `AdminView` → `AddTaskComposer`.
- [x] 3.2 Modify `hooks/useWeeklyTasks.ts` `addTask` signature to accept optional `calendarEvent?: Task['calendarEvent']`; persist it on created task when provided; return `Promise<Task | null>`.
- [x] 3.3 Update `WeeklyTaskOrganizer.tsx` `handleAddTask` to branch: if `startTime && isGoogleConnected`, build payload via `taskToCalendarEvent`, call `createTaskEventForRamon`, then `addTask` with metadata; on success clear text and time.
- [x] 3.4 Add fallback in `WeeklyTaskOrganizer.tsx` `handleAddTask`: if calendar event creation fails or Google disconnected, call `addTask` without `calendarEvent` and show `alert("Calendar event creation failed. Task was still created.")`.
- [x] 3.5 Update `app/components/AdminView.tsx` to accept and pass through `taskTime`/`onTaskTimeChange` props to `AddTaskComposer`.

## Phase 4: REFACTOR and Verification

- [x] 4.1 Run focused tests: `npm run test -- hooks/useWeeklyTasks.test.tsx` and `npm run test -- app/components/AdminView.test.tsx`.
- [x] 4.2 Run full validation: `npm run test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
