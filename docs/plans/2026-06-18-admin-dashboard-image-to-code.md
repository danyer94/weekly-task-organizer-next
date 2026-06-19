# Implement the approved Admin dashboard redesign

Translate the approved light and dark references into the existing Admin dashboard without changing business logic, data contracts, routes, labels, or supported actions. The implementation remains a Tailwind v4 and CSS-variable product interface; no marketing-page framework, GSAP layer, or second design system will be introduced.

## Quick path

1. Lock current Admin behavior with focused component tests.
2. Recompose the existing `AdminView` markup around the approved desktop grid.
3. Replace glass and gradient styling with the reference's border-led light/dark tokens.
4. Refine the shared header and supporting controls without changing their contracts.
5. Verify behavior, responsiveness, both themes, and visual fidelity in Browser.

## Source of truth

| Concern | Authority |
| --- | --- |
| Light visual design | `output/imagegen/admin-dashboard-redesign-final-light.png` |
| Dark visual design | `output/imagegen/admin-dashboard-redesign-final-dark.png` |
| Supported functionality and labels | Current rendered Admin dashboard and existing component props |
| Business behavior | `hooks/useWeeklyTasks.ts`, calendar/Firebase libraries, and existing callbacks |
| Typography | Existing IBM Plex Sans / IBM Plex Mono setup in `app/layout.tsx` |
| Implementation foundation | Existing Tailwind v4 utilities plus semantic rules in `app/globals.css` |

## Design plan

<design_plan>
Python RNG execution:
seed = 114
shell_architecture = "left-operational-plus-right-schedule"
font_candidate = "Satoshi"; production choice = existing IBM Plex Sans to preserve the project font contract and avoid a gratuitous dependency
components = ["schedule-stack", "week-rail", "task-workspace"]
motion = ["tactile-state-feedback", "hover-depth"]

Dashboard adaptation:
- AIDA and hero rules are not applicable to this product interface.
- GSAP is intentionally excluded. Motion intensity is 2/10 and only communicates hover, focus, pressed, disabled, and state transitions.
- The approved reference already defines layout and art direction; deterministic randomization cannot override it.
- No marketing navigation, invented analytics, fake schedules, tags, categories, or quick-action widgets will be added.
</design_plan>

### Design read

- **Person:** an Admin coordinating tasks and calendar context during the workday.
- **Primary verb:** create, schedule, move, group, select, notify, and clear weekly tasks.
- **Feel:** calm precision instrument, not a marketing page and not a glass control room.
- **Mode:** redesign-overhaul visually, preserve information architecture and behavior.
- **Dials:** `DESIGN_VARIANCE: 4`, `MOTION_INTENSITY: 2`, `VISUAL_DENSITY: 6`.

### Product-domain direction

| Area | Decision |
| --- | --- |
| Domain concepts | weekly cadence, command center, selected day, time plan, priority, completion, broadcast |
| Color world | paper white, midnight navy, calendar cobalt, completion teal, priority amber, graphite dividers |
| Signature | the cobalt selected-day tile with a downward pointer, paired with a persistent Schedule context rail |
| Depth strategy | borders first, whisper-quiet tinted shadows only where hierarchy needs lift |
| Shape system | 10-12px panels and controls; compact circular icon affordances only where semantically appropriate |
| Spacing unit | 4px base; primary rhythm at 8, 12, 16, 24, and 32px |
| Type | IBM Plex Sans for UI; IBM Plex Mono only for existing data-oriented microcopy where already used |

### Defaults being rejected

| Default | Replacement |
| --- | --- |
| Glass panels and ambient gradients | opaque semantic surfaces with subtle borders |
| Centered generic dashboard cards | asymmetric operational left column plus persistent schedule rail |
| Decorative motion | fast hover, focus, pressed, and state feedback only |
| Invented widgets | only the controls already rendered by the app |
| Mixed responsive ordering | explicit mobile order: command, composer, management, tasks, schedule |

## Extracted visual system

The reference canvas is 1536x1024. Desktop composition uses approximately 28px outer gutters, a 3:1 main grid, and a 14-16px inter-column gap.

### Light tokens

| Token | Target |
| --- | --- |
| Canvas | near-white `#FCFCFD` |
| Primary surface | `#FFFFFF` |
| Secondary surface | `#F7F9FC` |
| Primary text | deep navy near `#0A1833` |
| Secondary text | muted blue-gray near `#667695` |
| Border | cool gray near `#DDE3EC` |
| Accent | cobalt near `#0862F4` |
| Success | teal near `#009E72` |
| Warning | amber near `#E89A08` |

### Dark tokens

| Token | Target |
| --- | --- |
| Canvas | near-black navy near `#06101E` |
| Primary surface | navy near `#0B1625` |
| Secondary surface | navy near `#0E1928` |
| Primary text | soft white near `#F4F7FB` |
| Secondary text | blue-gray near `#AAB6CA` |
| Border | blue graphite near `#33435E` |
| Accent | cobalt near `#0755EF` |
| Success | teal near `#00B77D` |
| Warning | amber near `#F0A000` |

### Structural proportions

- App header: 72-80px desktop height, one line, brand left and controls right.
- Command panel: title/progress left, compact day metrics and view switch right.
- Composer: one 48-52px row with priority, flexible input, and primary action.
- Management panel: date navigation plus totals, seven-day rail, four real actions.
- Workspace: task panel roughly 74% of content width; Schedule context roughly 26%.
- Mobile: single column; week rail scrolls horizontally; actions wrap into a two-column then single-column grid.

## Scope boundaries

### Must change

- `app/components/AdminView.tsx`
- `app/globals.css`
- `app/components/WeeklyTaskOrganizer.tsx`
- `app/components/ThemeToggle.tsx`
- `app/components/TaskList.tsx`
- `app/components/AdminView.test.tsx` (new)

### Change only if visual verification proves necessary

- `app/components/PrioritySelector.tsx`
- `app/components/DatePicker.tsx`
- `app/components/UserMenu.tsx`
- `app/components/TaskTimeline.tsx` markup and presentation only
- `app/components/TaskItem.tsx` presentation only

### Explicitly out of scope

- `hooks/useWeeklyTasks.ts`
- Firebase paths, task ID generation, or calendar update sequencing
- Routes, authentication, authorization, or Admin/User mode semantics
- Inactive `Sidebar.tsx`, `QuickActions.tsx`, `TaskStats.tsx`, `TaskViewToggle.tsx`
- Unimported root `tokens.css`
- Generated images under `output/imagegen/`
- New features, data, labels, or navigation

## Implementation tasks

### Task 1: Lock Admin behavior before visual changes

**File:** `app/components/AdminView.test.tsx`

- Create representative Admin props with controlled task and calendar data.
- Assert day and week counts, selected day, and current date context.
- Assert composer submission from Enter and Add Task.
- Assert previous/next week and weekday callbacks.
- Assert Send Daily Summary, Bulk Add, WhatsApp, and Clear Completed behavior.
- Assert selection toolbar conditions.
- Assert List, Timeline, and Both visibility without testing CSS class snapshots.
- Run the focused test and confirm RED for any missing test seam before implementation.

### Task 2: Recompose the Admin information hierarchy

**File:** `app/components/AdminView.tsx`

- Keep the current prop interface and callbacks unchanged.
- Build one semantic desktop grid with a left operational column and right schedule rail.
- Keep command panel, composer, management, and task workspace as distinct siblings rather than nested glass cards.
- Place Schedule context in the right column on desktop and after tasks on mobile.
- Preserve all existing labels and empty/list/timeline states.
- Add stable, semantic class hooks only where the token layer needs them.

### Task 3: Replace the Admin visual token layer

**File:** `app/globals.css`

- Replace `.admin-*` glass, blur, glow, and gradient rules with semantic opaque surfaces.
- Define light and `.dark` parity for canvas, surfaces, text, borders, accent, success, warning, and destructive states.
- Implement the selected-day pointer without adding decorative elements elsewhere.
- Standardize panel/control radii, focus rings, hover/pressed states, and disabled contrast.
- Add explicit mobile, tablet, desktop, and wide-desktop layouts.
- Honor `prefers-reduced-motion`; do not add automatic animation.

### Task 4: Match the shared product header

**Files:** `app/components/WeeklyTaskOrganizer.tsx`, `app/components/ThemeToggle.tsx`

- Widen the shell from `max-w-7xl` toward the reference while retaining safe gutters.
- Keep the existing logo/wordmark and Admin/User, sync, theme, and user controls.
- Preserve mobile compaction and the existing header offset calculations.
- Refine control grouping, borders, sizing, icon weight, and theme toggle treatment.
- Do not rename or reorder functional controls in a way that breaks accessibility or analytics.

### Task 5: Refine real empty and populated states

**Files:** `app/components/TaskList.tsx` and, only if required, `TaskTimeline.tsx` / `TaskItem.tsx`

- Match the reference's centered task empty state with existing copy.
- Keep loaded task rows, editing, completion, ordering, and timeline scheduling fully functional.
- Ensure populated states use the same surface, border, type, and focus system as empty states.
- Do not edit calendar classification or scheduling calculations.

### Task 6: Close responsive and accessibility gaps

- Confirm a single-column order below 768px.
- Make the weekday rail horizontally usable without clipping the active day.
- Keep all targets at least 40-44px where practical.
- Check keyboard focus, pressed/selected semantics, disabled controls, and contrast in both themes.
- Verify no desktop CTA wraps and no horizontal page overflow appears.

## Verification matrix

| Requirement | Evidence |
| --- | --- |
| Existing functionality preserved | New `AdminView` behavior tests and existing suite pass |
| Light reference matched | Browser screenshot at desktop compared with final light PNG |
| Dark reference matched | Browser screenshot at desktop compared with final dark PNG |
| Responsive structure works | Browser checks at 1536, 1280, 1024, 768, and 390px widths |
| Theme parity | Same hierarchy and affordance strength in light/dark |
| Accessibility | Keyboard walkthrough, visible focus, semantic selected states, contrast review |
| React quality | React Doctor diff scan reports no new errors |
| Production health | Lint, tests, and build succeed |

## Commands

```bash
npm test -- AdminView.test.tsx
npm test
npm run lint
npm run build
npx -y react-doctor@latest . --verbose --diff
```

## Review order

1. Review `AdminView.test.tsx` for preserved behavior.
2. Review `AdminView.tsx` for information hierarchy and unchanged contracts.
3. Review `globals.css` for token parity and reduced glass/gradient debt.
4. Review shared header/control changes.
5. Compare Browser screenshots against both final references.

## Acceptance checklist

- [ ] No functionality, label, count, navigation item, or widget exists unless the current app already supports it.
- [ ] All existing Admin actions and task/calendar flows still work.
- [ ] Desktop layout matches the approved left-operation/right-schedule composition.
- [ ] Light mode uses white, navy, cobalt, teal, and amber with restrained borders/shadows.
- [ ] Dark mode uses near-black navy surfaces with equal hierarchy and contrast.
- [ ] The selected day has the cobalt tile and downward pointer signature.
- [ ] Header remains one line at desktop and compact on mobile.
- [ ] Mobile ordering and horizontal weekday navigation are explicit and usable.
- [ ] No GSAP, marketing AIDA structure, fake data, extra design system, or decorative motion is introduced.
- [ ] Tests, lint, build, React Doctor, and Browser verification pass.

