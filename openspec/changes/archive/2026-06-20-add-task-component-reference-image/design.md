# Design: Add Task Composer Matching Reference

## Technical Approach

Amend the existing extracted `AddTaskComposer` flow. `WeeklyTaskOrganizer` continues to own task text, selected date, derived day, priority, optional time, Google connection state, and submit orchestration. The composer becomes a compact accessible form with text, date defaulted to today, optional `type="time"`, a dropdown priority menu, and `Add Task`. Scheduling remains the Firebase week/day path; no Add Tag or `dueDate` field is introduced. Timed creation uses existing `taskToCalendarEvent`, `createTaskEventForRamon`, and `Task.calendarEvent` metadata.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Priority UI | Native/custom listbox dropdown with `Flag` icon colors: high red, medium orange, low green | Current segmented radiogroup | Requirement explicitly says dropdown; existing `PrioritySelector` already proves dropdown/listbox pattern and color mapping. |
| Time model | Composer state stores optional `startTime`; derive `endTime` only for calendar payload when needed | Persist generic due time/dueDate | Existing task schema only supports time inside optional `calendarEvent`; no schema/path migration. |
| Calendar order | Try Google event first only when `startTime && isGoogleConnected`, then persist task with metadata; on event failure persist normal task | Save task first then patch metadata | Avoids a visible task requiring a second update in the success path. Failure fallback satisfies “task creation still works”; Firebase failure after event remains a small orphan-event risk. |
| Hook change | Extend `addTask` to accept optional `calendarEvent` and return/await created task | New calendar API or direct Firebase writes in component | Keeps persistence business logic in `useWeeklyTasks` and reuses `createTaskId()`. |

## Data Flow

```text
AddTaskComposer
 ├─ text ─────────────▶ newTaskText
 ├─ date ─────────────▶ selectedDate + currentAdminDay via DAYS[(getDay()+6)%7]
 ├─ time? ────────────▶ newTaskStartTime
 ├─ priority dropdown ▶ priority
 └─ submit/Enter ────▶ handleAddTask()

handleAddTask
 ├─ trim/validate text; build draft Task without dueDate/tags
 ├─ if no time OR Calendar disconnected: addTask(day,text,priority)
 ├─ if time + connected:
 │   ├─ payload = taskToCalendarEvent(day,draft,startTime,undefined,selectedDate,tz)
 │   ├─ createTaskEventForRamon(payload)
 │   ├─ success: addTask(day,text,priority,{eventId,date,startTime,endTime,lastSynced})
 │   └─ failure: console.warn/alert non-blocking; addTask(day,text,priority)
 └─ clear text and time after successful task persistence attempt
```

Calendar disconnected or event creation failure MUST NOT block task creation. Persisted metadata uses existing shape only: `{ eventId, date, startTime, endTime, lastSynced }`; omit `calendarEvent` when not linked.

## File Changes

| File | Action | Description |
|---|---|---|
| `app/components/AddTaskComposer.tsx` | Modify | Replace segmented priority with dropdown; add optional time input; expose labels `New task`, `Task date`, `Task time`, `Task priority`, `Add Task`; apply flag color classes. |
| `app/components/AdminView.tsx` | Modify | Add `taskTime`, `onTaskTimeChange`, and optional calendar-linking status props pass-through. |
| `app/components/WeeklyTaskOrganizer.tsx` | Modify | Add `newTaskStartTime` state; update submit to branch on `isGoogleConnected`; use `taskToCalendarEvent` and `createTaskEventForRamon`; fallback to plain add on failure. |
| `hooks/useWeeklyTasks.ts` | Modify | Change `addTask(day,text,priority,calendarEvent?)` to create a `Task`, persist optional metadata, and return `Promise<Task | null>` or created task synchronously after `updateTasks`. |
| `types/index.ts` | No schema change | Reuse `Priority`, `Task.calendarEvent`, and `CalendarEventPayload`. Add local prop types only if helpful. |
| `lib/calendarMapper.ts`, `lib/calendarClient.ts`, `app/api/google/calendar/events/route.ts` | No API change expected | Already support timed payloads and authenticated event creation. Touch only if tests expose a mapper bug. |
| `app/components/AdminView.test.tsx`, `hooks/useWeeklyTasks.test.tsx`, `lib/calendarMapper.test.ts` if added | Modify/Create | Cover dropdown/time/calendar fallback behavior. |

## Interfaces / Contracts

```ts
interface AddTaskComposerProps {
  taskText: string;
  onTaskTextChange(text: string): void;
  selectedDate: Date;
  onDateChange(date: Date): void;
  startTime: string; // "" means untimed
  onStartTimeChange(time: string): void;
  priority: Priority;
  onPriorityChange(priority: Priority): void;
  onSubmit(): void | Promise<void>;
  isSubmitting?: boolean;
}
```

Priority options should be shared or duplicated as constant metadata: `[{ high, "High", "text-red-500" }, ...]`. Submit must never write `tags`, `Add Tag`, or `dueDate`.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Component | Dropdown opens/selects priorities with colored flags; date defaults Today; time can be selected; no Add Tag | RTL tests in `AdminView.test.tsx` or new focused composer tests. |
| Hook | `addTask` persists optional `calendarEvent` and omits it when not supplied; no `dueDate` | Extend `hooks/useWeeklyTasks.test.tsx`. |
| Integration | Connected timed submit calls calendar client then persists metadata; disconnected/failing calendar persists normal task and alerts/warns | Mock `calendarClient` in component/container tests. |

Strict TDD applies. Run focused tests first, then `npm run test`, `npm run lint`, and `npm run build`.

## Migration / Rollout

No migration required. Rollback is limited to composer, submit-flow, hook, and tests.

## Open Questions

- [ ] Should the composer display a subtle “Calendar link failed” inline status instead of `alert()`? Existing flows use alerts, so alerts are acceptable unless UX direction changes.
