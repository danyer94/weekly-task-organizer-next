# Admin Task Composer Specification

## Purpose

Defines the admin-only composer for creating week/day scheduled tasks with text, date, optional time, priority, and conditional Google Calendar linkage while preserving the existing Firebase path model.

## Requirements

### Requirement: Task Text Entry

The system MUST provide an editable task-description input before submission.

#### Scenario: Enter task text

- GIVEN an admin is viewing the task composer
- WHEN the admin types `Prepare weekly report`
- THEN the composer shows `Prepare weekly report` as pending task text

### Requirement: Date Selection

The system MUST provide a date control defaulted to the current day and MUST map the selected date to the corresponding week/day task path.

#### Scenario: Default date is Today

- GIVEN the task composer is first rendered
- WHEN no date has been selected
- THEN the date control shows Today as the target date

#### Scenario: Select another date

- GIVEN the composer date control is available
- WHEN the admin chooses another valid date
- THEN task creation targets that date's week/day path

### Requirement: Priority Selection

The system MUST provide priority as a dropdown menu, MUST default to Medium, and MUST show flag colors: High `text-red-500`, Medium `text-orange-500`, Low `text-green-500`.

#### Scenario: Default priority is Medium

- GIVEN the task composer is first rendered
- WHEN no priority has been selected
- THEN the priority dropdown shows Medium with an orange flag

#### Scenario: Select another priority

- GIVEN the priority dropdown is open
- WHEN the admin selects High or Low
- THEN the composer uses the selected priority for the pending task
- AND the flag color matches the selected priority

### Requirement: Time Selection

The system MUST allow selecting an optional task time and MUST treat no time as an untimed task.

#### Scenario: Select time

- GIVEN the composer is visible
- WHEN the admin selects `14:30`
- THEN the pending task includes `14:30` as its selected time

#### Scenario: No time selected

- GIVEN task text, date, and priority are valid
- WHEN the admin submits without selecting a time
- THEN the task is created without calendar event creation

### Requirement: Add Task Submission

The system MUST submit a task using entered text, selected date, selected priority, and optional selected time.

#### Scenario: Submit valid task

- GIVEN task text is non-empty and date and priority are selected
- WHEN the admin activates Add Task
- THEN a task is created for the selected week/day with the selected priority
- AND the composer clears the submitted task text

#### Scenario: Submit with keyboard

- GIVEN task text is non-empty
- WHEN the admin submits using the existing Enter-key behavior
- THEN the task is created with the current composer date and priority

### Requirement: Conditional Google Calendar Linking

The system MUST create and connect a Google Calendar event only when a time is selected and Google Calendar is connected, using the existing calendar integration and task `calendarEvent` metadata.

#### Scenario: Timed task with connected Calendar

- GIVEN Google Calendar is connected and task time is selected
- WHEN the admin submits a valid task
- THEN a Google Calendar event is created through the existing integration
- AND the persisted task includes calendar metadata for that event

#### Scenario: Calendar disconnected

- GIVEN Google Calendar is not connected and task time is selected
- WHEN the admin submits a valid task
- THEN the task is created without a calendar event
- AND no calendar metadata is required

#### Scenario: Calendar creation fails

- GIVEN Google Calendar is connected and task time is selected
- WHEN calendar event creation fails during submission
- THEN task creation still succeeds without calendar metadata
- AND the admin can identify that calendar linking failed

### Requirement: No Add Tag Affordance

The system MUST NOT render Add Tag UI, tag state, or tag submission behavior in the composer.

#### Scenario: Composer excludes tags

- GIVEN the task composer is rendered
- WHEN the admin reviews available controls
- THEN no Add Tag button, tag field, or tag selector is present

### Requirement: Empty Input Validation

The system MUST prevent creation of tasks with empty or whitespace-only text and SHOULD provide accessible feedback or disabled submission state.

#### Scenario: Empty submit is blocked

- GIVEN the task text is empty or whitespace-only
- WHEN the admin activates Add Task
- THEN no task is created
- AND the admin can identify that task text is required

### Requirement: Accessibility and Focus Basics

The system MUST expose accessible names for text, date, time, priority, and Add Task controls, MUST preserve logical keyboard focus order, and MUST show visible focus states.

#### Scenario: Keyboard operation

- GIVEN the admin uses keyboard navigation
- WHEN focus moves through the composer
- THEN focus visits text input, date, time, priority dropdown, and Add Task in a logical order
- AND each focused control has a visible focus indicator

### Requirement: Existing Firebase Model Preservation

The system MUST NOT add task tags, a `dueDate` field, or any Firebase path/schema migration; scheduling MUST remain represented by the selected week/day path plus optional existing `calendarEvent` metadata.

#### Scenario: Persist without schema change

- GIVEN the admin submits a valid task
- WHEN the task is persisted
- THEN persisted task data remains compatible with existing task fields and the week/day path model
- AND no tag or `dueDate` field is written
