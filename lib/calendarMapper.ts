import { format, startOfWeek, addDays, getWeek, getYear } from "date-fns";

/**
 * Helper to format a Date into YYYY-MM-DD.
 */
const toDateString = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

/**
 * Get the Firebase path for a given date's week.
 * Format: weeks/YYYY/WW
 */
export const getWeekPath = (date: Date): string => {
  const weekNum = getWeek(date, { weekStartsOn: 1 }); // Monday start
  const year = getYear(date);
  return `weeks/${year}/${String(weekNum).padStart(2, "0")}`;
};

/**
 * Get the actual date for a specific Day string within a given week.
 */
export const getDateForDayInWeek = (baseDate: Date, day: Day): Date => {
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday
  const dayIndexMap: Record<Day, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };
  return addDays(weekStart, dayIndexMap[day]);
};

/**
 * Maps a Task + Day + Context Date to a simple CalendarEventPayload.
 */
export const taskToCalendarEvent = (
  day: Day,
  task: Task,
  startTime?: string,
  endTime?: string,
  contextDate: Date = new Date()
): CalendarEventPayload => {
  const eventDate = getDateForDayInWeek(contextDate, day);

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
  tasks: Task[],
  contextDate: Date = new Date()
): CalendarEventPayload[] => {
  return tasks.map((task) =>
    taskToCalendarEvent(day, task, undefined, undefined, contextDate)
  );
};
