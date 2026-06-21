## Exploration: Add task composer matching reference image

### Current State
Task creation currently lives in the admin flow only. `WeeklyTaskOrganizer` owns `newTaskText` and `priority`, then `handleAddTask()` calls `addTask(currentAdminDay, newTaskText, priority)` and clears the input. `useWeeklyTasks.addTask()` persists a task with `id`, `text`, `completed: false`, and `priority` under the selected week/day in Firebase.

The existing composer in `AdminView` is a single grid row: priority dropdown, text input with `Add new task…`, and `Add Task` button. Date selection exists elsewhere through `DatePicker`, but the composer itself does not expose a due-date control. The current `Task` model has no generic `dueDate` field; date placement is represented by the week path plus `Day`. Calendar dates only exist inside optional `calendarEvent` metadata and should not be used as task due dates.

### Affected Areas
- `app/components/AdminView.tsx` — contains the existing add-task composer UI, priority selector wiring, Enter-key submission, and admin-only task controls.
- `app/components/WeeklyTaskOrganizer.tsx` — owns composer state and currently maps additions to `currentAdminDay`; date selection from the composer will need to update the target day/week before submit or pass a selected composer date.
- `hooks/useWeeklyTasks.ts` — `addTask(day, text, priority)` already supports text and priority, but not cross-week date-based insertion; only needed if the new date selector must add to another week without changing the active week.
- `app/components/PrioritySelector.tsx` — reusable dropdown already supports priority choice but visually uses a circle indicator, not the reference flag treatment.
- `app/components/DatePicker.tsx` — reusable date picker exists, but its current full week/month presentation is larger than the compact reference control.
- `app/globals.css` — admin surfaces, dark mode tokens, and composer classes live here; likely needed for a compact dark segmented-card treatment.
- `app/components/AdminView.test.tsx` — already covers Enter and Add Task submission; should be updated for placeholder text, compact date/priority controls, no Add Tag control, and date selection behavior.
- `hooks/useWeeklyTasks.test.tsx` — only needed if task insertion semantics change to support adding into a date outside the currently loaded week.

### Approaches
1. **Restyle and extend the existing admin composer** — Keep the current `AdminView`/`WeeklyTaskOrganizer` state flow, replace the composer markup with a compact two-row dark card, add a local date selector control that maps chosen dates to `selectedDate` + `currentAdminDay`, reuse/adjust `PrioritySelector`, and omit Add Tag entirely.
   - Pros: Lowest architectural risk, keeps Firebase model unchanged, preserves existing tests and add-task flow, likely within the 400-line review budget.
   - Cons: Compact date control may need custom UI instead of the existing large `DatePicker`; changing selected date/day as part of compose may affect the surrounding admin context.
   - Effort: Medium

2. **Create a dedicated `AddTaskComposer` component** — Extract composer UI/state props from `AdminView` into a focused component with compact date and priority controls, then keep `WeeklyTaskOrganizer` as the owner of state and submission.
   - Pros: Cleaner separation, easier focused tests, avoids further growing `AdminView`, makes the reference-image component reusable.
   - Cons: Slightly more file churn; still requires integration changes in `AdminView` and possibly date/day coordination in `WeeklyTaskOrganizer`.
   - Effort: Medium

3. **Extend the task model with `dueDate`** — Add a persisted `dueDate` field to tasks and let the composer store date independently from week/day placement.
   - Pros: Explicit due-date field could support future filtering.
   - Cons: Conflicts with current model where week/day path is the scheduling source of truth; requires Firebase data-model updates, migration/design docs, and wider task rendering implications.
   - Effort: High

### Recommendation
Use approach 2 if the proposal phase can include a small component extraction; otherwise approach 1 is acceptable. The best implementation is a dedicated `AddTaskComposer` used by `AdminView`, with `WeeklyTaskOrganizer` still owning `newTaskText`, `priority`, selected date/day coordination, and submission. Keep the task model unchanged: choosing a due date should choose the task's target week/day, not write a new `dueDate` field.

For the reference functionality, the date control should default to Today, display `Today` when the selected composer date is the current date, and otherwise display a short date label. Selecting a date should update both `selectedDate` and `currentAdminDay` so the existing `addTask(day, text, priority)` path remains valid. Priority should remain `high | medium | low`, with Medium as the current default. Do not add any Add Tag UI or state.

### Risks
- If the date selector is expected to add tasks to a date outside the currently selected week without navigating the admin view, `useWeeklyTasks.addTask()` cannot currently persist to another week path; that would require hook changes.
- Reusing the existing `DatePicker` directly may not match the compact reference due to its larger week/month UI and adjacent previous/next-week buttons.
- The reference uses a dark compact card; this app has admin-mode CSS variables and light/dark themes, so implementation should avoid hard-coded colors that break light mode or contrast.
- Existing icon dependency is `lucide-react`; adding a new icon library would be unnecessary bundle churn. Use existing Lucide icons such as `Calendar`, `Flag`, and `ChevronDown`.

### Ready for Proposal
Yes — tell the user the change is feasible without altering the Firebase task model. The proposal should define the composer as an admin add-task UI update with compact date and priority controls, no tag support, tests first due strict TDD, and no implementation of persisted tags or a new `dueDate` field unless explicitly requested later.

---

## Exploration: Add task composer timed calendar amendment

### Current State
The active `add-task-component-reference-image` change is implemented but uncommitted. It created `AddTaskComposer` with a text input, native date input defaulting from `WeeklyTaskOrganizer.selectedDate`, a segmented radio-style priority control, and a submit button. `WeeklyTaskOrganizer` initializes `selectedDate` to today on client mount and maps composer date changes to `currentAdminDay`, so the existing Firebase week/day path model is preserved.

Priority colors currently live in `PrioritySelector`: High uses `text-red-500`, Medium uses `text-orange-500`, and Low uses `text-green-500` on the old circle indicator. The new composer currently renders uncolored flag icons inside a radiogroup, so it does not satisfy the follow-up requirement for a dropdown or matching flag colors.

Tasks already support optional Google Calendar metadata via `task.calendarEvent = { eventId, date, startTime, endTime, lastSynced }`. Google Calendar integration already supports timed events: `CalendarEventPayload` has `startTime`, `endTime`, and `timeZone`; `calendarClient.createTaskEventForRamon()` posts to `/api/google/calendar/events`; `googleCalendar.createGoogleCalendarEventForUser()` creates timed Google events when `payload.startTime` is present. Current `addTask(day, text, priority)` only writes `id`, `text`, `completed`, and `priority`, and it does not return the created task ID or accept calendar metadata.

### Affected Areas
- `openspec/changes/add-task-component-reference-image/*` — existing proposal/spec/design/tasks should be amended because the change is active, uncommitted, and the verify report explicitly says scope can be amended.
- `app/components/AddTaskComposer.tsx` — must change priority from segmented radios to a dropdown, color the selected/option flags, and add optional time selection while keeping no Add Tag UI.
- `app/components/PrioritySelector.tsx` — best source for the old priority color mapping; can be extended with a compact flag variant or share exported priority option metadata.
- `app/components/WeeklyTaskOrganizer.tsx` — owns composer state and Google connection state; needs submit orchestration for optional time + connected Google Calendar.
- `hooks/useWeeklyTasks.ts` — needs a minimal task creation extension so new tasks can be persisted with `calendarEvent` metadata and/or expose the created task ID without changing Firebase paths.
- `types/index.ts` — already has `calendarEvent`, `CalendarEventPayload.startTime`, and `endTime`; may only need composer prop/draft types if introduced.
- `lib/calendarMapper.ts` — already maps task/day/date/time to `CalendarEventPayload`; should be reused for composer-created timed events.
- `lib/calendarClient.ts`, `lib/googleCalendar.ts`, `app/api/google/calendar/events/route.ts` — already support authenticated timed event creation; likely no API contract change needed.
- `app/components/AdminView.test.tsx`, `hooks/useWeeklyTasks.test.tsx`, and calendar mapper/client/API tests if touched — strict TDD requires new tests for dropdown priority, time selection, calendar-connected submit, and schema preservation.

### Approaches
1. **Amend the active composer change** — Update the existing OpenSpec artifacts and current implementation plan to cover the priority dropdown, colored flags, optional time, and connected-calendar submit flow.
   - Pros: Best matches the uncommitted working tree, keeps one active SDD trail, avoids duplicating composer context, and verify report says scope amendment is safe.
   - Cons: The original forecast was already near 400 changed lines; this amendment will likely push the single PR beyond the review budget unless the implementation is kept very tight.
   - Effort: Medium

2. **Create a separate follow-up change** — Leave the existing composer change as verified and create a new OpenSpec change for timed calendar scheduling and dropdown refinement.
   - Pros: Cleaner review budget and preserves the original verified scope.
   - Cons: Awkward because the implementation is not committed; it splits directly related composer behavior across two active changes and may force re-verification of overlapping files anyway.
   - Effort: Medium

3. **Add a persisted due-date/time model** — Introduce explicit task due date/time fields independent of the week/day path and sync those to Calendar.
   - Pros: More explicit long-term scheduling model.
   - Cons: Violates the constraint unless exploration proves it necessary; current week/day plus `calendarEvent.date/startTime/endTime` already covers the requested behavior.
   - Effort: High

### Recommendation
Amend the existing `add-task-component-reference-image` OpenSpec artifacts rather than creating a separate change. The current change is active, uncommitted, directly owns the composer, and the verified implementation already has most required plumbing except dropdown/time/calendar-submit behavior.

Use a minimal extension, not a model redesign: keep task placement in `users/{uid}/weeks/YYYY/WW/{Day}` and store time/calendar linkage only in the existing optional `task.calendarEvent`. Change the priority control to a dropdown menu and reuse the old color mapping exactly: High = `text-red-500`, Medium = `text-orange-500`, Low = `text-green-500`, applied to the flag icon. Preserve the existing circle treatment for other uses or make the indicator configurable so `TaskItem` editing does not regress.

For timed creation, add optional composer time state (`startTime`, optionally `endTime`) in `WeeklyTaskOrganizer` and pass it to `AddTaskComposer`. On submit, if a start time is selected and Google Calendar is connected, build a `CalendarEventPayload` via `taskToCalendarEvent(currentAdminDay, draftTask, startTime, endTime, selectedDate, userTimeZone)`, call `createTaskEventForRamon`, then persist the task with `calendarEvent` metadata. This requires a small `useWeeklyTasks` task-creation extension (for example, an optional calendar metadata argument and/or a returned created task ID), but no Firebase path migration and no new `dueDate` field.

### Risks
- Calendar creation + Firebase persistence can partially fail; design should define whether a failed Google call blocks task creation or creates the task without `calendarEvent` and alerts the user.
- Creating the Google event before Firebase save can orphan a Calendar event if Firebase save fails; saving first then updating metadata can leave a task without Calendar metadata if the event call fails. The proposal/design should choose and document the failure behavior.
- The current `googleCalendarEventTime` helper builds UTC-looking date-times while also passing a time zone; existing behavior works in tests but timed composer tests should guard expected local date/time payloads.
- Amending this change will likely exceed the original 400-line forecast; the orchestrator should either accept the single-pr strategy explicitly or keep the implementation narrow.
- A native `type="date"` plus `type="time"` UI may vary by browser; tests should assert accessible behavior, not visual picker internals.

### Ready for Proposal
Yes — tell the user this should be an amendment to the existing active OpenSpec change, not a separate follow-up, because the implementation is uncommitted and the current composer already owns the relevant surface. The proposal should explicitly add dropdown priority, matching flag colors, default-today date, optional time selection, connected Google Calendar event creation, existing `calendarEvent` metadata use, no `dueDate`, no Add Tag, and strict TDD coverage.
