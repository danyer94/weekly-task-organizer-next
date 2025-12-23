import { Task, Day, CalendarEventPayload } from "@/types";

/**
 * Helper to format a Date into YYYY-MM-DD (calendar all‑day event format).
 * Uses local timezone to avoid UTC conversion issues that can change the date.
 */
const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Maps a Task + Day to a simple CalendarEventPayload.
 * For now we treat tasks as all‑day events on the given weekday
 * of the current week (or next, if today is past that day).
 *
 * @param day - The day of the week
 * @param task - The task to convert
 * @param startTime - Optional start time in HH:mm format (24-hour)
 * @param endTime - Optional end time in HH:mm format (24-hour)
 */
export const taskToCalendarEvent = (
  day: Day,
  task: Task,
  startTime?: string,
  endTime?: string
): CalendarEventPayload => {
  const today = new Date();

  // Map Day string to a day index (0 = Sunday ... 6 = Saturday)
  const dayIndexMap: Record<Day, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 0,
  };

  const targetDayIndex = dayIndexMap[day];
  const currentDayIndex = today.getDay();

  // Compute the date for the next occurrence of the requested day
  let diff = targetDayIndex - currentDayIndex;
  if (diff < 0) {
    diff += 7;
  }

  const eventDate = new Date(today);
  eventDate.setDate(today.getDate() + diff);

  return {
    summary: task.text,
    description: `Weekly Task (${day})`,
    date: toDateString(eventDate),
    startTime,
    endTime,
  };
};

/**
 * Convenience helper to map all tasks of a given day to calendar payloads.
 */
export const tasksForDayToCalendarEvents = (
  day: Day,
  tasks: Task[]
): CalendarEventPayload[] => {
  return tasks.map((task) => taskToCalendarEvent(day, task));
};
