# Proposal: Add Task Composer Matching Reference

## Intent

Replace the admin add-task row with a compact reference-matching composer that supports task text, date, time, priority, and optional Google Calendar assignment without changing the Firebase week/day scheduling model.

## Scope

### In Scope
- Render a compact two-row composer with text input, date defaulted to today, optional time selection, priority dropdown, and `Add Task` action.
- Priority MUST be selected from a dropdown menu; its flag icon MUST reuse existing colors: High `text-red-500`, Medium `text-orange-500`, Low `text-green-500`.
- Preserve no Add Tag UI/state/functionality.
- Keep week/day Firebase path as source of truth; do not add `dueDate`.
- If time is selected and Google Calendar is connected, create/link a timed calendar event using existing `calendarEvent` metadata.
- Update tests first for UI behavior, date/time defaults, and calendar-connected submission.

### Out of Scope
- Tags, tag management, or Add Tag affordances.
- Firebase path migrations, new `dueDate`, or unrelated task model redesign.
- New calendar APIs, OAuth changes, or new UI/icon packages.

## Capabilities

### New Capabilities
- `admin-task-composer`: Admin users can add tasks from a compact composer with text, today-defaulted date, optional time, dropdown priority with colored flags, and conditional Google Calendar linking.

### Modified Capabilities
- None — no existing OpenSpec specs are present.

## Approach

Use/extend `AddTaskComposer` while `WeeklyTaskOrganizer` owns draft state, selected date/day mapping, Google connection state, and submit orchestration. Reuse existing week/day helpers and `calendarEvent` shape. Minimally extend `useWeeklyTasks.addTask` to accept calendar metadata and/or return the created ID. On timed submit with Calendar connected, build a timed payload through existing calendar mapping/client paths, then persist the task with event metadata; if no time or no connection, create a normal task.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/components/AddTaskComposer.tsx` | Modified | Date default, time input, priority dropdown, colored flags. |
| `app/components/WeeklyTaskOrganizer.tsx` | Modified | Coordinate date/day/time and calendar-connected submit flow. |
| `hooks/useWeeklyTasks.ts` | Modified | Minimal creation extension for `calendarEvent` metadata/created ID. |
| `lib/calendarMapper.ts` | Modified | Reuse/adjust timed event payload mapping if needed. |
| `app/components/*.test.tsx`, `hooks/*.test.tsx` | Modified | Strict TDD coverage for amended behavior. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Calendar event and Firebase task can partially fail | Medium | Design explicit fallback: keep task creation safe and surface sync failure. |
| Timed date/time timezone drift | Medium | Reuse existing mapper/client tests and assert local date/time payloads. |
| Single PR exceeds 400-line review budget | Medium | Keep implementation narrow; avoid unrelated refactors. |

## Rollback Plan

Revert composer, submit-flow, hook, mapper, and test changes. No data migration rollback is required because Firebase paths remain unchanged and `calendarEvent` is already optional.

## Dependencies

- Existing Google Calendar connection and event APIs.
- Existing `calendarEvent` task metadata and `lucide-react` icons.
- Strict TDD from `openspec/config.yaml`.

## Success Criteria

- [ ] Date defaults to today and optional time can be selected.
- [ ] Priority is a dropdown with correctly colored flag indicators.
- [ ] Timed tasks create/link Google Calendar events when connected.
- [ ] Untimed or disconnected submissions still create normal tasks.
- [ ] No `dueDate`, tag UI, Firebase path migration, or new package is introduced.
